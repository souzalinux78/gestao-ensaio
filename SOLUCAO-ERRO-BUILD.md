# 🔧 Solução: Erro "Could not find a production build"

## ❌ Erro:
```
Error: Could not find a production build in the '.next' directory. 
Try building your app with 'next build' before starting the production server.
```

## ✅ SOLUÇÃO RÁPIDA:

Execute no servidor (SSH):

```bash
cd /var/www/gestao-ensaio
rm -rf .next
npm run build
pm2 restart gestao-ensaio
```

## 📋 Passo a Passo Completo:

### 1. Conectar ao Servidor
```bash
ssh root@seu-servidor
```

### 2. Ir para a Pasta
```bash
cd /var/www/gestao-ensaio
```

### 3. Parar Aplicação
```bash
pm2 stop gestao-ensaio
```

### 4. Limpar Cache
```bash
rm -rf .next
rm -rf node_modules/.cache
```

### 5. Verificar Arquivos
```bash
# Verificar se código está atualizado
ls -la src/
ls -la public/

# Verificar .env existe
ls -la .env
```

### 6. Instalar Dependências (se necessário)
```bash
npm install
```

### 7. Gerar Prisma Client
```bash
npm run db:generate
```

### 8. Fazer Build
```bash
npm run build
```

**Aguarde até ver:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
```

### 9. Verificar Build
```bash
# Verificar se BUILD_ID foi criado
ls -la .next/BUILD_ID

# Ver BUILD_ID
cat .next/BUILD_ID

# Ver estrutura do build
ls -la .next/
```

### 10. Reiniciar Aplicação
```bash
pm2 restart gestao-ensaio
```

### 11. Verificar Logs
```bash
pm2 logs gestao-ensaio --lines 20
```

### 12. Testar
```bash
curl http://localhost:3000
```

## 🚀 Comando Único (Tudo de Uma Vez)

```bash
cd /var/www/gestao-ensaio && \
pm2 stop gestao-ensaio && \
rm -rf .next node_modules/.cache && \
npm install && \
npm run db:generate && \
npm run build && \
pm2 restart gestao-ensaio && \
pm2 logs gestao-ensaio --lines 20
```

## 🔍 Se o Build Falhar

### Verificar Erros:
```bash
npm run build 2>&1 | tee build-error.log
```

### Problemas Comuns:

1. **Erro de TypeScript:**
   - Verifique: `npm run build`
   - Corrija os erros mostrados

2. **Erro de Dependências:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. **Erro de Prisma:**
   ```bash
   npm run db:generate
   npm run build
   ```

4. **Erro de Memória:**
   ```bash
   # Aumentar memória do Node
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

## ✅ Checklist

- [ ] Conectado ao servidor
- [ ] Na pasta correta (`/var/www/gestao-ensaio`)
- [ ] Aplicação parada (`pm2 stop`)
- [ ] Cache limpo (`rm -rf .next`)
- [ ] Dependências instaladas (`npm install`)
- [ ] Prisma gerado (`npm run db:generate`)
- [ ] Build feito com sucesso (`npm run build`)
- [ ] BUILD_ID existe (`ls -la .next/BUILD_ID`)
- [ ] Aplicação reiniciada (`pm2 restart`)
- [ ] Testado (`curl http://localhost:3000`)

## 🆘 Se Ainda Não Funcionar

### Verificar Permissões:
```bash
sudo chown -R $USER:$USER /var/www/gestao-ensaio
chmod -R 755 /var/www/gestao-ensaio
```

### Ver Logs Detalhados:
```bash
pm2 logs gestao-ensaio --err --lines 50
```

### Verificar Espaço em Disco:
```bash
df -h
```

### Verificar Memória:
```bash
free -h
```
