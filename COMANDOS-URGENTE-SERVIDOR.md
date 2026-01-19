# 🚨 COMANDOS URGENTES - Executar no Servidor AGORA

## 📋 Execute Estes Comandos no Servidor (SSH)

### 1. Conectar ao Servidor
```bash
ssh root@seu-servidor
# ou
ssh usuario@seu-servidor
```

### 2. Ir para a Pasta
```bash
cd /var/www/gestao-ensaio
```

### 3. Teste Rápido (Execute Primeiro!)
```bash
# Teste 1: Aplicação responde?
curl -v http://localhost:3000 2>&1 | head -30

# Teste 2: Health check?
curl http://localhost:3000/api/health

# Teste 3: Ver erros
pm2 logs gestao-ensaio --err --lines 20
```

### 4. Ver Logs Completos
```bash
# Erros da aplicação
pm2 logs gestao-ensaio --err --lines 50

# Erros do Nginx
sudo tail -50 /var/log/nginx/error.log

# Ver resposta completa do erro
curl -v http://localhost:3000 2>&1
```

### 5. Verificar Variáveis de Ambiente
```bash
# Ver .env
cat .env

# Testar se variáveis são carregadas
node -e "require('dotenv').config(); console.log('DB:', process.env.DATABASE_URL ? 'OK' : 'FALTANDO')"
```

### 6. Rebuild Completo (Se Necessário)
```bash
cd /var/www/gestao-ensaio

# Parar
pm2 stop gestao-ensaio

# Limpar TUDO
rm -rf .next node_modules/.cache

# Verificar .env
cat .env | grep DATABASE_URL

# Regenerar Prisma
npm run db:generate

# Build
npm run build

# Se build falhar, veja o erro específico
# Se build passar, reinicie:
pm2 restart gestao-ensaio

# Ver logs
pm2 logs gestao-ensaio
```

### 7. Script de Debug Automático
```bash
cd /var/www/gestao-ensaio
chmod +x scripts/debug-500.sh
./scripts/debug-500.sh
```

## 🎯 Diagnóstico Rápido

### Se `curl http://localhost:3000` funcionar:
✅ **Aplicação OK** → Problema no **Nginx**
- Verifique: `sudo tail -f /var/log/nginx/error.log`
- Verifique configuração: `sudo cat /etc/nginx/sites-enabled/gestao-ensaio`

### Se `curl http://localhost:3000` NÃO funcionar:
❌ **Aplicação com problema**
- Veja logs: `pm2 logs gestao-ensaio --err`
- Verifique .env: `cat .env`
- Verifique build: `ls -la .next`

## 📤 Compartilhe Estes Resultados

Execute e compartilhe:
```bash
cd /var/www/gestao-ensaio

echo "=== 1. TESTE LOCALHOST ==="
curl -v http://localhost:3000 2>&1 | head -20

echo ""
echo "=== 2. HEALTH CHECK ==="
curl http://localhost:3000/api/health

echo ""
echo "=== 3. ÚLTIMOS ERROS PM2 ==="
pm2 logs gestao-ensaio --err --lines 10 --nostream

echo ""
echo "=== 4. ERROS NGINX ==="
sudo tail -10 /var/log/nginx/error.log

echo ""
echo "=== 5. .ENV ==="
[ -f .env ] && echo "Arquivo existe" || echo "Arquivo NÃO existe"
[ -f .env ] && grep -q DATABASE_URL .env && echo "DATABASE_URL configurado" || echo "DATABASE_URL NÃO configurado"
```

## 🔧 Correção Rápida

```bash
cd /var/www/gestao-ensaio
pm2 stop gestao-ensaio
rm -rf .next
npm run build
pm2 restart gestao-ensaio
pm2 logs gestao-ensaio
```
