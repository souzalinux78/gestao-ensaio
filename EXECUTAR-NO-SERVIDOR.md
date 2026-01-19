# 📋 Comandos para Executar no Servidor de Produção

## 🔐 1. Conectar ao Servidor
```bash
ssh root@seu-servidor
# ou
ssh usuario@seu-servidor
```

## 📁 2. Ir para a Pasta do Projeto
```bash
cd /var/www/gestao-ensaio
# ou o caminho onde está seu projeto
```

## 🧪 3. Teste Rápido (Execute Primeiro!)

```bash
# Teste 1: Aplicação responde?
curl http://localhost:3000

# Teste 2: Health check funciona?
curl http://localhost:3000/api/health

# Teste 3: Ver erros
pm2 logs gestao-ensaio --err --lines 20
```

**Se `localhost:3000` funcionar mas o navegador não → Problema no Nginx**

## 🔧 4. Diagnóstico Completo

Execute o script de diagnóstico:
```bash
cd /var/www/gestao-ensaio
chmod +x scripts/diagnostico-producao.sh
./scripts/diagnostico-producao.sh
```

## 🛠️ 5. Correção Rápida

```bash
cd /var/www/gestao-ensaio

# Parar
pm2 stop gestao-ensaio

# Limpar
rm -rf .next

# Rebuild
npm run build

# Reiniciar
pm2 restart gestao-ensaio

# Ver logs
pm2 logs gestao-ensaio
```

## 🔍 6. Verificar Nginx

```bash
# Ver configuração
sudo cat /etc/nginx/sites-enabled/gestao-ensaio

# Ver erros
sudo tail -50 /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 📊 7. Informações para Compartilhar

Execute e compartilhe o resultado:
```bash
cd /var/www/gestao-ensaio

echo "=== TESTE LOCALHOST ==="
curl -I http://localhost:3000

echo ""
echo "=== HEALTH CHECK ==="
curl http://localhost:3000/api/health

echo ""
echo "=== STATUS PM2 ==="
pm2 status

echo ""
echo "=== ÚLTIMOS ERROS ==="
pm2 logs gestao-ensaio --err --lines 10 --nostream
```
