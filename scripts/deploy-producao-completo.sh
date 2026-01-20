#!/bin/bash

# Script completo de deploy para produção
# Este script garante que todas as atualizações sejam aplicadas corretamente

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy completo para produção..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/var/www/gestao-ensaio"
cd "$PROJECT_DIR" || exit 1

echo -e "${YELLOW}📋 Verificando ambiente...${NC}"
echo "Diretório atual: $(pwd)"
echo "Usuário: $(whoami)"
echo ""

# 1. Parar a aplicação
echo -e "${YELLOW}⏹️  Parando aplicação PM2...${NC}"
pm2 stop gestao-ensaio || echo "Aplicação não estava rodando"
sleep 2

# 2. Limpar todos os caches
echo -e "${YELLOW}🧹 Limpando caches...${NC}"
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache
echo -e "${GREEN}✅ Caches limpos${NC}"

# 3. Atualizar dependências (se necessário)
echo -e "${YELLOW}📦 Verificando dependências...${NC}"
npm ci --production=false || npm install
echo -e "${GREEN}✅ Dependências atualizadas${NC}"

# 4. Gerar Prisma Client
echo -e "${YELLOW}🔧 Gerando Prisma Client...${NC}"
npm run db:generate
echo -e "${GREEN}✅ Prisma Client gerado${NC}"

# 5. Build da aplicação
echo -e "${YELLOW}🔨 Construindo aplicação...${NC}"
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído com sucesso${NC}"

# 6. Verificar se o build foi criado
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Pasta .next não foi criada!${NC}"
    exit 1
fi

# 7. Reiniciar aplicação
echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
pm2 restart gestao-ensaio || pm2 start npm --name "gestao-ensaio" -- start

# 8. Aguardar aplicação iniciar
sleep 3

# 9. Verificar status
echo -e "${YELLOW}📊 Verificando status da aplicação...${NC}"
pm2 status gestao-ensaio

# 10. Verificar logs
echo -e "${YELLOW}📝 Últimas linhas dos logs:${NC}"
pm2 logs gestao-ensaio --lines 20 --nostream

# 11. Limpar cache do Nginx (se aplicável)
if command -v nginx &> /dev/null; then
    echo -e "${YELLOW}🌐 Recarregando Nginx...${NC}"
    sudo nginx -t && sudo systemctl reload nginx || echo "Nginx não configurado ou sem permissão"
fi

echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo "⚠️  IMPORTANTE: Para garantir que os usuários vejam as atualizações:"
echo "   1. O Service Worker foi atualizado (versão v3)"
echo "   2. Os usuários precisam fazer hard refresh (Ctrl+Shift+R ou Cmd+Shift+R)"
echo "   3. Ou limpar o cache do navegador"
echo ""
echo "📱 Para testar:"
echo "   - Acesse a aplicação em modo anônimo"
echo "   - Ou limpe o cache do navegador"
echo "   - Verifique o console do navegador para logs do Service Worker"
echo ""
