@echo off
REM Script para copiar ícones para a pasta public
REM Execute: scripts\copiar-icones.bat

echo Copiando ícones para pasta public...
echo.

REM Ir para pasta do projeto
cd /d "%~dp0.."

REM Copiar logo se existir
if exist "logo.png" (
    echo Copiando logo.png...
    copy "logo.png" "public\logo.png"
    echo Logo copiado!
) else (
    echo Logo.png nao encontrado na raiz
)

REM Copiar favicons se existir
if exist "favicons\favicon-16x16.png" (
    echo Copiando favicons...
    copy "favicons\favicon-16x16.png" "public\favicon-16x16.png"
    echo Favicons copiados!
) else (
    echo Pasta favicons nao encontrada
)

echo.
echo Concluido!
echo.
echo IMPORTANTE: Ainda precisa criar:
echo   - public\favicon.ico (use https://favicon.io/favicon-converter/)
echo   - public\icon-192.png (192x192 pixels)
echo   - public\icon-512.png (512x512 pixels)
echo.
pause
