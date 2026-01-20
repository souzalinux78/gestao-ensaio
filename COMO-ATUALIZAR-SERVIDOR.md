# 📤 Como Atualizar Arquivos no Servidor

## 🎯 Problema: Arquivos não estão sendo atualizados

Se os arquivos não estão sendo baixados/atualizados no servidor, siga este guia.

## ✅ Solução 1: Usando Git (Recomendado)

### No Servidor:

```bash
cd /var/www/gestao-ensaio

# 1. Verificar e atualizar via Git
chmod +x scripts/atualizar-servidor.sh
./scripts/atualizar-servidor.sh
```

Este script:
- ✅ Verifica se há atualizações no Git
- ✅ Faz pull das atualizações
- ✅ Verifica se todos os arquivos estão presentes
- ✅ Instala dependências se necessário

### Se você ainda não fez commit/push das alterações:

**No seu computador (Windows):**

```bash
cd "C:\Users\eduardosouza\OneDrive\Documentos\Gestão de Ensaio\gestao-ensaio"

# Verificar status
git status

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Atualização: Botão Enviar e campos vazios"

# Fazer push
git push origin main
# ou
git push origin master
```

**Depois, no servidor:**

```bash
cd /var/www/gestao-ensaio
./scripts/atualizar-servidor.sh
```

## ✅ Solução 2: Upload Manual (Sem Git)

### Opção A: Usando SCP (do Windows com PowerShell ou WSL)

```powershell
# Conectar ao servidor e copiar arquivos
scp -r "C:\Users\eduardosouza\OneDrive\Documentos\Gestão de Ensaio\gestao-ensaio\src" usuario@servidor:/var/www/gestao-ensaio/

scp "C:\Users\eduardosouza\OneDrive\Documentos\Gestão de Ensaio\gestao-ensaio\public\sw.js" usuario@servidor:/var/www/gestao-ensaio/public/

scp -r "C:\Users\eduardosouza\OneDrive\Documentos\Gestão de Ensaio\gestao-ensaio\scripts" usuario@servidor:/var/www/gestao-ensaio/
```

### Opção B: Usando WinSCP ou FileZilla

1. Conecte ao servidor via SFTP
2. Navegue até `/var/www/gestao-ensaio`
3. Copie as pastas/arquivos:
   - `src/` (pasta completa)
   - `public/sw.js`
   - `scripts/` (pasta completa)
   - `nginx-config-corrigido.conf`

### Opção C: Usando rsync (se tiver acesso SSH)

```bash
# Do seu computador (se tiver rsync instalado)
rsync -avz --exclude 'node_modules' --exclude '.next' \
  "C:\Users\eduardosouza\OneDrive\Documentos\Gestão de Ensaio\gestao-ensaio/" \
  usuario@servidor:/var/www/gestao-ensaio/
```

## ✅ Solução 3: Verificar Arquivos no Servidor

Após copiar os arquivos, verifique se estão todos presentes:

```bash
cd /var/www/gestao-ensaio

# Dar permissão
chmod +x scripts/copiar-arquivos-manual.sh

# Verificar arquivos
./scripts/copiar-arquivos-manual.sh
```

## 🚀 Após Atualizar Arquivos

Sempre execute o deploy completo:

```bash
cd /var/www/gestao-ensaio

# 1. Atualizar Service Worker (se necessário)
./scripts/atualizar-service-worker.sh

# 2. Deploy completo
./scripts/deploy-producao-completo.sh
```

## 🔍 Verificação Final

### 1. Verificar se os arquivos foram atualizados:

```bash
# Verificar versão do Service Worker
grep "CACHE_NAME" public/sw.js

# Verificar se o botão Enviar está no código
grep -n "onEnviarWebhook" src/components/RelatorioTable.tsx

# Verificar se campos vazios estão implementados
grep -n "undefined" src/components/InstrumentoForm.tsx | head -5
```

### 2. Verificar se o build foi atualizado:

```bash
# Verificar data do build
ls -lh .next/BUILD_ID

# Verificar se há erros no build
pm2 logs gestao-ensaio --lines 50
```

### 3. Testar no navegador:

1. Abra em **modo anônimo** (Ctrl+Shift+N)
2. Faça **hard refresh** (Ctrl+Shift+R)
3. Abra o **Console** (F12) e verifique:
   - Logs do Service Worker
   - Erros JavaScript
   - Versão do cache

## 📋 Checklist Completo

- [ ] Arquivos copiados para o servidor
- [ ] `./scripts/copiar-arquivos-manual.sh` executado (verificação)
- [ ] `./scripts/atualizar-service-worker.sh` executado
- [ ] `./scripts/deploy-producao-completo.sh` executado
- [ ] PM2 reiniciado
- [ ] Nginx recarregado (se necessário)
- [ ] Testado em modo anônimo
- [ ] Hard refresh realizado

## ⚠️ Problemas Comuns

### "Arquivo não encontrado"
- Verifique o caminho: `ls -la /var/www/gestao-ensaio/src/components/`
- Verifique permissões: `chmod -R 755 /var/www/gestao-ensaio`

### "Build falha"
- Verifique logs: `pm2 logs gestao-ensaio`
- Limpe tudo: `rm -rf .next node_modules/.cache`
- Reinstale: `npm install`

### "Atualizações não aparecem"
- Service Worker: Incremente a versão
- Cache do navegador: Use modo anônimo
- Nginx: Recarregue com `sudo systemctl reload nginx`

## 📞 Comandos Rápidos

```bash
# Atualizar tudo de uma vez
cd /var/www/gestao-ensaio && \
./scripts/atualizar-servidor.sh && \
./scripts/atualizar-service-worker.sh && \
./scripts/deploy-producao-completo.sh
```
