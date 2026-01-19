# Solução para Erro OneDrive com Next.js

## Problema
O erro `EINVAL: invalid argument, readlink` ocorre quando o Next.js tenta acessar arquivos sincronizados pelo OneDrive, especialmente na pasta `.next`.

## Soluções

### Solução 1: Excluir pasta .next (Recomendado)
```powershell
cd gestao-ensaio
Remove-Item -Recurse -Force .next
npm run dev
```

### Solução 2: Configurar OneDrive para não sincronizar .next
1. Abra as configurações do OneDrive
2. Vá em "Backup" > "Gerenciar backup"
3. Exclua a pasta do projeto do backup do OneDrive
4. Ou use o arquivo `.onedriveignore` (já criado)

### Solução 3: Mover projeto para fora do OneDrive
Se possível, mova o projeto para uma pasta fora do OneDrive (ex: `C:\Projetos\gestao-ensaio`)

### Solução 4: Desabilitar sincronização de .next
O arquivo `.onedriveignore` foi criado para instruir o OneDrive a ignorar a pasta `.next`.

## Comandos Úteis

### Limpar cache do Next.js
```powershell
cd gestao-ensaio
Remove-Item -Recurse -Force .next
npm run dev
```

### Verificar se .next existe
```powershell
Test-Path gestao-ensaio\.next
```

## Nota
A pasta `.next` é gerada automaticamente pelo Next.js e não precisa ser sincronizada pelo OneDrive. Ela já está no `.gitignore`.
