# 🚨 Comandos para Diagnosticar Erro 500

## ⚡ Comandos Rápidos (Execute no Servidor)

### 1. Ver Logs de Erro
```bash
pm2 logs gestao-ensaio --err --lines 50
```

### 2. Testar Aplicação Localmente
```bash
# Deve retornar HTML ou redirecionamento
curl -v http://localhost:3000

# Deve retornar JSON com status
curl http://localhost:3000/api/health
```

### 3. Ver Logs do Nginx
```bash
sudo tail -50 /var/log/nginx/error.log
```

### 4. Verificar Configuração Nginx
```bash
sudo cat /etc/nginx/sites-enabled/gestao-ensaio
```

### 5. Testar Script de Diagnóstico
```bash
cd /var/www/gestao-ensaio
chmod +x scripts/testar-servidor.sh
./scripts/testar-servidor.sh
```

## 🔍 Diagnóstico Passo a Passo

### Passo 1: Aplicação está respondendo?
```bash
curl http://localhost:3000
```
- ✅ Se retornar HTML → Aplicação OK, problema no Nginx
- ❌ Se retornar erro → Problema na aplicação

### Passo 2: Health Check funciona?
```bash
curl http://localhost:3000/api/health
```
- ✅ Se retornar JSON → Aplicação OK
- ❌ Se retornar erro → Ver mensagem de erro

### Passo 3: Ver erro específico
```bash
pm2 logs gestao-ensaio --err --lines 100
```
Procure por:
- `DATABASE_URL`
- `Prisma`
- `Cannot find module`
- `Connection refused`

## 🛠️ Correção Rápida

```bash
cd /var/www/gestao-ensaio

# 1. Parar
pm2 stop gestao-ensaio

# 2. Verificar .env
cat .env

# 3. Regenerar Prisma
npm run db:generate

# 4. Rebuild
npm run build

# 5. Reiniciar
pm2 restart gestao-ensaio

# 6. Ver logs
pm2 logs gestao-ensaio
```

## 📋 Checklist Rápido

Execute e verifique cada item:

```bash
# ✅ Aplicação responde?
curl http://localhost:3000

# ✅ Health check funciona?
curl http://localhost:3000/api/health

# ✅ .env existe?
ls -la .env

# ✅ Prisma Client gerado?
ls -la node_modules/.prisma/client/

# ✅ PM2 rodando?
pm2 status

# ✅ Nginx configurado?
sudo nginx -t
```

## 🎯 Próximos Passos

1. **Execute o teste:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Veja o resultado:**
   - Se retornar JSON → Problema no Nginx
   - Se retornar erro → Veja a mensagem específica

3. **Compartilhe o resultado** para diagnóstico mais preciso
