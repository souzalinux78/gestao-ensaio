# 🚀 Comandos para Atualizar o Servidor

## 📋 Passo a Passo Completo

### 1. Conectar ao Servidor
```bash
ssh root@seu-servidor
# ou
ssh usuario@seu-servidor
```

### 2. Ir para a Pasta do Projeto
```bash
cd /var/www/gestao-ensaio
```

### 3. Atualizar Código (Git)
```bash
# Se estiver usando Git
git pull origin main
# ou
git pull origin master
```

### 4. Instalar Dependências (se houver novas)
```bash
npm install
```

### 5. Gerar Prisma Client (se necessário)
```bash
npm run db:generate
```

### 6. Fazer Build
```bash
# Limpar cache antigo
rm -rf .next

# Build de produção
npm run build
```

### 7. Verificar Build
```bash
# Verificar se BUILD_ID foi criado
ls -la .next/BUILD_ID

# Ver BUILD_ID
cat .next/BUILD_ID
```

### 8. Reiniciar Aplicação
```bash
# Reiniciar com PM2
pm2 restart gestao-ensaio

# Ou se não estiver rodando
pm2 start npm --name "gestao-ensaio" -- start
```

### 9. Verificar Logs
```bash
# Ver logs em tempo real
pm2 logs gestao-ensaio --lines 20

# Ver apenas erros
pm2 logs gestao-ensaio --err --lines 20
```

### 10. Testar Aplicação
```bash
# Testar localhost
curl http://localhost:3000

# Testar health check
curl http://localhost:3000/api/health
```

## ⚡ Comando Rápido (Tudo de Uma Vez)

```bash
cd /var/www/gestao-ensaio && \
git pull && \
npm install && \
npm run db:generate && \
rm -rf .next && \
npm run build && \
pm2 restart gestao-ensaio && \
pm2 logs gestao-ensaio --lines 20
```

## 🔧 Script Automático

Crie um script para facilitar:

```bash
# Criar script
nano /var/www/gestao-ensaio/update.sh
```

Cole este conteúdo:
```bash
#!/bin/bash

set -e

echo "🚀 Atualizando servidor..."
cd /var/www/gestao-ensaio

# Parar aplicação
echo "⏸️  Parando aplicação..."
pm2 stop gestao-ensaio 2>/dev/null || echo "Aplicação não estava rodando"

# Atualizar código (se usar Git)
if [ -d ".git" ]; then
    echo "📥 Atualizando código do Git..."
    git pull
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar Prisma
echo "🗄️  Gerando Prisma Client..."
npm run db:generate

# Limpar cache
echo "🧹 Limpando cache..."
rm -rf .next

# Build
echo "🔨 Fazendo build..."
npm run build

# Reiniciar
echo "🔄 Reiniciando aplicação..."
pm2 restart gestao-ensaio || pm2 start npm --name "gestao-ensaio" -- start

# Aguardar
echo "⏳ Aguardando inicialização..."
sleep 3

# Testar
echo "✅ Testando aplicação..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "302" ] || [ "$RESPONSE" == "307" ]; then
    echo "✅ Aplicação respondendo (Status: $RESPONSE)"
else
    echo "❌ Aplicação não está respondendo (Status: $RESPONSE)"
    echo "Verifique os logs: pm2 logs gestao-ensaio"
fi

echo ""
echo "✨ Atualização concluída!"
echo "Ver logs: pm2 logs gestao-ensaio"
```

Tornar executável:
```bash
chmod +x /var/www/gestao-ensaio/update.sh
```

Usar o script:
```bash
cd /var/www/gestao-ensaio
./update.sh
```

## 📤 Se Não Usar Git

### Opção 1: Upload Manual
1. Fazer build local: `npm run build`
2. Upload da pasta `.next` e `node_modules` via FTP/SCP
3. Executar no servidor:
   ```bash
   cd /var/www/gestao-ensaio
   pm2 restart gestao-ensaio
   ```

### Opção 2: SCP (Copiar do Local para Servidor)
```bash
# Do seu computador local
cd "C:\Users\eduardosouza\OneDrive\Documentos\Gestão de Ensaio\gestao-ensaio"

# Copiar arquivos necessários
scp -r src root@seu-servidor:/var/www/gestao-ensaio/
scp -r public root@seu-servidor:/var/www/gestao-ensaio/
scp package.json root@seu-servidor:/var/www/gestao-ensaio/
scp next.config.js root@seu-servidor:/var/www/gestao-ensaio/
scp tsconfig.json root@seu-servidor:/var/www/gestao-ensaio/

# Depois no servidor:
ssh root@seu-servidor
cd /var/www/gestao-ensaio
npm install
npm run build
pm2 restart gestao-ensaio
```

## 🔍 Verificar Atualização do Service Worker

Após atualizar, limpar cache do Service Worker:

1. No navegador (celular), acesse o site
2. Abra DevTools (se possível) ou limpe cache do navegador
3. O Service Worker será atualizado automaticamente

Ou force atualização:
- Chrome: Configurações → Privacidade → Limpar dados de navegação → Cache
- iOS Safari: Configurações → Safari → Limpar histórico e dados

## ✅ Checklist de Atualização

- [ ] Conectado ao servidor via SSH
- [ ] Código atualizado (Git ou upload)
- [ ] Dependências instaladas (`npm install`)
- [ ] Prisma Client gerado (`npm run db:generate`)
- [ ] Cache limpo (`rm -rf .next`)
- [ ] Build feito (`npm run build`)
- [ ] Aplicação reiniciada (`pm2 restart`)
- [ ] Aplicação respondendo (`curl http://localhost:3000`)
- [ ] Logs sem erros (`pm2 logs gestao-ensaio`)

## 🆘 Se Algo Der Errado

### Reverter para versão anterior:
```bash
cd /var/www/gestao-ensaio
pm2 stop gestao-ensaio
git reset --hard HEAD~1  # Se usar Git
# ou restaurar backup
npm run build
pm2 restart gestao-ensaio
```

### Ver logs de erro:
```bash
pm2 logs gestao-ensaio --err --lines 50
```

### Verificar status:
```bash
pm2 status
pm2 info gestao-ensaio
```
