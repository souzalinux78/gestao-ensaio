#!/bin/bash

# Script para executar migration 001 (Criar tabela Tenant) em produção
# USO: ./executar-migration-producao.sh

set -e  # Para na primeira erro

echo "=========================================="
echo "Migration 001: Criar Tabela Tenant"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "scripts/migrations/001-create-tenant-table.sql" ]; then
    echo -e "${RED}ERRO: Arquivo de migration não encontrado!${NC}"
    echo "Execute este script a partir do diretório raiz do projeto."
    exit 1
fi

# Carregar variáveis de ambiente
if [ -f .env ]; then
    source .env
    echo -e "${GREEN}✓ Variáveis de ambiente carregadas${NC}"
else
    echo -e "${YELLOW}⚠ Arquivo .env não encontrado${NC}"
    echo "Certifique-se de que DATABASE_URL está configurada."
fi

# Extrair informações do DATABASE_URL
# Formato: mysql://usuario:senha@host:porta/database
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERRO: DATABASE_URL não está definida!${NC}"
    echo "Configure a variável DATABASE_URL no arquivo .env"
    exit 1
fi

echo ""
echo "=========================================="
echo "ETAPA 1: Backup do Banco de Dados"
echo "=========================================="
echo ""

# Criar backup antes da migration
BACKUP_FILE="backup_pre_migration_001_$(date +%Y%m%d_%H%M%S).sql"
echo "Criando backup: $BACKUP_FILE"

# Extrair componentes do DATABASE_URL
DB_URL=$(echo $DATABASE_URL | sed 's|mysql://||')
DB_USER=$(echo $DB_URL | cut -d: -f1)
DB_PASS=$(echo $DB_URL | cut -d: -f2 | cut -d@ -f1)
DB_HOST=$(echo $DB_URL | cut -d@ -f2 | cut -d/ -f1 | cut -d: -f1)
DB_PORT=$(echo $DB_URL | cut -d@ -f2 | cut -d/ -f1 | cut -d: -f2)
DB_NAME=$(echo $DB_URL | cut -d/ -f2)

# Se DB_PORT está vazio, usar porta padrão
if [ -z "$DB_PORT" ]; then
    DB_PORT=3306
fi

echo "Host: $DB_HOST"
echo "Porta: $DB_PORT"
echo "Database: $DB_NAME"
echo ""

# Criar backup
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null || {
    echo -e "${YELLOW}⚠ Aviso: Não foi possível criar backup automático${NC}"
    echo "Execute manualmente:"
    echo "mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME > $BACKUP_FILE"
    echo ""
    read -p "Deseja continuar sem backup? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Migration cancelada."
        exit 1
    fi
}

if [ -f "$BACKUP_FILE" ]; then
    echo -e "${GREEN}✓ Backup criado: $BACKUP_FILE${NC}"
fi

echo ""
echo "=========================================="
echo "ETAPA 2: Verificar Estado Atual"
echo "=========================================="
echo ""

# Verificar se tabela Tenant já existe
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES LIKE 'Tenant';" 2>/dev/null | grep -q "Tenant" && {
    echo -e "${YELLOW}⚠ Tabela 'Tenant' já existe!${NC}"
    echo "A migration pode ter sido executada anteriormente."
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Migration cancelada."
        exit 1
    fi
} || {
    echo -e "${GREEN}✓ Tabela 'Tenant' não existe - prosseguindo${NC}"
}

echo ""
echo "=========================================="
echo "ETAPA 3: Executar Migration"
echo "=========================================="
echo ""

# Executar migration
echo "Executando migration 001-create-tenant-table.sql..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "scripts/migrations/001-create-tenant-table.sql" && {
    echo -e "${GREEN}✓ Migration executada com sucesso!${NC}"
} || {
    echo -e "${RED}✗ ERRO ao executar migration!${NC}"
    echo "Verifique os logs acima para detalhes."
    exit 1
}

echo ""
echo "=========================================="
echo "ETAPA 4: Verificar Migration"
echo "=========================================="
echo ""

# Verificar se tabela foi criada
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES LIKE 'Tenant';" 2>/dev/null | grep -q "Tenant" && {
    echo -e "${GREEN}✓ Tabela 'Tenant' criada com sucesso${NC}"
} || {
    echo -e "${RED}✗ ERRO: Tabela 'Tenant' não foi criada!${NC}"
    exit 1
}

# Verificar se tenant padrão foi criado
TENANT_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM Tenant WHERE slug = 'sistema-padrao';" 2>/dev/null)
if [ "$TENANT_COUNT" -eq "1" ]; then
    echo -e "${GREEN}✓ Tenant padrão 'Sistema Padrão' criado${NC}"
    
    # Mostrar ID do tenant padrão
    TENANT_ID=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -sN -e "SELECT id FROM Tenant WHERE slug = 'sistema-padrao';" 2>/dev/null)
    echo "   ID do tenant padrão: $TENANT_ID"
else
    echo -e "${YELLOW}⚠ Tenant padrão não encontrado ou múltiplos encontrados${NC}"
fi

echo ""
echo "=========================================="
echo "ETAPA 5: Resumo"
echo "=========================================="
echo ""
echo -e "${GREEN}✓ Migration 001 concluída com sucesso!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Execute a ETAPA 2: Adicionar tenantId ao Usuario"
echo "2. Execute a ETAPA 3: Adicionar tenantId aos modelos de dados"
echo "3. Execute a ETAPA 4: Migrar dados existentes"
echo ""
echo "Backup criado: $BACKUP_FILE"
echo ""
