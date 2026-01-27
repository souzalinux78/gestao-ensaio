#!/bin/bash

# Script para executar migration 002 (Adicionar tenantId ao Usuario) em produção
# USO: ./scripts/migrations/executar-migration-002.sh

set -e  # Para na primeira erro

echo "=========================================="
echo "Migration 002: Adicionar tenantId ao Usuario"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "scripts/migrations/002-add-tenantId-to-usuario.sql" ]; then
    echo -e "${RED}ERRO: Arquivo de migration não encontrado!${NC}"
    echo "Execute este script a partir do diretório raiz do projeto."
    exit 1
fi

# Carregar variáveis de ambiente de forma segura
if [ -f .env ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//")
    if [ -n "$DATABASE_URL" ]; then
        echo -e "${GREEN}✓ DATABASE_URL carregada do .env${NC}"
    else
        echo -e "${YELLOW}⚠ DATABASE_URL não encontrada no .env${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Arquivo .env não encontrado${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERRO: DATABASE_URL não está definida!${NC}"
    exit 1
fi

# Extrair componentes do DATABASE_URL
DB_URL=$(echo "$DATABASE_URL" | sed 's|mysql://||' | cut -d'?' -f1)
DB_USER=$(echo "$DB_URL" | cut -d: -f1)
DB_PASS=$(echo "$DB_URL" | sed 's/^[^:]*://' | cut -d'@' -f1)
HOST_PORT=$(echo "$DB_URL" | sed 's/^[^@]*@//' | cut -d'/' -f1)
DB_HOST=$(echo "$HOST_PORT" | cut -d: -f1)
DB_PORT=$(echo "$HOST_PORT" | cut -d: -f2)
DB_NAME=$(echo "$DB_URL" | sed 's/^[^/]*\///')

if [ -z "$DB_PORT" ]; then
    DB_PORT=3306
fi

echo ""
echo "=========================================="
echo "ETAPA 1: Backup do Banco de Dados"
echo "=========================================="
echo ""

BACKUP_FILE="backup_pre_migration_002_$(date +%Y%m%d_%H%M%S).sql"
echo "Criando backup: $BACKUP_FILE"
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null || {
    echo -e "${YELLOW}⚠ Aviso: Não foi possível criar backup automático${NC}"
    read -p "Deseja continuar sem backup? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
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

# Verificar se coluna já existe
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -e "SHOW COLUMNS FROM Usuario LIKE 'tenantId';" 2>/dev/null | grep -q "tenantId" && {
    echo -e "${YELLOW}⚠ Coluna 'tenantId' já existe!${NC}"
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
} || {
    echo -e "${GREEN}✓ Coluna 'tenantId' não existe - prosseguindo${NC}"
}

echo ""
echo "=========================================="
echo "ETAPA 3: Executar Migration"
echo "=========================================="
echo ""

echo "Executando migration 002-add-tenantId-to-usuario.sql..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" < "scripts/migrations/002-add-tenantId-to-usuario.sql" && {
    echo -e "${GREEN}✓ Migration executada com sucesso!${NC}"
} || {
    echo -e "${RED}✗ ERRO ao executar migration!${NC}"
    exit 1
}

echo ""
echo "=========================================="
echo "ETAPA 4: Verificar Migration"
echo "=========================================="
echo ""

# Verificar se coluna foi criada
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -e "SHOW COLUMNS FROM Usuario LIKE 'tenantId';" 2>/dev/null | grep -q "tenantId" && {
    echo -e "${GREEN}✓ Coluna 'tenantId' criada com sucesso${NC}"
} || {
    echo -e "${RED}✗ ERRO: Coluna 'tenantId' não foi criada!${NC}"
    exit 1
}

# Verificar índices
INDEX_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = '$DB_NAME' AND TABLE_NAME = 'Usuario' AND INDEX_NAME LIKE '%tenantId%';" 2>/dev/null)
if [ "$INDEX_COUNT" -ge "2" ]; then
    echo -e "${GREEN}✓ Índices criados com sucesso ($INDEX_COUNT índices encontrados)${NC}"
else
    echo -e "${YELLOW}⚠ Apenas $INDEX_COUNT índices encontrados (esperado: 2+)${NC}"
fi

echo ""
echo "=========================================="
echo "ETAPA 5: Resumo"
echo "=========================================="
echo ""
echo -e "${GREEN}✓ Migration 002 concluída com sucesso!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Execute a ETAPA 3: Adicionar tenantId aos modelos de dados"
echo "2. Execute a ETAPA 4: Migrar dados existentes (inclui foreign key)"
echo ""
echo "Backup criado: $BACKUP_FILE"
echo ""
