#!/bin/bash

# Script para corrigir build e cache
# Execute: ./scripts/corrigir-tudo.sh

set -e

echo "🔧 CORRIGINDO BUILD E CACHE"
echo "============================"
echo ""

cd /var/www/gestao-ensaio

# 1. Parar aplicação
echo "1. Parando aplicação..."
pm2 stop gestao-ensaio 2>/dev/null || echo "   Aplicação não estava rodando"
echo ""

# 2. Limpar TUDO
echo "2. Limpando cache e build antigo..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache 2>/dev/null || true
echo "✅ Cache limpo"
echo ""

# 3. Verificar .env
echo "3. Verificando .env..."
if [ ! -f ".env" ]; then
    echo "❌ ERRO: .env não encontrado!"
    exit 1
fi
echo "✅ .env OK"
echo ""

# 4. Instalar dependências
echo "4. Verificando dependências..."
npm install
echo "✅ Dependências OK"
echo ""

# 5. Gerar Prisma
echo "5. Gerando Prisma Client..."
npm run db:generate
echo "✅ Prisma OK"
echo ""

# 6. Build
echo "6. Fazendo build (isso pode levar alguns minutos)..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ ERRO: Build falhou!"
    echo "Verifique os erros acima"
    exit 1
fi

echo "✅ Build concluído"
echo ""

# 7. Verificar build
echo "7. Verificando build..."
if [ ! -f ".next/BUILD_ID" ]; then
    echo "❌ ERRO: BUILD_ID não foi criado!"
    exit 1
fi

BUILD_ID=$(cat .next/BUILD_ID)
echo "✅ BUILD_ID: $BUILD_ID"
echo ""

# 8. Reiniciar
echo "8. Reiniciando aplicação..."
pm2 restart gestao-ensaio || pm2 start npm --name "gestao-ensaio" -- start
echo "✅ Aplicação reiniciada"
echo ""

# 9. Aguardar
echo "9. Aguardando inicialização..."
sleep 5
echo ""

# 10. Testar
echo "10. Testando aplicação..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "302" ] || [ "$RESPONSE" == "307" ]; then
    echo "✅ Aplicação respondendo (Status: $RESPONSE)"
else
    echo "❌ Aplicação não está respondendo (Status: $RESPONSE)"
    echo "   Verifique os logs: pm2 logs gestao-ensaio"
fi
echo ""

echo "✅✅✅ CORREÇÃO CONCLUÍDA! ✅✅✅"
echo ""
echo "IMPORTANTE: Se ainda houver erro 'Server Action', limpe o cache do navegador:"
echo "  - Chrome: Ctrl+Shift+Del → Limpar cache"
echo "  - Ou: Abrir em aba anônima"
echo ""
