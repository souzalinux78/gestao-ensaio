# 🔧 Solução para Erro OneDrive com Next.js

## ❌ Erro
```
Error: EINVAL: invalid argument, readlink
```

Este erro ocorre quando o Next.js tenta acessar arquivos sincronizados pelo OneDrive.

## ✅ Soluções Rápidas

### Opção 1: Limpar pasta .next (Mais Rápido)
Execute no PowerShell dentro da pasta do projeto:

```powershell
# Navegue até a pasta do projeto
cd "C:\Users\eduardosouza\OneDrive\Documentos\Gestão de Ensaio\gestao-ensaio"

# Remova a pasta .next
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Inicie o servidor novamente
npm run dev
```

### Opção 2: Usar o Script PowerShell
Execute o script fornecido:

```powershell
cd "C:\Users\eduardosouza\OneDrive\Documentos\Gestão de Ensaio\gestao-ensaio"
.\limpar-next.ps1
npm run dev
```

### Opção 3: Configurar OneDrive
1. Abra as **Configurações do OneDrive**
2. Vá em **Backup** > **Gerenciar backup**
3. **Pause** a sincronização da pasta do projeto temporariamente
4. Ou exclua a pasta do backup do OneDrive

### Opção 4: Mover Projeto (Recomendado para Produção)
Mova o projeto para uma pasta **fora do OneDrive**:

```powershell
# Criar nova pasta
New-Item -ItemType Directory -Path "C:\Projetos\gestao-ensaio" -Force

# Copiar projeto (ou mover)
# Depois atualize o caminho no seu editor
```

## 📝 Arquivos Criados

- ✅ `.onedriveignore` - Instrui o OneDrive a ignorar `.next/`
- ✅ `limpar-next.ps1` - Script para limpar a pasta `.next`

## ⚠️ Importante

A pasta `.next` é gerada automaticamente pelo Next.js e **não precisa** ser sincronizada pelo OneDrive. Ela já está no `.gitignore`.

## 🚀 Após Limpar

Execute:
```powershell
npm run dev
```

O Next.js irá recriar a pasta `.next` automaticamente.
