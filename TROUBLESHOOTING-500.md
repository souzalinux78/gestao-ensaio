# 🔧 Troubleshooting - Erro 500 Internal Server Error

## 🔍 Diagnóstico Rápido

### 1. Verificar Logs da Aplicação

```bash
# Se estiver usando PM2
pm2 logs gestao-ensaio --lines 50

# Ou verificar logs do Next.js
tail -f /var/www/gestao-ensaio/.next/trace
```

### 2. Verificar se Aplicação Está Rodando

```bash
# Verificar PM2
pm2 status

# Verificar processo Node
ps aux | grep node

# Verificar porta 3000
sudo netstat -tulpn | grep 3000
```

### 3. Verificar Variáveis de Ambiente

```bash
cd /var/www/gestao-ensaio
cat .env

# Verificar se DATABASE_URL está correto
echo $DATABASE_URL
```

### 4. Verificar Conexão com Banco

```bash
# Testar conexão MySQL
mysql -u gestao_user -p gestao_ensaio

# Ou usando a URL do .env
mysql -h host -u usuario -p gestao_ensaio
```

## 🛠️ Soluções Comuns

### Problema 1: Variáveis de Ambiente Não Configuradas

```bash
# Criar/editar .env
cd /var/www/gestao-ensaio
nano .env
```

**Verificar se tem:**
```env
DATABASE_URL="mysql://usuario:senha@host:porta/gestao_ensaio"
NEXTAUTH_SECRET="seu-secret-aqui"
NODE_ENV=production
```

### Problema 2: Banco de Dados Não Criado

```bash
# Criar banco
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS gestao_ensaio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Problema 3: Migrações Não Executadas

```bash
cd /var/www/gestao-ensaio
npm run db:push
```

### Problema 4: Build Não Feito ou Desatualizado

```bash
# Limpar e rebuild
rm -rf .next
npm run build
pm2 restart gestao-ensaio
```

### Problema 5: Dependências Não Instaladas

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart gestao-ensaio
```

### Problema 6: Erro no Código

```bash
# Ver logs detalhados
pm2 logs gestao-ensaio --err --lines 100

# Verificar se build tem erros
npm run build
```

### Problema 7: Permissões de Arquivo

```bash
# Corrigir permissões
sudo chown -R $USER:$USER /var/www/gestao-ensaio
chmod -R 755 /var/www/gestao-ensaio
```

### Problema 8: Nginx Não Configurado Corretamente

```bash
# Verificar configuração Nginx
sudo nano /etc/nginx/sites-available/gestao-ensaio
```

**Configuração correta:**
```nginx
server {
    listen 80;
    server_name gestaoensaios.automatizeonline.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Testar e reiniciar Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## 🔄 Reiniciar Tudo

```bash
# Parar aplicação
pm2 stop gestao-ensaio

# Limpar
rm -rf .next node_modules/.cache

# Rebuild
npm run build

# Reiniciar
pm2 restart gestao-ensaio

# Verificar
pm2 status
pm2 logs gestao-ensaio
```

## 📋 Checklist de Verificação

- [ ] Aplicação está rodando (`pm2 status`)
- [ ] Porta 3000 está em uso (`netstat -tulpn | grep 3000`)
- [ ] Arquivo `.env` existe e está configurado
- [ ] Banco de dados existe e está acessível
- [ ] Migrações executadas (`npm run db:push`)
- [ ] Build feito com sucesso (`npm run build`)
- [ ] Nginx configurado corretamente
- [ ] Logs não mostram erros críticos

## 🆘 Comandos de Emergência

### Reiniciar Tudo
```bash
pm2 restart all
sudo systemctl restart nginx
```

### Ver Logs em Tempo Real
```bash
pm2 logs gestao-ensaio --lines 0
```

### Verificar Erros Específicos
```bash
# Erros do PM2
pm2 logs gestao-ensaio --err

# Logs do sistema
sudo journalctl -u nginx -f
```
