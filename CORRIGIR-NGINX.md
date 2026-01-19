# 🔧 CORRIGIR CONFIGURAÇÃO NGINX

## ❌ Problema Identificado:

A configuração atual está tentando servir arquivos estáticos:
```
root /var/www/gestao-ensaios/client/build;
try_files $uri $uri/ /index.html;
```

Mas a aplicação é **Next.js** que roda na porta **3000** e precisa de **proxy**.

## ✅ SOLUÇÃO:

### 1. Fazer Backup da Configuração Atual

```bash
sudo cp /etc/nginx/sites-available/gestao-ensaios /etc/nginx/sites-available/gestao-ensaios.backup
```

### 2. Corrigir Configuração

Edite o arquivo:
```bash
sudo nano /etc/nginx/sites-available/gestao-ensaios
```

**Substitua a seção `location /` dentro do bloco HTTPS (443) por:**

```nginx
    # Proxy para aplicação Next.js na porta 3000
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
```

### 3. Remover Linhas Incorretas

**Remova estas linhas:**
```nginx
root /var/www/gestao-ensaios/client/build;
try_files $uri $uri/ /index.html;
add_header Cache-Control "no-cache, no-store, must-revalidate" always;
```

### 4. Configuração Completa Corrigida

A seção HTTPS deve ficar assim:

```nginx
# Configuração HTTPS - Proxy para Next.js
server {
    listen 443 ssl http2;
    server_name gestaoensaios.automatizeonline.com.br;

    ssl_certificate /etc/letsencrypt/live/gestaoensaios.automatizeonline.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gestaoensaios.automatizeonline.com.br/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 10M;

    # Proxy para aplicação Next.js na porta 3000
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 5. Testar e Aplicar

```bash
# Testar configuração
sudo nginx -t

# Se OK, reiniciar
sudo systemctl restart nginx

# Verificar status
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
```

### 6. Verificar se Funcionou

```bash
# Testar localhost (deve funcionar)
curl http://localhost:3000

# Testar via HTTPS (deve funcionar agora)
curl -k https://gestaoensaios.automatizeonline.com.br
```

## 🎯 Resumo das Mudanças:

- ✅ **Mantido**: HTTPS, SSL, redirecionamentos
- ❌ **Removido**: `root`, `try_files`, `add_header Cache-Control`
- ✅ **Adicionado**: `proxy_pass http://localhost:3000` e headers de proxy

## ⚠️ Importante:

Certifique-se de que:
1. A aplicação Next.js está rodando na porta 3000
2. O build foi feito: `npm run build`
3. O PM2 está rodando: `pm2 status`
