# Script para limpar pasta .next e resolver erro do OneDrive
# Execute: .\limpar-next.ps1

$ErrorActionPreference = "Stop"

Write-Host "Limpando pasta .next..." -ForegroundColor Yellow

# Tentar remover a pasta .next
if (Test-Path ".next") {
    try {
        Remove-Item -Recurse -Force ".next"
        Write-Host "Pasta .next removida com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "Erro ao remover pasta .next: $_" -ForegroundColor Red
        Write-Host "Tente fechar o OneDrive e executar novamente" -ForegroundColor Yellow
    }
} else {
    Write-Host "Pasta .next nao existe" -ForegroundColor Gray
}

Write-Host "`nPara iniciar o servidor, execute: npm run dev" -ForegroundColor Cyan
