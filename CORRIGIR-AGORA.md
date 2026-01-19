# 🚨 CORRIGIR ERRO 500 - Execute no Servidor

## 🔍 Problemas Identificados:

1. ❌ **Build não existe** - Erro: "Could not find a production build"
2. ❌ **Nginx configurado incorretamente** - Redirecionando para /index.html em vez de fazer proxy

## ✅ SOLUÇÃO RÁPIDA:

Execute no servidor (SSH):

```bash
cd /var/www/gestao-ensaio

# Opção 1: Script automático (RECOMENDADO)
chmod +x scripts/corrigir-producao.sh
./scripts/corrigir-producao.sh

# Opção 2: Manual
pm2 stop gestao-ensaio
rm -rf .next
npm run build
pm2 restart gestao-ensaio
```

## 🔧 Corrigir Nginx:

```bash
# Ver configuração atual
sudo cat /etc/nginx/sites-enabled/gestao-ensaio

# Corrigir configuração
sudo nano /etc/nginx/sites-available/gestao-ensaio
```

**Cole esta configuração (substitua tudo):**

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
# Ativar configuração
sudo ln -sf /etc/nginx/sites-available/gestao-ensaio /etc/nginx/sites-enabled/

# Testar
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx
```

## ✅ Verificar:

```bash
# 1. Testar localhost
curl http://localhost:3000

# 2. Ver status
pm2 status

# 3. Ver logs
pm2 logs gestao-ensaio --lines 20
```

## 🎯 Resumo:

Execute no servidor:
```bash
cd /var/www/gestao-ensaio
chmod +x scripts/corrigir-producao.sh
./scripts/corrigir-producao.sh
```

Este script irá:
1. ✅ Parar aplicação
2. ✅ Limpar cache
3. ✅ Fazer build
4. ✅ Reiniciar aplicação
5. ✅ Corrigir Nginx
6. ✅ Testar tudo
