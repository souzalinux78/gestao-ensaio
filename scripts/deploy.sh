#!/bin/bash

# Script de deploy para servidor
# Uso: ./scripts/deploy.sh

set -e

echo "🚀 Iniciando deploy..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

# Atualizar código do Git
echo -e "${YELLOW}📥 Atualizando código do Git...${NC}"
git pull origin main || git pull origin master

# Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

# Executar migrações do banco
echo -e "${YELLOW}🗄️ Executando migrações do banco...${NC}"
npm run db:push || echo "⚠️ Aviso: Erro ao executar migrações (pode ser normal se já estiver atualizado)"

# Build
echo -e "${YELLOW}🔨 Gerando build de produção...${NC}"
npm run build

# Reiniciar aplicação (se PM2 estiver instalado)
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
    pm2 restart gestao-ensaio || pm2 start npm --name "gestao-ensaio" -- start
    echo -e "${GREEN}✅ Deploy concluído!${NC}"
else
    echo -e "${YELLOW}⚠️ PM2 não encontrado. Inicie manualmente com: npm start${NC}"
fi

echo -e "${GREEN}✨ Deploy finalizado com sucesso!${NC}"
