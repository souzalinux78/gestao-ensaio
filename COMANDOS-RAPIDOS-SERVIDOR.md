# ⚡ Comandos Rápidos para Servidor

## 🔍 Diagnosticar Erro 500

### Ver Logs
```bash
pm2 logs gestao-ensaio --lines 50
```

### Verificar Status
```bash
pm2 status
```

### Verificar Porta
```bash
sudo netstat -tulpn | grep 3000
```

### Testar Rota de Health
```bash
curl http://localhost:3000/api/health
# Ou no navegador: http://seu-servidor/api/health
```

## 🔧 Corrigir Rapidamente

### Opção 1: Script Automático
```bash
cd /var/www/gestao-ensaio
chmod +x scripts/fix-500-error.sh
./scripts/fix-500-error.sh
```

### Opção 2: Manual
```bash
cd /var/www/gestao-ensaio

# 1. Parar
pm2 stop gestao-ensaio

# 2. Limpar
rm -rf .next

# 3. Rebuild
npm run build

# 4. Reiniciar
pm2 restart gestao-ensaio

# 5. Ver logs
pm2 logs gestao-ensaio
```

## ✅ Verificações Essenciais

### 1. Arquivo .env existe?
```bash
ls -la .env
cat .env
```

### 2. Banco de dados conecta?
```bash
# Testar conexão
mysql -u usuario -p gestao_ensaio
```

### 3. Build está OK?
```bash
npm run build
```

### 4. Aplicação está rodando?
```bash
pm2 list
curl http://localhost:3000
```

## 🆘 Problemas Comuns

### Erro: "Cannot find module"
```bash
rm -rf node_modules
npm install
npm run build
```

### Erro: "Prisma Client not generated"
```bash
npm run db:generate
npm run build
```

### Erro: "Database connection failed"
```bash
# Verificar .env
cat .env | grep DATABASE_URL

# Testar conexão
mysql -h host -u usuario -p gestao_ensaio
```

### Erro: "Port 3000 already in use"
```bash
# Ver o que está usando
sudo lsof -i :3000

# Matar processo
sudo kill -9 PID
```

## 📊 Monitoramento

### Ver logs em tempo real
```bash
pm2 logs gestao-ensaio
```

### Ver uso de recursos
```bash
pm2 monit
```

### Reiniciar tudo
```bash
pm2 restart all
sudo systemctl restart nginx
```
