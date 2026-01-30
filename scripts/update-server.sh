#!/bin/bash

# Script para atualizar o servidor
# Uso: ./scripts/update-server.sh

set -e

echo "🚀 ATUALIZANDO SERVIDOR"
echo "======================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd /var/www/gestao-ensaio

# 1. Backup do banco de dados
echo "1. Fazendo backup do banco de dados..."
if [ -f "scripts/backup-banco.sh" ]; then
    chmod +x scripts/backup-banco.sh
    ./scripts/backup-banco.sh || echo -e "${YELLOW}⚠️ Aviso: Erro ao fazer backup (continuando...)${NC}"
else
    echo -e "${YELLOW}⚠️ Script de backup não encontrado (pulando...)${NC}"
fi
echo ""

# 2. Parar aplicação
echo "2. Parando aplicação..."
pm2 stop gestao-ensaio 2>/dev/null || echo "   Aplicação não estava rodando"
echo ""

# 3. Atualizar código (Git)
if [ -d ".git" ]; then
    echo "3. Atualizando código do Git..."
    git pull || echo -e "${YELLOW}⚠️ Aviso: Erro ao fazer git pull (continuando...)${NC}"
else
    echo "3. Git não configurado, pulando atualização de código..."
fi
echo ""

# 4. Instalar dependências
echo "4. Instalando dependências..."
npm install
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# 5. Gerar Prisma Client
echo "5. Gerando Prisma Client..."
npm run db:generate || echo -e "${YELLOW}⚠️ Aviso: Erro ao gerar Prisma Client${NC}"
echo ""

# 6. Limpar cache
echo "6. Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}✅ Cache limpo${NC}"
echo ""

# 7. Build
echo "7. Fazendo build..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build concluído${NC}"
else
    echo -e "${RED}❌ Erro no build${NC}"
    exit 1
fi
echo ""

# 8. Verificar build
if [ ! -f ".next/BUILD_ID" ]; then
    echo -e "${RED}❌ Build não foi criado corretamente${NC}"
    exit 1
fi

BUILD_ID=$(cat .next/BUILD_ID)
echo "   BUILD_ID: $BUILD_ID"
echo ""

# 9. Reiniciar aplicação
echo "9. Reiniciando aplicação..."
pm2 restart gestao-ensaio || pm2 start npm --name "gestao-ensaio" -- start
echo -e "${GREEN}✅ Aplicação reiniciada${NC}"
echo ""

# 10. Aguardar
echo "10. Aguardando inicialização..."
sleep 3
echo ""

# 11. Testar
echo "11. Testando aplicação..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "302" ] || [ "$RESPONSE" == "307" ]; then
    echo -e "${GREEN}✅ Aplicação respondendo (Status: $RESPONSE)${NC}"
else
    echo -e "${RED}❌ Aplicação não está respondendo (Status: $RESPONSE)${NC}"
    echo "   Verifique os logs: pm2 logs gestao-ensaio"
fi
echo ""

# 12. Mostrar status
echo "12. Status final:"
pm2 status | grep gestao-ensaio || echo "Aplicação não encontrada"
echo ""

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}ATUALIZAÇÃO CONCLUÍDA${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo "Ver logs: pm2 logs gestao-ensaio"
echo "Ver status: pm2 status"
echo ""
