#!/bin/bash

# Script para copiar ícones para a pasta public
# Execute: ./scripts/copiar-icones.sh

echo "📁 Copiando ícones para pasta public..."
echo ""

# Ir para pasta do projeto
cd "$(dirname "$0")/.."

# Copiar logo se existir
if [ -f "logo.png" ]; then
    echo "📸 Copiando logo.png..."
    cp "logo.png" "public/logo.png"
    echo "✅ Logo copiado!"
else
    echo "⚠️  logo.png não encontrado na raiz"
fi

# Copiar favicons se existir
if [ -f "favicons/favicon-16x16.png" ]; then
    echo "📸 Copiando favicons..."
    cp "favicons/favicon-16x16.png" "public/favicon-16x16.png"
    if [ -f "favicons/favicon-32x32.png" ]; then
        cp "favicons/favicon-32x32.png" "public/favicon-32x32.png"
    fi
    echo "✅ Favicons copiados!"
else
    echo "⚠️  Pasta favicons não encontrada"
fi

echo ""
echo "✅ Concluído!"
echo ""
echo "📋 IMPORTANTE: Ainda precisa criar:"
echo "   - public/favicon.ico (use https://favicon.io/favicon-converter/)"
echo "   - public/icon-192.png (192x192 pixels)"
echo "   - public/icon-512.png (512x512 pixels)"
echo ""
