#!/bin/bash

# Script de diagnóstico para servidor em produção
# Uso: ./scripts/diagnostico-producao.sh

echo "🚀 DIAGNÓSTICO - SERVIDOR EM PRODUÇÃO"
echo "======================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Testar localhost:3000
echo -e "${BLUE}1. Testando localhost:3000${NC}"
echo "------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "302" ] || [ "$HTTP_CODE" == "307" ]; then
    echo -e "${GREEN}✅ Aplicação responde (Status: $HTTP_CODE)${NC}"
    APP_OK=true
else
    echo -e "${RED}❌ Aplicação não responde corretamente (Status: $HTTP_CODE)${NC}"
    APP_OK=false
fi
echo ""

# 2. Testar health check
echo -e "${BLUE}2. Testando /api/health${NC}"
echo "-------------------"
HEALTH=$(curl -s http://localhost:3000/api/health 2>/dev/null)
if [ -n "$HEALTH" ] && echo "$HEALTH" | grep -q "status"; then
    echo -e "${GREEN}✅ Health check respondeu${NC}"
    echo "$HEALTH" | head -10
else
    echo -e "${RED}❌ Health check não respondeu${NC}"
    echo "Resposta: $HEALTH"
fi
echo ""

# 3. Verificar PM2
echo -e "${BLUE}3. Status do PM2${NC}"
echo "---------------"
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 list | grep gestao-ensaio)
    if [ -n "$PM2_STATUS" ]; then
        echo -e "${GREEN}✅ Aplicação está no PM2${NC}"
        pm2 status | grep gestao-ensaio
    else
        echo -e "${RED}❌ Aplicação não encontrada no PM2${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ PM2 não instalado${NC}"
fi
echo ""

# 4. Verificar .env
echo -e "${BLUE}4. Variáveis de Ambiente${NC}"
echo "----------------------"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Arquivo .env existe${NC}"
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✅ DATABASE_URL configurado${NC}"
    else
        echo -e "${RED}❌ DATABASE_URL não encontrado${NC}"
    fi
    if grep -q "NEXTAUTH_SECRET" .env; then
        echo -e "${GREEN}✅ NEXTAUTH_SECRET configurado${NC}"
    else
        echo -e "${RED}❌ NEXTAUTH_SECRET não encontrado${NC}"
    fi
else
    echo -e "${RED}❌ Arquivo .env não existe${NC}"
fi
echo ""

# 5. Verificar build
echo -e "${BLUE}5. Build${NC}"
echo "------"
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

# 6. Verificar Nginx
echo -e "${BLUE}6. Nginx${NC}"
echo "-------"
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo -e "${GREEN}✅ Nginx está rodando${NC}"
    
    # Verificar configuração
    if [ -f "/etc/nginx/sites-enabled/gestao-ensaio" ] || [ -f "/etc/nginx/sites-available/gestao-ensaio" ]; then
        echo -e "${GREEN}✅ Configuração encontrada${NC}"
        echo "Proxy config:"
        sudo grep -A 2 "proxy_pass" /etc/nginx/sites-enabled/gestao-ensaio 2>/dev/null || \
        sudo grep -A 2 "proxy_pass" /etc/nginx/sites-available/gestao-ensaio 2>/dev/null || \
        echo "Não encontrado"
    else
        echo -e "${YELLOW}⚠️ Configuração não encontrada${NC}"
    fi
    
    # Ver últimos erros
    echo ""
    echo "Últimos erros do Nginx:"
    sudo tail -5 /var/log/nginx/error.log 2>/dev/null | head -5 || echo "Nenhum erro recente"
else
    echo -e "${RED}❌ Nginx não está rodando${NC}"
fi
echo ""

# 7. Verificar porta 3000
echo -e "${BLUE}7. Porta 3000${NC}"
echo "------------"
if sudo netstat -tulpn 2>/dev/null | grep -q ":3000"; then
    echo -e "${GREEN}✅ Porta 3000 está em uso${NC}"
    sudo netstat -tulpn | grep ":3000" | head -1
else
    echo -e "${RED}❌ Porta 3000 não está em uso${NC}"
fi
echo ""

# 8. Últimos logs da aplicação
echo -e "${BLUE}8. Últimos Logs${NC}"
echo "---------------"
if command -v pm2 &> /dev/null; then
    echo "Erros:"
    pm2 logs gestao-ensaio --err --lines 5 --nostream 2>/dev/null | tail -5 || echo "Nenhum erro"
    echo ""
    echo "Output:"
    pm2 logs gestao-ensaio --lines 5 --nostream 2>/dev/null | tail -5 || echo "Nenhum log"
else
    echo "PM2 não disponível"
fi
echo ""

# Resumo
echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}RESUMO${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

if [ "$APP_OK" = true ]; then
    echo -e "${GREEN}✅ Aplicação Next.js está funcionando${NC}"
    echo ""
    echo "Se ainda há erro 500 no navegador:"
    echo "  → Problema está no Nginx"
    echo "  → Verifique: sudo tail -f /var/log/nginx/error.log"
    echo "  → Verifique configuração: sudo cat /etc/nginx/sites-enabled/gestao-ensaio"
else
    echo -e "${RED}❌ Aplicação Next.js não está respondendo${NC}"
    echo ""
    echo "Verifique:"
    echo "  1. Logs: pm2 logs gestao-ensaio --err"
    echo "  2. Variáveis: cat .env"
    echo "  3. Build: npm run build"
    echo "  4. Prisma: npm run db:generate"
fi

echo ""
