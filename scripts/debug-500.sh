#!/bin/bash

# Script de debug rápido para erro 500
# Execute no servidor: ./scripts/debug-500.sh

echo "🔍 DEBUG ERRO 500"
echo "================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Testar localhost
echo "1. Testando localhost:3000..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "302" ] || [ "$RESPONSE" == "307" ]; then
    echo -e "${GREEN}✅ OK - Aplicação responde (Status: $RESPONSE)${NC}"
else
    echo -e "${RED}❌ ERRO - Status: $RESPONSE${NC}"
    echo "Resposta completa:"
    curl http://localhost:3000 2>&1 | head -20
fi
echo ""

# 2. Testar health check
echo "2. Testando /api/health..."
HEALTH=$(curl -s http://localhost:3000/api/health 2>/dev/null)
if [ -n "$HEALTH" ]; then
    echo -e "${GREEN}✅ Health check respondeu${NC}"
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
else
    echo -e "${RED}❌ Health check não respondeu${NC}"
fi
echo ""

# 3. Verificar .env
echo "3. Verificando .env..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Arquivo .env existe${NC}"
    if grep -q "DATABASE_URL" .env; then
        DB_URL=$(grep "DATABASE_URL" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        if [ -n "$DB_URL" ] && [ "$DB_URL" != "" ]; then
            echo -e "${GREEN}✅ DATABASE_URL configurado${NC}"
        else
            echo -e "${RED}❌ DATABASE_URL está vazio${NC}"
        fi
    else
        echo -e "${RED}❌ DATABASE_URL não encontrado${NC}"
    fi
else
    echo -e "${RED}❌ Arquivo .env não existe${NC}"
fi
echo ""

# 4. Ver logs de erro
echo "4. Últimos erros do PM2:"
pm2 logs gestao-ensaio --err --lines 10 --nostream 2>/dev/null | tail -10 || echo "Nenhum erro encontrado"
echo ""

# 5. Ver logs do Nginx
echo "5. Últimos erros do Nginx:"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null | tail -10 || echo "Nenhum erro encontrado"
echo ""

# 6. Verificar se build existe
echo "6. Verificando build..."
if [ -d ".next" ]; then
    echo -e "${GREEN}✅ Pasta .next existe${NC}"
    if [ -f ".next/BUILD_ID" ]; then
        BUILD_ID=$(cat .next/BUILD_ID 2>/dev/null)
        echo "   BUILD_ID: $BUILD_ID"
    fi
else
    echo -e "${RED}❌ Pasta .next não existe - Execute: npm run build${NC}"
fi
echo ""

# 7. Ver status PM2
echo "7. Status do PM2:"
pm2 status | grep gestao-ensaio || echo "Aplicação não encontrada no PM2"
echo ""

echo "================="
echo "DIAGNÓSTICO CONCLUÍDO"
echo "================="
