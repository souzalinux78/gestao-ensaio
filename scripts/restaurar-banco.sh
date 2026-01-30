#!/bin/bash

# Script para restaurar backup do banco de dados
# Uso: ./scripts/restaurar-banco.sh [arquivo-backup.sql.gz]

set -e

echo "🔄 RESTAURAR BACKUP DO BANCO DE DADOS"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Diretório de backups
BACKUP_DIR="${BACKUP_DIR:-./backups}"

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

# Se arquivo não foi fornecido, listar backups disponíveis
if [ -z "$1" ]; then
    echo "📋 Backups disponíveis:"
    echo ""
    
    BACKUPS=$(ls -t "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null)
    
    if [ -z "$BACKUPS" ]; then
        echo -e "${YELLOW}⚠️  Nenhum backup encontrado em $BACKUP_DIR${NC}"
        echo ""
        exit 1
    fi
    
    echo "   # | Arquivo | Tamanho | Data"
    echo "   --|---------|---------|------"
    COUNT=1
    for backup in $BACKUPS; do
        FILENAME=$(basename "$backup")
        SIZE=$(du -h "$backup" | cut -f1)
        DATE=$(stat -c %y "$backup" 2>/dev/null | cut -d' ' -f1) || DATE="N/A"
        printf "   %d | %s | %s | %s\n" "$COUNT" "$FILENAME" "$SIZE" "$DATE"
        COUNT=$((COUNT + 1))
    done
    echo ""
    echo "Uso: ./scripts/restaurar-banco.sh <arquivo-backup.sql.gz>"
    echo "Exemplo: ./scripts/restaurar-banco.sh backups/backup_gestao_ensaio_20241201_120000.sql.gz"
    echo ""
    exit 0
fi

BACKUP_FILE="$1"

# Se arquivo não tem caminho completo, procurar em BACKUP_DIR
if [ ! -f "$BACKUP_FILE" ] && [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

# Verificar se arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Arquivo de backup não encontrado: $BACKUP_FILE${NC}"
    exit 1
fi

echo "📊 Informações do banco:"
echo "   Host: $DB_HOST"
echo "   Porta: $DB_PORT"
echo "   Banco: $DB_NAME"
echo "   Usuário: $DB_USER"
echo ""
echo "📁 Arquivo de backup:"
echo "   $BACKUP_FILE"
echo ""

# Confirmar restauração
echo -e "${YELLOW}⚠️  ATENÇÃO: Esta operação vai SUBSTITUIR todos os dados do banco!${NC}"
echo -e "${YELLOW}⚠️  Certifique-se de ter feito um backup antes de continuar!${NC}"
echo ""
read -p "Deseja continuar? (digite 'SIM' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SIM" ]; then
    echo -e "${YELLOW}Operação cancelada.${NC}"
    exit 0
fi

echo ""
echo "💾 Criando backup de segurança antes de restaurar..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SAFETY_BACKUP="$BACKUP_DIR/backup_seguranca_antes_restauracao_${TIMESTAMP}.sql"

mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" \
    --single-transaction \
    "$DB_NAME" > "$SAFETY_BACKUP" 2>/dev/null

if [ $? -eq 0 ]; then
    gzip -f "$SAFETY_BACKUP"
    echo -e "${GREEN}✅ Backup de segurança criado${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  Não foi possível criar backup de segurança (continuando...)${NC}"
    echo ""
fi

# Descomprimir se necessário
TEMP_SQL="/tmp/restore_${TIMESTAMP}.sql"
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "🗜️  Descomprimindo backup..."
    gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"
else
    cp "$BACKUP_FILE" "$TEMP_SQL"
fi

echo "🔄 Restaurando banco de dados..."
echo ""

# Restaurar
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" < "$TEMP_SQL"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Banco de dados restaurado com sucesso!${NC}"
    echo ""
    
    # Limpar arquivo temporário
    rm -f "$TEMP_SQL"
    
    echo "💡 Próximos passos:"
    echo "   1. Verificar se os dados foram restaurados corretamente"
    echo "   2. Reiniciar a aplicação se necessário"
    echo ""
else
    echo -e "${RED}❌ Erro ao restaurar banco de dados${NC}"
    rm -f "$TEMP_SQL"
    exit 1
fi

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}RESTAURAÇÃO CONCLUÍDA${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
