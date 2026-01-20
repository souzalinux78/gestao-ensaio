#!/bin/bash

# Script para forçar atualização do Service Worker
# Execute após cada deploy para garantir que os usuários vejam as atualizações

set -e

echo "🔄 Forçando atualização do Service Worker..."
echo ""

# Incrementar versão do cache no service worker
SW_FILE="public/sw.js"

if [ ! -f "$SW_FILE" ]; then
    echo "❌ Arquivo $SW_FILE não encontrado!"
    exit 1
fi

# Extrair versão atual
CURRENT_VERSION=$(grep -oP "CACHE_NAME = 'gestao-ensaio-v\K\d+" "$SW_FILE" || echo "0")

# Incrementar versão
NEW_VERSION=$((CURRENT_VERSION + 1))

echo "Versão atual: v$CURRENT_VERSION"
echo "Nova versão: v$NEW_VERSION"

# Atualizar versão no arquivo
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/CACHE_NAME = 'gestao-ensaio-v[0-9]*'/CACHE_NAME = 'gestao-ensaio-v$NEW_VERSION'/" "$SW_FILE"
else
    # Linux
    sed -i "s/CACHE_NAME = 'gestao-ensaio-v[0-9]*'/CACHE_NAME = 'gestao-ensaio-v$NEW_VERSION'/" "$SW_FILE"
fi

echo "✅ Service Worker atualizado para versão v$NEW_VERSION"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   1. Faça o rebuild da aplicação: npm run build"
echo "   2. Reinicie o PM2: pm2 restart gestao-ensaio"
echo "   3. Os usuários precisarão fazer hard refresh (Ctrl+Shift+R)"
echo ""
