#!/bin/bash

# Script para executar migration 003 (Adicionar tenantId aos modelos de dados) em produção
# USO: ./scripts/migrations/executar-migration-003.sh

set -e

echo "=========================================="
echo "Migration 003: Adicionar tenantId aos Modelos de Dados"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ ! -f "scripts/migrations/003-add-tenantId-to-models.sql" ]; then
    echo -e "${RED}ERRO: Arquivo de migration não encontrado!${NC}"
    exit 1
fi

if [ -f .env ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//")
    if [ -n "$DATABASE_URL" ]; then
        echo -e "${GREEN}✓ DATABASE_URL carregada do .env${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Arquivo .env não encontrado${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERRO: DATABASE_URL não está definida!${NC}"
    exit 1
fi

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

BACKUP_FILE="backup_pre_migration_003_$(date +%Y%m%d_%H%M%S).sql"
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

# Verificar se colunas já existem
TABLES=("Ensaio" "Musico" "Contato" "Instrumento" "Configuracoes")
EXISTING_COLS=0

for table in "${TABLES[@]}"; do
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -e "SHOW COLUMNS FROM $table LIKE 'tenantId';" 2>/dev/null | grep -q "tenantId"; then
        EXISTING_COLS=$((EXISTING_COLS + 1))
    fi
done

if [ "$EXISTING_COLS" -gt "0" ]; then
    echo -e "${YELLOW}⚠ $EXISTING_COLS tabela(s) já possuem coluna 'tenantId'!${NC}"
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ Nenhuma coluna 'tenantId' encontrada - prosseguindo${NC}"
fi

echo ""
echo "=========================================="
echo "ETAPA 3: Executar Migration"
echo "=========================================="
echo ""

echo "Executando migration 003-add-tenantId-to-models.sql..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" < "scripts/migrations/003-add-tenantId-to-models.sql" && {
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

# Verificar cada tabela
ALL_OK=true
for table in "${TABLES[@]}"; do
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -e "SHOW COLUMNS FROM $table LIKE 'tenantId';" 2>/dev/null | grep -q "tenantId"; then
        echo -e "${GREEN}✓ $table: coluna 'tenantId' criada${NC}"
    else
        echo -e "${RED}✗ $table: coluna 'tenantId' NÃO foi criada!${NC}"
        ALL_OK=false
    fi
done

if [ "$ALL_OK" = true ]; then
    echo ""
    echo -e "${GREEN}✓ Todas as colunas 'tenantId' foram criadas com sucesso!${NC}"
else
    echo ""
    echo -e "${RED}✗ ERRO: Algumas colunas não foram criadas!${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "ETAPA 5: Resumo"
echo "=========================================="
echo ""
echo -e "${GREEN}✓ Migration 003 concluída com sucesso!${NC}"
echo ""
echo "Tabelas atualizadas:"
echo "  - Ensaio"
echo "  - Musico"
echo "  - Contato"
echo "  - Instrumento"
echo "  - Configuracoes"
echo ""
echo "Próximos passos:"
echo "1. Execute a ETAPA 4: Migrar dados existentes para tenant padrão"
echo ""
echo "Backup criado: $BACKUP_FILE"
echo ""
