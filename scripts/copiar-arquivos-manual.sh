#!/bin/bash

# Script para copiar arquivos manualmente (se não usar Git)
# Use este script se você faz upload manual dos arquivos

set -e

echo "📋 COPIAR ARQUIVOS MANUALMENTE"
echo "=============================="
echo ""
echo "Este script ajuda a verificar se os arquivos foram copiados corretamente."
echo ""

# Diretório do projeto
PROJECT_DIR="/var/www/gestao-ensaio"
cd "$PROJECT_DIR" || exit 1

# Lista de arquivos que devem existir após atualização
echo "Verificando arquivos atualizados..."
echo ""

FILES_TO_CHECK=(
    "public/sw.js:Service Worker"
    "src/components/RelatorioTable.tsx:Componente RelatorioTable"
    "src/components/InstrumentoForm.tsx:Componente InstrumentoForm"
    "src/components/FuncoesForm.tsx:Componente FuncoesForm"
    "src/app/instrutor/page.tsx:Página do Instrutor"
    "src/app/admin/page.tsx:Página do Admin"
    "src/app/api/webhook/route.ts:API Webhook"
    "scripts/deploy-producao-completo.sh:Script de Deploy"
    "scripts/atualizar-service-worker.sh:Script Atualizar SW"
    "nginx-config-corrigido.conf:Configuração Nginx"
)

MISSING_FILES=0

for file_info in "${FILES_TO_CHECK[@]}"; do
    IFS=':' read -r file desc <<< "$file_info"
    if [ -f "$file" ]; then
        echo "✅ $desc: $file"
    else
        echo "❌ $desc: $file (NÃO ENCONTRADO!)"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

echo ""

if [ $MISSING_FILES -gt 0 ]; then
    echo "⚠️  ATENÇÃO: $MISSING_FILES arquivo(s) não encontrado(s)!"
    echo ""
    echo "Você precisa copiar os arquivos para o servidor."
    echo ""
    echo "Opções:"
    echo "  1. Usar Git: git pull"
    echo "  2. Usar SCP/SFTP para copiar arquivos"
    echo "  3. Usar rsync"
    echo ""
    echo "Exemplo com SCP (do seu computador):"
    echo "  scp -r src/ user@servidor:/var/www/gestao-ensaio/"
    echo "  scp public/sw.js user@servidor:/var/www/gestao-ensaio/public/"
    echo ""
else
    echo "✅ Todos os arquivos estão presentes!"
    echo ""
    echo "Agora execute o deploy:"
    echo "  ./scripts/deploy-producao-completo.sh"
fi
