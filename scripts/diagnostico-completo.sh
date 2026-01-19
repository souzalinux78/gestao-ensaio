#!/bin/bash

# Script completo de diagnóstico para erro 500
# Uso: ./scripts/diagnostico-completo.sh

echo "🔍 DIAGNÓSTICO COMPLETO - Erro 500"
echo "===================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Verificar estrutura do projeto
echo -e "${BLUE}1. Estrutura do Projeto${NC}"
echo "-------------------"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json encontrado${NC}"
    echo "   Versão Node.js necessária: $(cat package.json | grep '"node"' || echo 'não especificado')"
else
    echo -e "${RED}❌ package.json não encontrado${NC}"
    echo "   Você está no diretório correto?"
    exit 1
fi
echo ""

# 2. Verificar Node.js
echo -e "${BLUE}2. Node.js${NC}"
echo "--------"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js não instalado${NC}"
fi
echo ""

# 3. Verificar npm
echo -e "${BLUE}3. NPM${NC}"
echo "-----"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ NPM instalado: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ NPM não instalado${NC}"
fi
echo ""

# 4. Verificar dependências
echo -e "${BLUE}4. Dependências${NC}"
echo "---------------"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules existe${NC}"
    if [ -f "node_modules/.prisma/client/index.js" ]; then
        echo -e "${GREEN}✅ Prisma Client gerado${NC}"
    else
        echo -e "${RED}❌ Prisma Client não gerado - Execute: npm run db:generate${NC}"
    fi
else
    echo -e "${RED}❌ node_modules não existe - Execute: npm install${NC}"
fi
echo ""

# 5. Verificar arquivo .env
echo -e "${BLUE}5. Variáveis de Ambiente${NC}"
echo "------------------------"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Arquivo .env existe${NC}"
    
    if grep -q "DATABASE_URL" .env; then
        DB_URL=$(grep "DATABASE_URL" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        if [ -z "$DB_URL" ] || [ "$DB_URL" == "" ]; then
            echo -e "${RED}❌ DATABASE_URL está vazio${NC}"
        else
            echo -e "${GREEN}✅ DATABASE_URL configurado${NC}"
            # Extrair informações da URL
            if [[ $DB_URL == mysql://* ]]; then
                echo "   Tipo: MySQL"
            fi
        fi
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
    echo "   Crie o arquivo .env com:"
    echo "   DATABASE_URL=\"mysql://usuario:senha@host:porta/gestao_ensaio\""
    echo "   NEXTAUTH_SECRET=\"seu-secret-aqui\""
fi
echo ""

# 6. Verificar MySQL
echo -e "${BLUE}6. MySQL${NC}"
echo "-------"
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✅ MySQL client instalado${NC}"
    
    # Tentar extraer informações do .env
    if [ -f ".env" ] && grep -q "DATABASE_URL" .env; then
        DB_URL=$(grep "DATABASE_URL" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        # Tentar conectar (pode falhar, mas vamos tentar)
        echo "   Tentando conectar ao banco..."
    fi
else
    echo -e "${YELLOW}⚠️ MySQL client não encontrado${NC}"
fi
echo ""

# 7. Verificar build
echo -e "${BLUE}7. Build${NC}"
echo "------"
if [ -d ".next" ]; then
    echo -e "${GREEN}✅ Pasta .next existe${NC}"
    if [ -f ".next/BUILD_ID" ]; then
        BUILD_ID=$(cat .next/BUILD_ID 2>/dev/null || echo "não encontrado")
        echo "   BUILD_ID: $BUILD_ID"
    fi
else
    echo -e "${RED}❌ Pasta .next não existe - Execute: npm run build${NC}"
fi
echo ""

# 8. Verificar PM2
echo -e "${BLUE}8. PM2${NC}"
echo "-----"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 instalado${NC}"
    PM2_STATUS=$(pm2 list | grep gestao-ensaio || echo "")
    if [ -z "$PM2_STATUS" ]; then
        echo -e "${RED}❌ Aplicação não está rodando no PM2${NC}"
    else
        echo -e "${GREEN}✅ Aplicação está rodando${NC}"
        pm2 info gestao-ensaio 2>/dev/null | head -10
    fi
else
    echo -e "${YELLOW}⚠️ PM2 não instalado${NC}"
fi
echo ""

# 9. Verificar porta 3000
echo -e "${BLUE}9. Porta 3000${NC}"
echo "------------"
if sudo netstat -tulpn 2>/dev/null | grep -q ":3000"; then
    echo -e "${GREEN}✅ Porta 3000 está em uso${NC}"
    sudo netstat -tulpn | grep ":3000"
else
    echo -e "${RED}❌ Porta 3000 não está em uso${NC}"
    echo "   A aplicação pode não estar rodando"
fi
echo ""

# 10. Verificar Nginx
echo -e "${BLUE}10. Nginx${NC}"
echo "----------"
if command -v nginx &> /dev/null; then
    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo -e "${GREEN}✅ Nginx está rodando${NC}"
        if [ -f "/etc/nginx/sites-available/gestao-ensaio" ] || [ -f "/etc/nginx/sites-enabled/gestao-ensaio" ]; then
            echo -e "${GREEN}✅ Configuração Nginx encontrada${NC}"
        else
            echo -e "${YELLOW}⚠️ Configuração Nginx não encontrada${NC}"
        fi
    else
        echo -e "${RED}❌ Nginx não está rodando${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Nginx não instalado${NC}"
fi
echo ""

# 11. Últimos logs
echo -e "${BLUE}11. Últimos Logs${NC}"
echo "---------------"
if command -v pm2 &> /dev/null; then
    echo "Últimas 10 linhas de log:"
    pm2 logs gestao-ensaio --lines 10 --nostream 2>/dev/null || echo "Nenhum log disponível"
else
    echo "PM2 não disponível para ver logs"
fi
echo ""

# 12. Resumo
echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}RESUMO${NC}"
echo -e "${BLUE}====================================${NC}"

ERRORS=0

[ ! -f ".env" ] && { echo -e "${RED}❌ Arquivo .env não existe${NC}"; ((ERRORS++)); }
[ ! -d "node_modules" ] && { echo -e "${RED}❌ node_modules não existe${NC}"; ((ERRORS++)); }
[ ! -d ".next" ] && { echo -e "${RED}❌ Build não feito${NC}"; ((ERRORS++)); }

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Estrutura básica OK${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  1. Verifique os logs: pm2 logs gestao-ensaio"
    echo "  2. Acesse: http://seu-servidor/health (rota de diagnóstico)"
    echo "  3. Verifique conexão com banco: mysql -u usuario -p gestao_ensaio"
else
    echo -e "${RED}❌ Encontrados $ERRORS problemas críticos${NC}"
    echo ""
    echo "Execute:"
    echo "  ./scripts/fix-500-error.sh"
fi

echo ""
