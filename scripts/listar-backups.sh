#!/bin/bash

# Script para listar backups disponíveis
# Uso: ./scripts/listar-backups.sh

echo "📋 BACKUPS DISPONÍVEIS"
echo "======================"
echo ""

# Diretórios onde procurar backups
BACKUP_DIRS=(
    "./backups"
    "."
    "/var/www/gestao-ensaio/backups"
    "/var/www/gestao-ensaio"
)

FOUND=0

for DIR in "${BACKUP_DIRS[@]}"; do
    if [ -d "$DIR" ]; then
        BACKUPS=$(find "$DIR" -name "backup_*.sql*" -type f 2>/dev/null | sort -r)
        
        if [ -n "$BACKUPS" ]; then
            echo "📁 Diretório: $DIR"
            echo ""
            echo "   # | Arquivo | Tamanho | Data de Modificação"
            echo "   --|---------|---------|-------------------"
            
            COUNT=1
            for backup in $BACKUPS; do
                FILENAME=$(basename "$backup")
                SIZE=$(du -h "$backup" | cut -f1)
                DATE=$(stat -c %y "$backup" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1) || DATE="N/A"
                printf "   %d | %s | %s | %s\n" "$COUNT" "$FILENAME" "$SIZE" "$DATE"
                COUNT=$((COUNT + 1))
            done
            echo ""
            FOUND=1
        fi
    fi
done

if [ $FOUND -eq 0 ]; then
    echo "⚠️  Nenhum backup encontrado nos diretórios padrão."
    echo ""
    echo "Diretórios verificados:"
    for DIR in "${BACKUP_DIRS[@]}"; do
        echo "   - $DIR"
    done
    echo ""
    echo "💡 Dica: Execute './scripts/backup-banco.sh' para criar um backup agora."
    echo ""
else
    echo "💡 Para restaurar um backup, use:"
    echo "   ./scripts/restaurar-banco.sh <arquivo-backup.sql.gz>"
    echo ""
fi
