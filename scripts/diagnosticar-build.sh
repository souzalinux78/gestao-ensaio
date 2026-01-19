#!/bin/bash

# Script para diagnosticar problema de build
# Execute: ./scripts/diagnosticar-build.sh

set -e

echo "🔍 DIAGNÓSTICO DE BUILD"
echo "======================="
echo ""

cd /var/www/gestao-ensaio

# 1. Verificar se está na pasta correta
echo "1. Verificando pasta..."
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: package.json não encontrado!"
    echo "   Você está na pasta errada. Execute: cd /var/www/gestao-ensaio"
    exit 1
fi
echo "✅ Pasta correta"
echo ""

# 2. Verificar .env
echo "2. Verificando .env..."
if [ ! -f ".env" ]; then
    echo "❌ ERRO: .env não encontrado!"
    exit 1
fi
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ ERRO: DATABASE_URL não configurado no .env"
    exit 1
fi
echo "✅ .env OK"
echo ""

# 3. Verificar node_modules
echo "3. Verificando node_modules..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules não existe, instalando..."
    npm install
fi
echo "✅ node_modules OK"
echo ""

# 4. Verificar Prisma
echo "4. Verificando Prisma..."
if [ ! -d "node_modules/.prisma" ]; then
    echo "⚠️  Prisma Client não gerado, gerando..."
    npm run db:generate
fi
echo "✅ Prisma OK"
echo ""

# 5. Verificar espaço em disco
echo "5. Verificando espaço em disco..."
df -h . | tail -1
echo ""

# 6. Verificar memória
echo "6. Verificando memória..."
free -h
echo ""

# 7. Limpar tudo
echo "7. Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Cache limpo"
echo ""

# 8. Tentar build
echo "8. Fazendo build..."
echo "   (Isso pode levar alguns minutos...)"
npm run build

# 9. Verificar build
echo ""
echo "9. Verificando build..."
if [ ! -f ".next/BUILD_ID" ]; then
    echo "❌ ERRO: Build falhou - BUILD_ID não criado"
    exit 1
fi

BUILD_ID=$(cat .next/BUILD_ID)
echo "✅ Build criado com sucesso!"
echo "   BUILD_ID: $BUILD_ID"
echo ""

# 10. Verificar estrutura
echo "10. Verificando estrutura do build..."
if [ ! -d ".next/server" ]; then
    echo "❌ ERRO: Pasta .next/server não existe"
    exit 1
fi
echo "✅ Estrutura OK"
echo ""

echo "✅✅✅ BUILD CONCLUÍDO COM SUCESSO! ✅✅✅"
echo ""
echo "Agora reinicie a aplicação:"
echo "  pm2 restart gestao-ensaio"
