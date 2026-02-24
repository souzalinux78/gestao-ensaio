#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-gestao-ensaio}"
BRANCH="${BRANCH:-main}"

if ! git diff --quiet || ! git diff --cached --quiet; then
  STASH_NAME="auto-stash deploy $(date '+%Y-%m-%d %H:%M:%S')"
  echo "[deploy] Alteracoes locais detectadas. Salvando em stash: ${STASH_NAME}"
  git stash push --include-untracked -m "${STASH_NAME}"
fi

echo "[deploy] Atualizando branch ${BRANCH}..."
git pull origin "${BRANCH}"

echo "[deploy] Instalando dependencias..."
npm install

echo "[deploy] Gerando cliente Prisma..."
npx prisma generate

echo "[deploy] Build de producao..."
npm run build

echo "[deploy] Reiniciando PM2 (${APP_NAME})..."
pm2 restart "${APP_NAME}" --update-env

echo "[deploy] OK"
echo "[deploy] Se precisar revisar alteracoes locais salvas: git stash list"
