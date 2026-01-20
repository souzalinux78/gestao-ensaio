#!/bin/bash

# Script para atualizar arquivos no servidor
# Este script verifica e atualiza todos os arquivos necessários

set -e

echo "🔄 ATUALIZANDO ARQUIVOS NO SERVIDOR"
echo "===================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Diretório do projeto
PROJECT_DIR="/var/www/gestao-ensaio"
cd "$PROJECT_DIR" || exit 1

echo -e "${BLUE}📂 Diretório: $(pwd)${NC}"
echo ""

# 1. Verificar se é um repositório Git
if [ -d ".git" ]; then
    echo -e "${YELLOW}1. Atualizando via Git...${NC}"
    
    # Verificar status
    echo "   Verificando status do Git..."
    git status
    
    # Verificar se há mudanças locais
    if ! git diff-index --quiet HEAD --; then
        echo -e "${YELLOW}   ⚠️  Há mudanças locais não commitadas${NC}"
        read -p "   Deseja descartar mudanças locais? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            echo "   Descartando mudanças locais..."
            git reset --hard HEAD
            git clean -fd
        fi
    fi
    
    # Buscar atualizações
    echo "   Buscando atualizações do repositório remoto..."
    git fetch origin
    
    # Verificar se há atualizações
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "N/A")
    
    if [ "$LOCAL" != "$REMOTE" ] && [ "$REMOTE" != "N/A" ]; then
        echo -e "${GREEN}   ✅ Há atualizações disponíveis${NC}"
        echo "   Aplicando atualizações..."
        git pull origin main || git pull origin master
        echo -e "${GREEN}   ✅ Arquivos atualizados via Git${NC}"
    else
        echo -e "${YELLOW}   ℹ️  Nenhuma atualização disponível no Git${NC}"
    fi
else
    echo -e "${YELLOW}1. Não é um repositório Git${NC}"
    echo "   Se você usa Git, inicialize: git init"
    echo ""
fi

# 2. Verificar arquivos críticos atualizados
echo ""
echo -e "${YELLOW}2. Verificando arquivos críticos...${NC}"

CRITICAL_FILES=(
    "public/sw.js"
    "src/components/RelatorioTable.tsx"
    "src/components/InstrumentoForm.tsx"
    "src/components/FuncoesForm.tsx"
    "src/app/instrutor/page.tsx"
    "src/app/admin/page.tsx"
    "src/app/api/webhook/route.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✅${NC} $file"
    else
        echo -e "   ${RED}❌${NC} $file (NÃO ENCONTRADO!)"
    fi
done

# 3. Verificar versão do Service Worker
echo ""
echo -e "${YELLOW}3. Verificando versão do Service Worker...${NC}"
if [ -f "public/sw.js" ]; then
    SW_VERSION=$(grep -oP "CACHE_NAME = 'gestao-ensaio-v\K\d+" public/sw.js || echo "não encontrada")
    echo "   Versão atual: v$SW_VERSION"
    
    if [ "$SW_VERSION" -lt 3 ]; then
        echo -e "   ${YELLOW}⚠️  Versão antiga detectada. Execute: ./scripts/atualizar-service-worker.sh${NC}"
    fi
else
    echo -e "   ${RED}❌ Arquivo sw.js não encontrado!${NC}"
fi

# 4. Verificar node_modules
echo ""
echo -e "${YELLOW}4. Verificando dependências...${NC}"
if [ ! -d "node_modules" ]; then
    echo "   Instalando dependências..."
    npm install
else
    echo -e "   ${GREEN}✅ node_modules existe${NC}"
fi

# 5. Verificar Prisma
echo ""
echo -e "${YELLOW}5. Verificando Prisma Client...${NC}"
if [ ! -d "node_modules/.prisma" ]; then
    echo "   Gerando Prisma Client..."
    npm run db:generate
else
    echo -e "   ${GREEN}✅ Prisma Client existe${NC}"
fi

# 6. Resumo
echo ""
echo -e "${BLUE}════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Verificação concluída!${NC}"
echo ""
echo "Próximos passos:"
echo "  1. Execute: ./scripts/deploy-producao-completo.sh"
echo "  2. Ou manualmente:"
echo "     - npm run build"
echo "     - pm2 restart gestao-ensaio"
echo ""
