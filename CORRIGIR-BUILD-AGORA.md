# 🚨 CORRIGIR BUILD - Execute no Servidor

## ❌ Erro Atual:
```
Error: Could not find a production build in the '.next' directory
```

## ✅ SOLUÇÃO DEFINITIVA:

Execute no servidor (SSH):

```bash
cd /var/www/gestao-ensaio

# 1. Parar aplicação
pm2 stop gestao-ensaio

# 2. Limpar TUDO
rm -rf .next
rm -rf node_modules/.cache

# 3. Verificar se .env existe
ls -la .env

# 4. Instalar dependências (se necessário)
npm install

# 5. Gerar Prisma
npm run db:generate

# 6. Fazer build (AGUARDE - pode levar alguns minutos)
npm run build

# 7. Verificar se build foi criado
ls -la .next/BUILD_ID

# 8. Se BUILD_ID existe, reiniciar
pm2 restart gestao-ensaio

# 9. Ver logs
pm2 logs gestao-ensaio --lines 20
```

## 🔍 Se o Build Falhar:

### Ver o erro completo:
```bash
npm run build 2>&1 | tee build-log.txt
cat build-log.txt
```

### Problemas Comuns:

1. **Erro de TypeScript:**
   - Veja os erros no output
   - Corrija os arquivos mencionados

2. **Erro de Memória:**
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

3. **Erro de Permissões:**
   ```bash
   sudo chown -R $USER:$USER /var/www/gestao-ensaio
   chmod -R 755 /var/www/gestao-ensaio
   ```

4. **Erro de Espaço em Disco:**
   ```bash
   df -h
   # Se estiver cheio, limpe espaço
   ```

## 🎯 Script de Diagnóstico:

```bash
cd /var/www/gestao-ensaio
chmod +x scripts/diagnosticar-build.sh
./scripts/diagnosticar-build.sh
```

Este script vai:
- ✅ Verificar tudo
- ✅ Limpar cache
- ✅ Fazer build
- ✅ Verificar se funcionou

## 📋 Checklist:

Execute e verifique cada item:

```bash
# 1. Está na pasta correta?
pwd
# Deve mostrar: /var/www/gestao-ensaio

# 2. package.json existe?
ls -la package.json

# 3. .env existe?
ls -la .env

# 4. node_modules existe?
ls -la node_modules | head -5

# 5. Prisma gerado?
ls -la node_modules/.prisma/client | head -5

# 6. Espaço em disco?
df -h .

# 7. Memória disponível?
free -h
```

## 🆘 Se Nada Funcionar:

1. **Ver logs completos:**
   ```bash
   pm2 logs gestao-ensaio --err --lines 100
   ```

2. **Tentar build manualmente:**
   ```bash
   cd /var/www/gestao-ensaio
   npm run build
   ```

3. **Compartilhar output completo:**
   ```bash
   npm run build 2>&1
   ```
