#!/bin/bash

# Script para corrigir erro 500
# Uso: ./scripts/fix-500-error.sh

set -e

echo "🔧 Corrigindo erro 500..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Parar aplicação
echo "1. Parando aplicação..."
if command -v pm2 &> /dev/null; then
    pm2 stop gestao-ensaio 2>/dev/null || echo "Aplicação não estava rodando"
fi
echo ""

# 2. Verificar .env
echo "2. Verificando .env..."
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não existe!${NC}"
    echo "Criando arquivo .env de exemplo..."
    cat > .env << EOF
DATABASE_URL="mysql://usuario:senha@localhost:3306/gestao_ensaio"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NODE_ENV=production
EOF
    echo -e "${YELLOW}⚠️ Configure o .env com suas credenciais!${NC}"
    echo ""
fi

# 3. Limpar cache
echo "3. Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}✅ Cache limpo${NC}"
echo ""

# 4. Reinstalar dependências (se necessário)
echo "4. Verificando dependências..."
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
else
    echo -e "${GREEN}✅ Dependências já instaladas${NC}"
fi
echo ""

# 5. Executar migrações
echo "5. Executando migrações do banco..."
npm run db:push || echo -e "${YELLOW}⚠️ Aviso: Erro ao executar migrações (pode ser normal)${NC}"
echo ""

# 6. Build
echo "6. Gerando build..."
npm run build
echo -e "${GREEN}✅ Build concluído${NC}"
echo ""

# 7. Reiniciar aplicação
echo "7. Reiniciando aplicação..."
if command -v pm2 &> /dev/null; then
    pm2 restart gestao-ensaio || pm2 start npm --name "gestao-ensaio" -- start
    pm2 save
    echo -e "${GREEN}✅ Aplicação reiniciada${NC}"
else
    echo -e "${YELLOW}⚠️ PM2 não encontrado. Inicie manualmente: npm start${NC}"
fi
echo ""

# 8. Verificar status
echo "8. Verificando status..."
sleep 2
if command -v pm2 &> /dev/null; then
    pm2 status
    echo ""
    echo "Últimos logs:"
    pm2 logs gestao-ensaio --lines 5 --nostream
fi

echo ""
echo -e "${GREEN}✨ Correção concluída!${NC}"
echo ""
echo "Se o erro persistir, verifique:"
echo "  - Logs: pm2 logs gestao-ensaio"
echo "  - Banco de dados: mysql -u usuario -p gestao_ensaio"
echo "  - Nginx: sudo nginx -t"
