#!/bin/bash

# Script para testar servidor e identificar problema do erro 500
# Uso: ./scripts/testar-servidor.sh

echo "🧪 TESTANDO SERVIDOR"
echo "===================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Testar localhost:3000
echo -e "${BLUE}1. Testando localhost:3000${NC}"
echo "----------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "302" ] || [ "$RESPONSE" == "307" ]; then
    echo -e "${GREEN}✅ Aplicação responde na porta 3000 (Status: $RESPONSE)${NC}"
    echo "   A aplicação está funcionando!"
else
    echo -e "${RED}❌ Aplicação não responde corretamente (Status: $RESPONSE)${NC}"
    echo "   Problema na aplicação Next.js"
fi
echo ""

# 2. Testar health check
echo -e "${BLUE}2. Testando /api/health${NC}"
echo "-------------------"
HEALTH=$(curl -s http://localhost:3000/api/health 2>/dev/null)
if [ -n "$HEALTH" ]; then
    echo -e "${GREEN}✅ Health check respondeu${NC}"
    echo "$HEALTH" | head -20
else
    echo -e "${RED}❌ Health check não respondeu${NC}"
fi
echo ""

# 3. Verificar Nginx
echo -e "${BLUE}3. Verificando Nginx${NC}"
echo "------------------"
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo -e "${GREEN}✅ Nginx está rodando${NC}"
    
    # Verificar configuração
    if [ -f "/etc/nginx/sites-enabled/gestao-ensaio" ]; then
        echo -e "${GREEN}✅ Configuração Nginx encontrada${NC}"
        echo "Conteúdo da configuração:"
        sudo cat /etc/nginx/sites-enabled/gestao-ensaio | grep -A 5 "proxy_pass"
    else
        echo -e "${RED}❌ Configuração Nginx não encontrada${NC}"
    fi
    
    # Ver logs de erro do Nginx
    echo ""
    echo "Últimos erros do Nginx:"
    sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "Nenhum erro recente"
else
    echo -e "${RED}❌ Nginx não está rodando${NC}"
fi
echo ""

# 4. Verificar PM2
echo -e "${BLUE}4. Verificando PM2${NC}"
echo "----------------"
pm2 status | grep gestao-ensaio
echo ""

# 5. Ver últimos logs
echo -e "${BLUE}5. Últimos Logs da Aplicação${NC}"
echo "------------------------"
pm2 logs gestao-ensaio --lines 15 --nostream 2>/dev/null | tail -15
echo ""

# 6. Resumo
echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}RESUMO${NC}"
echo -e "${BLUE}====================================${NC}"

if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "302" ] || [ "$RESPONSE" == "307" ]; then
    echo -e "${GREEN}✅ Aplicação Next.js está funcionando${NC}"
    echo ""
    echo "Se ainda há erro 500 no navegador, o problema é no Nginx:"
    echo "  1. Verifique configuração: sudo cat /etc/nginx/sites-enabled/gestao-ensaio"
    echo "  2. Verifique logs: sudo tail -f /var/log/nginx/error.log"
    echo "  3. Reinicie Nginx: sudo systemctl restart nginx"
else
    echo -e "${RED}❌ Aplicação Next.js não está respondendo corretamente${NC}"
    echo ""
    echo "Verifique:"
    echo "  1. Logs: pm2 logs gestao-ensaio --err"
    echo "  2. Variáveis de ambiente: cat .env"
    echo "  3. Banco de dados: mysql -u usuario -p gestao_ensaio"
    echo "  4. Prisma Client: npm run db:generate"
fi

echo ""
