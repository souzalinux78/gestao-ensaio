#!/bin/bash

# Script para fazer backup do banco de dados
# Uso: ./scripts/backup-banco.sh

set -e

echo "💾 BACKUP DO BANCO DE DADOS"
echo "============================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Diretório de backups
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"

# Ler variáveis de ambiente do .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Extrair informações da DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL não encontrada no .env${NC}"
    exit 1
fi

# Parse DATABASE_URL (mysql://user:pass@host:port/dbname)
DB_URL=$(echo "$DATABASE_URL" | sed 's|mysql://||')
DB_USER=$(echo "$DB_URL" | cut -d: -f1)
DB_PASS=$(echo "$DB_URL" | cut -d: -f2 | cut -d@ -f1)
DB_HOST_PORT=$(echo "$DB_URL" | cut -d@ -f2 | cut -d/ -f1)
DB_HOST=$(echo "$DB_HOST_PORT" | cut -d: -f1)
DB_PORT=$(echo "$DB_HOST_PORT" | cut -d: -f2)
DB_NAME=$(echo "$DB_URL" | cut -d/ -f2 | cut -d? -f1)

# Se porta não especificada, usar padrão 3306
if [ -z "$DB_PORT" ] || [ "$DB_PORT" == "$DB_HOST" ]; then
    DB_PORT=3306
fi

echo "📊 Informações do banco:"
echo "   Host: $DB_HOST"
echo "   Porta: $DB_PORT"
echo "   Banco: $DB_NAME"
echo "   Usuário: $DB_USER"
echo ""

# Nome do arquivo de backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

echo "💾 Criando backup..."
echo "   Arquivo: $BACKUP_FILE"
echo ""

# Criar backup
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" \
    --single-transaction \
    --routines \
    --triggers \
    "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null

if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    # Comprimir backup
    echo "🗜️  Comprimindo backup..."
    gzip -f "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup criado com sucesso!${NC}"
    echo "   Arquivo: $BACKUP_FILE"
    echo "   Tamanho: $BACKUP_SIZE"
    echo ""
    
    # Listar últimos backups
    echo "📋 Últimos backups:"
    ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | tail -5 | awk '{print "   " $9 " (" $5 ")"}'
    echo ""
    
    # Limpar backups antigos (manter apenas últimos 10)
    echo "🧹 Limpando backups antigos (mantendo últimos 10)..."
    ls -t "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    echo -e "${GREEN}✅ Limpeza concluída${NC}"
    echo ""
else
    echo -e "${RED}❌ Erro ao criar backup${NC}"
    echo ""
    echo "Tente criar backup manualmente:"
    echo "mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME > $BACKUP_FILE"
    exit 1
fi

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}BACKUP CONCLUÍDO${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
