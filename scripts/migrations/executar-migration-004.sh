#!/bin/bash

# Script para executar migration 004 (Migrar dados existentes) em produção
# USO: ./scripts/migrations/executar-migration-004.sh

set -e

echo "=========================================="
echo "Migration 004: Migrar Dados para Tenant Padrão"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ ! -f "scripts/migrations/004-migrate-data-to-tenant.sql" ]; then
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
echo "ETAPA 1: Verificar Tenant Padrão"
echo "=========================================="
echo ""

TENANT_ID=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -sN -e "SELECT id FROM Tenant WHERE slug = 'sistema-padrao' LIMIT 1;" 2>/dev/null)

if [ -z "$TENANT_ID" ]; then
    echo -e "${RED}✗ ERRO: Tenant padrão não encontrado!${NC}"
    echo "Execute a migration 001 primeiro para criar o tenant padrão."
    exit 1
fi

echo -e "${GREEN}✓ Tenant padrão encontrado: ID = $TENANT_ID${NC}"

echo ""
echo "=========================================="
echo "ETAPA 2: Backup do Banco de Dados"
echo "=========================================="
echo ""

BACKUP_FILE="backup_pre_migration_004_$(date +%Y%m%d_%H%M%S).sql"
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
echo "ETAPA 3: Contar Dados Antes da Migração"
echo "=========================================="
echo ""

USUARIOS_ANTES=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM Usuario WHERE tenantId IS NULL;" 2>/dev/null)
ENSAIOS_ANTES=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM Ensaio WHERE tenantId IS NULL;" 2>/dev/null)
MUSICOS_ANTES=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM Musico WHERE tenantId IS NULL;" 2>/dev/null)
CONTATOS_ANTES=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM Contato WHERE tenantId IS NULL;" 2>/dev/null)

echo "Registros sem tenantId antes da migração:"
echo "  - Usuários: $USUARIOS_ANTES"
echo "  - Ensaios: $ENSAIOS_ANTES"
echo "  - Músicos: $MUSICOS_ANTES"
echo "  - Contatos: $CONTATOS_ANTES"

echo ""
echo "=========================================="
echo "ETAPA 4: Executar Migration"
echo "=========================================="
echo ""

echo "Executando migration 004-migrate-data-to-tenant.sql..."
echo -e "${YELLOW}⚠ Esta migration pode demorar alguns minutos dependendo da quantidade de dados${NC}"
echo ""

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" < "scripts/migrations/004-migrate-data-to-tenant.sql" && {
    echo ""
    echo -e "${GREEN}✓ Migration executada com sucesso!${NC}"
} || {
    echo ""
    echo -e "${RED}✗ ERRO ao executar migration!${NC}"
    exit 1
}

echo ""
echo "=========================================="
echo "ETAPA 5: Verificar Migração"
echo "=========================================="
echo ""

# Verificar se ainda há registros sem tenantId
USUARIOS_DEPOIS=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM Usuario WHERE tenantId IS NULL;" 2>/dev/null)
ENSAIOS_DEPOIS=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM Ensaio WHERE tenantId IS NULL;" 2>/dev/null)
MUSICOS_DEPOIS=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM Musico WHERE tenantId IS NULL;" 2>/dev/null)
CONTATOS_DEPOIS=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM Contato WHERE tenantId IS NULL;" 2>/dev/null)

TOTAL_SEM_TENANT=$((USUARIOS_DEPOIS + ENSAIOS_DEPOIS + MUSICOS_DEPOIS + CONTATOS_DEPOIS))

if [ "$TOTAL_SEM_TENANT" -eq "0" ]; then
    echo -e "${GREEN}✓ Todos os registros foram migrados!${NC}"
else
    echo -e "${YELLOW}⚠ Ainda há $TOTAL_SEM_TENANT registros sem tenantId:${NC}"
    echo "  - Usuários: $USUARIOS_DEPOIS"
    echo "  - Ensaios: $ENSAIOS_DEPOIS"
    echo "  - Músicos: $MUSICOS_DEPOIS"
    echo "  - Contatos: $CONTATOS_DEPOIS"
fi

# Verificar foreign keys
FK_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = '$DB_NAME' AND REFERENCED_TABLE_NAME = 'Tenant';" 2>/dev/null)

if [ "$FK_COUNT" -ge "6" ]; then
    echo -e "${GREEN}✓ Foreign keys criadas: $FK_COUNT${NC}"
else
    echo -e "${YELLOW}⚠ Apenas $FK_COUNT foreign keys encontradas (esperado: 6)${NC}"
fi

echo ""
echo "=========================================="
echo "ETAPA 6: Resumo"
echo "=========================================="
echo ""
echo -e "${GREEN}✓ Migration 004 concluída!${NC}"
echo ""
echo "Dados migrados:"
echo "  - Usuários: $USUARIOS_ANTES → $USUARIOS_DEPOIS sem tenantId"
echo "  - Ensaios: $ENSAIOS_ANTES → $ENSAIOS_DEPOIS sem tenantId"
echo "  - Músicos: $MUSICOS_ANTES → $MUSICOS_DEPOIS sem tenantId"
echo "  - Contatos: $CONTATOS_ANTES → $CONTATOS_DEPOIS sem tenantId"
echo ""
echo "Foreign keys criadas: $FK_COUNT"
echo ""
echo "Próximos passos:"
echo "1. Execute a ETAPA 5: Atualizar JWT para incluir tenantId"
echo "2. Execute a ETAPA 6: Criar middleware tenantResolver"
echo ""
echo "Backup criado: $BACKUP_FILE"
echo ""
