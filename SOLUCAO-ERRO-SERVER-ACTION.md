# 🔧 Solução: Erro "Failed to find Server Action"

## ❌ Erro:
```
Error: Failed to find Server Action "x". 
This request might be from an older or newer deployment.
```

## 🔍 Causa:

Este erro acontece quando:
1. O build foi atualizado mas o navegador tem cache da versão antiga
2. Há incompatibilidade entre build e código em execução
3. O build não foi feito corretamente

## ✅ SOLUÇÃO COMPLETA:

### No Servidor (SSH):

```bash
cd /var/www/gestao-ensaio

# Opção 1: Script automático (RECOMENDADO)
chmod +x scripts/corrigir-tudo.sh
./scripts/corrigir-tudo.sh

# Opção 2: Manual
pm2 stop gestao-ensaio
rm -rf .next node_modules/.cache
npm install
npm run db:generate
npm run build
pm2 restart gestao-ensaio
```

### No Navegador (Usuário):

**IMPORTANTE:** Limpar cache do navegador:

1. **Chrome/Edge:**
   - Pressione `Ctrl+Shift+Del` (Windows) ou `Cmd+Shift+Del` (Mac)
   - Selecione "Imagens e arquivos em cache"
   - Clique em "Limpar dados"
   - Ou: Abra em aba anônima (`Ctrl+Shift+N`)

2. **Safari (iOS):**
   - Configurações → Safari → Limpar histórico e dados do site

3. **Firefox:**
   - `Ctrl+Shift+Del` → Limpar cache

4. **Forçar atualização:**
   - `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)

## 🔄 Passo a Passo Completo:

### 1. No Servidor:
```bash
cd /var/www/gestao-ensaio
pm2 stop gestao-ensaio
rm -rf .next
npm run build
pm2 restart gestao-ensaio
```

### 2. Verificar Build:
```bash
ls -la .next/BUILD_ID
cat .next/BUILD_ID
```

### 3. Ver Logs:
```bash
pm2 logs gestao-ensaio --lines 20
```

### 4. Testar:
```bash
curl http://localhost:3000
```

### 5. No Navegador:
- Limpar cache
- Ou abrir em aba anônima
- Testar novamente

## 🎯 Prevenção:

Para evitar este erro no futuro:

1. **Sempre fazer rebuild após mudanças:**
   ```bash
   npm run build
   pm2 restart gestao-ensaio
   ```

2. **Limpar cache antes de testar:**
   - Use aba anônima para testes
   - Ou limpe cache regularmente

3. **Verificar BUILD_ID:**
   ```bash
   cat .next/BUILD_ID
   ```
   - Se mudou, o build foi atualizado

## 🆘 Se Ainda Não Funcionar:

1. **Verificar se build está completo:**
   ```bash
   ls -la .next/server
   ls -la .next/static
   ```

2. **Verificar permissões:**
   ```bash
   sudo chown -R $USER:$USER /var/www/gestao-ensaio
   ```

3. **Rebuild completo:**
   ```bash
   rm -rf .next node_modules/.cache
   npm install
   npm run build
   pm2 restart gestao-ensaio
   ```

4. **Ver logs detalhados:**
   ```bash
   pm2 logs gestao-ensaio --err --lines 50
   ```

## 📋 Checklist:

- [ ] Build feito com sucesso (`npm run build`)
- [ ] BUILD_ID existe (`ls -la .next/BUILD_ID`)
- [ ] Aplicação reiniciada (`pm2 restart`)
- [ ] Cache do navegador limpo
- [ ] Testado em aba anônima
