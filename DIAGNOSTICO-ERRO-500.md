# 🔧 Diagnóstico Erro 500 - Aplicação Rodando

## ✅ Status Atual
- ✅ Next.js está rodando (Ready in 585ms)
- ✅ PM2 está gerenciando o processo
- ❌ Erro 500 ao acessar via navegador

## 🔍 Diagnóstico Passo a Passo

### 1. Verificar Logs de Erro em Tempo Real

```bash
# Ver logs de erro
pm2 logs gestao-ensaio --err --lines 50

# Ver todos os logs
pm2 logs gestao-ensaio --lines 100
```

### 2. Testar Aplicação Localmente (Porta 3000)

```bash
# No servidor, testar diretamente
curl http://localhost:3000
curl http://localhost:3000/api/health
```

Se funcionar em `localhost:3000` mas não funcionar via domínio, o problema é no **Nginx**.

### 3. Verificar Configuração Nginx

```bash
# Ver configuração
sudo cat /etc/nginx/sites-available/gestao-ensaio
# ou
sudo cat /etc/nginx/sites-enabled/gestao-ensaio

# Testar configuração
sudo nginx -t

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### 4. Verificar Variáveis de Ambiente

```bash
cd /var/www/gestao-ensaio

# Verificar se .env existe
ls -la .env

# Ver conteúdo (cuidado com senhas!)
cat .env

# Verificar se variáveis estão sendo carregadas
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? 'OK' : 'FALTA')"
```

### 5. Testar Conexão com Banco

```bash
# Testar conexão MySQL
mysql -u usuario -p gestao_ensaio

# Se conectar, execute:
SHOW TABLES;
```

### 6. Verificar Prisma Client

```bash
cd /var/www/gestao-ensaio

# Verificar se Prisma Client foi gerado
ls -la node_modules/.prisma/client/

# Se não existir, gerar
npm run db:generate
```

## 🛠️ Soluções Rápidas

### Solução 1: Verificar Erro Específico

```bash
# Acessar rota de health check
curl http://localhost:3000/api/health

# Se retornar JSON, a aplicação está OK
# Se retornar erro, ver a mensagem específica
```

### Solução 2: Rebuild Completo

```bash
cd /var/www/gestao-ensaio

# Parar
pm2 stop gestao-ensaio

# Limpar tudo
rm -rf .next node_modules/.cache

# Regenerar Prisma
npm run db:generate

# Rebuild
npm run build

# Reiniciar
pm2 restart gestao-ensaio

# Ver logs
pm2 logs gestao-ensaio
```

### Solução 3: Verificar Nginx

```bash
# Ver configuração atual
sudo cat /etc/nginx/sites-enabled/gestao-ensaio

# Se não existir ou estiver errado, criar:
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
# Ativar e reiniciar
sudo ln -s /etc/nginx/sites-available/gestao-ensaio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🎯 Comandos de Diagnóstico Rápido

Execute estes comandos no servidor:

```bash
# 1. Ver se aplicação responde localmente
curl -v http://localhost:3000

# 2. Ver logs de erro
pm2 logs gestao-ensaio --err --lines 20

# 3. Ver logs do Nginx
sudo tail -20 /var/log/nginx/error.log

# 4. Testar health check
curl http://localhost:3000/api/health

# 5. Verificar variáveis de ambiente
cd /var/www/gestao-ensaio
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'FALTANDO')"
```

## 📋 Checklist

Execute e verifique:

- [ ] `curl http://localhost:3000` retorna HTML (não erro)
- [ ] `curl http://localhost:3000/api/health` retorna JSON
- [ ] `pm2 logs gestao-ensaio` não mostra erros críticos
- [ ] Arquivo `.env` existe e tem `DATABASE_URL`
- [ ] `npm run db:generate` executado com sucesso
- [ ] Nginx está configurado e rodando
- [ ] Nginx está fazendo proxy para `localhost:3000`

## 🆘 Se Nada Funcionar

Execute diagnóstico completo:

```bash
cd /var/www/gestao-ensaio
chmod +x scripts/diagnostico-completo.sh
./scripts/diagnostico-completo.sh
```
