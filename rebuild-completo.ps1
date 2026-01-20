# Script para limpar e reconstruir completamente a aplicação
Write-Host "🧹 Limpando arquivos de build..." -ForegroundColor Yellow

# Remover pasta .next se existir
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Pasta .next removida" -ForegroundColor Green
}

# Remover node_modules/.cache se existir
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✅ Cache do node_modules removido" -ForegroundColor Green
}

Write-Host "🔨 Reconstruindo aplicação..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
    Write-Host "🚀 Execute 'npm start' para iniciar o servidor" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erro no build. Verifique os erros acima." -ForegroundColor Red
    exit 1
}
