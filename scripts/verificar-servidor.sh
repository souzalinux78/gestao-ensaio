#!/bin/bash

# Script para verificar status do servidor
# Uso: ./scripts/verificar-servidor.sh

echo "🔍 Verificando status do servidor..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Verificar se PM2 está rodando
echo "1. Verificando PM2..."
if command -v pm2 &> /dev/null; then
    pm2 status
    echo ""
else
    echo -e "${RED}❌ PM2 não está instalado${NC}"
    echo ""
fi

# 2. Verificar porta 3000
echo "2. Verificando porta 3000..."
if sudo netstat -tulpn | grep -q ":3000"; then
    echo -e "${GREEN}✅ Porta 3000 está em uso${NC}"
    sudo netstat -tulpn | grep ":3000"
else
    echo -e "${RED}❌ Porta 3000 não está em uso${NC}"
fi
echo ""

# 3. Verificar arquivo .env
echo "3. Verificando arquivo .env..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Arquivo .env existe${NC}"
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✅ DATABASE_URL configurado${NC}"
    else
        echo -e "${RED}❌ DATABASE_URL não encontrado no .env${NC}"
    fi
    if grep -q "NEXTAUTH_SECRET" .env; then
        echo -e "${GREEN}✅ NEXTAUTH_SECRET configurado${NC}"
    else
        echo -e "${RED}❌ NEXTAUTH_SECRET não encontrado no .env${NC}"
    fi
else
    echo -e "${RED}❌ Arquivo .env não existe${NC}"
fi
echo ""

# 4. Verificar build
echo "4. Verificando build..."
if [ -d ".next" ]; then
    echo -e "${GREEN}✅ Pasta .next existe${NC}"
else
    echo -e "${RED}❌ Pasta .next não existe - execute: npm run build${NC}"
fi
echo ""

# 5. Verificar node_modules
echo "5. Verificando dependências..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules existe${NC}"
else
    echo -e "${RED}❌ node_modules não existe - execute: npm install${NC}"
fi
echo ""

# 6. Verificar Nginx
echo "6. Verificando Nginx..."
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx está rodando${NC}"
    sudo nginx -t
else
    echo -e "${RED}❌ Nginx não está rodando${NC}"
fi
echo ""

# 7. Verificar últimos logs
echo "7. Últimos logs da aplicação (se PM2 estiver rodando):"
if command -v pm2 &> /dev/null; then
    pm2 logs gestao-ensaio --lines 10 --nostream
fi

echo ""
echo "✨ Verificação concluída!"
