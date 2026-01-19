# 🚀 Diagnóstico Erro 500 - Servidor em Produção

## 🔍 Comandos para Executar no Servidor (via SSH)

### 1. Conectar ao Servidor
```bash
ssh usuario@seu-servidor
# ou
ssh root@seu-servidor
```

### 2. Ir para a Pasta do Projeto
```bash
cd /var/www/gestao-ensaio
# ou o caminho onde está seu projeto
```

### 3. Testar Aplicação Localmente (CRÍTICO)
```bash
# Teste 1: Ver se aplicação responde
curl -I http://localhost:3000

# Teste 2: Ver resposta completa
curl http://localhost:3000

# Teste 3: Health check
curl http://localhost:3000/api/health
```

**Interpretação:**
- ✅ Se `localhost:3000` funciona → Problema no **Nginx**
- ❌ Se `localhost:3000` não funciona → Problema na **aplicação**

### 4. Ver Logs de Erro da Aplicação
```bash
# Ver últimos erros
pm2 logs gestao-ensaio --err --lines 50

# Ver todos os logs
pm2 logs gestao-ensaio --lines 100

# Ver logs em tempo real
pm2 logs gestao-ensaio
```

### 5. Verificar Status do PM2
```bash
pm2 status
pm2 info gestao-ensaio
```

### 6. Verificar Logs do Nginx
```bash
# Erros do Nginx
sudo tail -50 /var/log/nginx/error.log

# Acessos do Nginx
sudo tail -50 /var/log/nginx/access.log

# Ver logs em tempo real
sudo tail -f /var/log/nginx/error.log
```

### 7. Verificar Configuração do Nginx
```bash
# Ver configuração
sudo cat /etc/nginx/sites-enabled/gestao-ensaio
# ou
sudo cat /etc/nginx/sites-available/gestao-ensaio

# Testar configuração
sudo nginx -t

# Ver todas as configurações ativas
sudo ls -la /etc/nginx/sites-enabled/
```

### 8. Verificar Variáveis de Ambiente
```bash
cd /var/www/gestao-ensaio

# Ver se .env existe
ls -la .env

# Ver conteúdo (cuidado - pode ter senhas!)
cat .env

# Verificar se variáveis estão sendo carregadas
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'OK' : 'FALTANDO')"
```

### 9. Verificar Conexão com Banco
```bash
# Extrair informações do .env
cd /var/www/gestao-ensaio
DB_URL=$(grep DATABASE_URL .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")

# Testar conexão (ajuste usuário/senha)
mysql -h host -u usuario -p gestao_ensaio
```

### 10. Verificar Build
```bash
cd /var/www/gestao-ensaio

# Ver se build existe
ls -la .next

# Ver BUILD_ID
cat .next/BUILD_ID 2>/dev/null || echo "Build não encontrado"
```

## 🛠️ Correção Rápida em Produção

### Opção 1: Rebuild Completo
```bash
cd /var/www/gestao-ensaio

# 1. Parar aplicação
pm2 stop gestao-ensaio

# 2. Limpar cache
rm -rf .next
rm -rf node_modules/.cache

# 3. Verificar .env
cat .env | grep DATABASE_URL

# 4. Regenerar Prisma Client
npm run db:generate

# 5. Rebuild
npm run build

# 6. Reiniciar
pm2 restart gestao-ensaio

# 7. Ver logs
pm2 logs gestao-ensaio --lines 20
```

### Opção 2: Verificar e Corrigir Nginx
```bash
# Ver configuração atual
sudo cat /etc/nginx/sites-enabled/gestao-ensaio

# Se não existir ou estiver errado, criar/editar:
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
# Ativar e testar
sudo ln -sf /etc/nginx/sites-available/gestao-ensaio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🎯 Diagnóstico Rápido (Execute Tudo)

```bash
cd /var/www/gestao-ensaio

echo "=== 1. Testando localhost:3000 ==="
curl -I http://localhost:3000

echo ""
echo "=== 2. Testando health check ==="
curl http://localhost:3000/api/health

echo ""
echo "=== 3. Status PM2 ==="
pm2 status

echo ""
echo "=== 4. Últimos erros ==="
pm2 logs gestao-ensaio --err --lines 10 --nostream

echo ""
echo "=== 5. Erros do Nginx ==="
sudo tail -10 /var/log/nginx/error.log

echo ""
echo "=== 6. Verificando .env ==="
[ -f .env ] && echo "✅ .env existe" || echo "❌ .env não existe"
[ -f .env ] && grep -q DATABASE_URL .env && echo "✅ DATABASE_URL configurado" || echo "❌ DATABASE_URL não configurado"

echo ""
echo "=== 7. Verificando build ==="
[ -d .next ] && echo "✅ Build existe" || echo "❌ Build não existe"
```

## 📋 Checklist de Produção

Execute e marque:

- [ ] `curl http://localhost:3000` retorna HTML (não erro 500)
- [ ] `curl http://localhost:3000/api/health` retorna JSON
- [ ] `pm2 status` mostra aplicação como "online"
- [ ] Arquivo `.env` existe e tem `DATABASE_URL`
- [ ] `npm run db:generate` executado com sucesso
- [ ] Pasta `.next` existe (build feito)
- [ ] Nginx está rodando (`sudo systemctl status nginx`)
- [ ] Nginx está configurado corretamente
- [ ] Logs não mostram erros críticos

## 🆘 Problemas Comuns em Produção

### Problema 1: Variáveis de Ambiente Não Carregadas
```bash
# Verificar se .env está na raiz
cd /var/www/gestao-ensaio
ls -la .env

# Verificar se Next.js está carregando
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

### Problema 2: Prisma Client Não Gerado
```bash
cd /var/www/gestao-ensaio
npm run db:generate
npm run build
pm2 restart gestao-ensaio
```

### Problema 3: Nginx Não Fazendo Proxy
```bash
# Verificar se Nginx está apontando para localhost:3000
sudo grep -r "proxy_pass" /etc/nginx/sites-enabled/

# Deve mostrar: proxy_pass http://localhost:3000;
```

### Problema 4: Porta 3000 Não Está Escutando
```bash
# Verificar se porta está em uso
sudo netstat -tulpn | grep 3000
# ou
sudo ss -tulpn | grep 3000
```

### Problema 5: Permissões de Arquivo
```bash
# Corrigir permissões
cd /var/www/gestao-ensaio
sudo chown -R $USER:$USER .
chmod -R 755 .
```

## 🔄 Reiniciar Tudo

```bash
# Reiniciar aplicação
pm2 restart gestao-ensaio

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar status
pm2 status
sudo systemctl status nginx
```

## 📞 Informações para Suporte

Se precisar de ajuda, execute e compartilhe:

```bash
cd /var/www/gestao-ensaio

echo "=== INFORMAÇÕES DO SERVIDOR ==="
echo "Node: $(node -v)"
echo "NPM: $(npm -v)"
echo "PM2: $(pm2 -v)"
echo ""
echo "=== TESTE LOCALHOST ==="
curl -I http://localhost:3000 2>&1
echo ""
echo "=== HEALTH CHECK ==="
curl http://localhost:3000/api/health 2>&1
echo ""
echo "=== STATUS PM2 ==="
pm2 status
echo ""
echo "=== ÚLTIMOS ERROS ==="
pm2 logs gestao-ensaio --err --lines 5 --nostream
```
