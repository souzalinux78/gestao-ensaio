#!/bin/bash

# Script para corrigir problemas em produção
# Execute: ./scripts/corrigir-producao.sh

set -e

echo "🔧 CORRIGINDO PROBLEMAS EM PRODUÇÃO"
echo "===================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Parar aplicação
echo "1. Parando aplicação..."
pm2 stop gestao-ensaio 2>/dev/null || echo "   Aplicação não estava rodando"
echo ""

# 2. Limpar cache
echo "2. Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}✅ Cache limpo${NC}"
echo ""

# 3. Verificar .env
echo "3. Verificando .env..."
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não existe!${NC}"
    echo "   Crie o arquivo .env com DATABASE_URL e NEXTAUTH_SECRET"
    exit 1
fi

if ! grep -q "DATABASE_URL" .env; then
    echo -e "${RED}❌ DATABASE_URL não encontrado no .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env OK${NC}"
echo ""

# 4. Regenerar Prisma Client
echo "4. Regenerando Prisma Client..."
npm run db:generate || echo -e "${YELLOW}⚠️ Aviso: Erro ao gerar Prisma Client${NC}"
echo ""

# 5. Build
echo "5. Fazendo build..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build concluído com sucesso${NC}"
else
    echo -e "${RED}❌ Erro no build${NC}"
    echo "   Verifique os erros acima"
    exit 1
fi
echo ""

# 6. Verificar se build existe
if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
    echo -e "${RED}❌ Build não foi criado corretamente${NC}"
    exit 1
fi

BUILD_ID=$(cat .next/BUILD_ID)
echo -e "${GREEN}✅ Build ID: $BUILD_ID${NC}"
echo ""

# 7. Reiniciar aplicação
echo "7. Reiniciando aplicação..."
pm2 restart gestao-ensaio || pm2 start npm --name "gestao-ensaio" -- start
echo ""

# 8. Aguardar um pouco
echo "8. Aguardando aplicação iniciar..."
sleep 3
echo ""

# 9. Testar
echo "9. Testando aplicação..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "302" ] || [ "$RESPONSE" == "307" ]; then
    echo -e "${GREEN}✅ Aplicação respondendo (Status: $RESPONSE)${NC}"
else
    echo -e "${RED}❌ Aplicação não está respondendo (Status: $RESPONSE)${NC}"
    echo "   Verifique os logs: pm2 logs gestao-ensaio"
fi
echo ""

# 10. Verificar Nginx
echo "10. Verificando configuração Nginx..."
if [ -f "/etc/nginx/sites-enabled/gestao-ensaio" ]; then
    CONFIG_FILE="/etc/nginx/sites-enabled/gestao-ensaio"
elif [ -f "/etc/nginx/sites-available/gestao-ensaio" ]; then
    CONFIG_FILE="/etc/nginx/sites-available/gestao-ensaio"
else
    echo -e "${YELLOW}⚠️ Configuração Nginx não encontrada${NC}"
    echo "   Criando configuração..."
    sudo tee /etc/nginx/sites-available/gestao-ensaio > /dev/null <<EOF
server {
    listen 80;
    server_name gestaoensaios.automatizeonline.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    sudo ln -sf /etc/nginx/sites-available/gestao-ensaio /etc/nginx/sites-enabled/
    CONFIG_FILE="/etc/nginx/sites-available/gestao-ensaio"
fi

# Verificar se tem proxy_pass
if grep -q "proxy_pass http://localhost:3000" "$CONFIG_FILE"; then
    echo -e "${GREEN}✅ Nginx configurado corretamente${NC}"
else
    echo -e "${RED}❌ Nginx não está configurado para proxy_pass localhost:3000${NC}"
    echo "   Corrigindo configuração..."
    sudo tee "$CONFIG_FILE" > /dev/null <<EOF
server {
    listen 80;
    server_name gestaoensaios.automatizeonline.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    echo -e "${GREEN}✅ Configuração Nginx corrigida${NC}"
fi

# Testar e reiniciar Nginx
echo "   Testando configuração Nginx..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "   Reiniciando Nginx..."
    sudo systemctl restart nginx
    echo -e "${GREEN}✅ Nginx reiniciado${NC}"
else
    echo -e "${RED}❌ Erro na configuração do Nginx${NC}"
fi
echo ""

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}CORREÇÃO CONCLUÍDA${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo "Verifique:"
echo "  - Status: pm2 status"
echo "  - Logs: pm2 logs gestao-ensaio"
echo "  - Teste: curl http://localhost:3000"
echo ""
