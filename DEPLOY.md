# 🚀 Guia de Deploy - Gestão de Ensaio

## 📥 Baixar do GitHub

### 1. Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/gestao-ensaio.git

# Entre na pasta
cd gestao-ensaio
```

### 2. Verificar Branch e Atualizar

```bash
# Verificar branch atual
git branch

# Atualizar código do GitHub
git pull origin main

# Ou se estiver em outra branch
git pull origin master
```

## ☁️ Deploy em Servidor na Nuvem

### Opção 1: Vercel (Recomendado - Gratuito)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Deploy de produção
vercel --prod
```

**Configurações no Vercel:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Variáveis de Ambiente:**
```
DATABASE_URL=mysql://usuario:senha@host:porta/gestao_ensaio
NEXTAUTH_SECRET=seu-secret-aqui
```

### Opção 2: Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Deploy
railway up
```

### Opção 3: Render

1. Conecte seu repositório GitHub no Render
2. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node

### Opção 4: Servidor VPS (Ubuntu/Debian)

#### Passo 1: Preparar Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL
sudo apt install mysql-server -y

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

# Instalar Git
sudo apt install git -y
```

#### Passo 2: Clonar e Configurar Projeto

```bash
# Criar diretório para aplicações
sudo mkdir -p /var/www
cd /var/www

# Clonar repositório
sudo git clone https://github.com/SEU-USUARIO/gestao-ensaio.git
sudo chown -R $USER:$USER gestao-ensaio
cd gestao-ensaio

# Instalar dependências
npm install

# Configurar variáveis de ambiente
nano .env
```

**Conteúdo do `.env`:**
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/gestao_ensaio?schema=public"
NEXTAUTH_SECRET="seu-secret-aleatorio-aqui"
NODE_ENV=production
```

#### Passo 3: Configurar Banco de Dados

```bash
# Criar banco de dados
mysql -u root -p
```

```sql
CREATE DATABASE gestao_ensaio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gestao_user'@'localhost' IDENTIFIED BY 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON gestao_ensaio.* TO 'gestao_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Executar migrações
npm run db:push

# Popular dados iniciais
npm run db:seed
```

#### Passo 4: Build e Deploy

```bash
# Gerar build de produção
npm run build

# Iniciar com PM2
pm2 start npm --name "gestao-ensaio" -- start

# Salvar configuração PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Execute o comando que aparecer na tela
```

#### Passo 5: Configurar Nginx (Proxy Reverso)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Criar configuração
sudo nano /etc/nginx/sites-available/gestao-ensaio
```

**Conteúdo do arquivo:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

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
# Ativar site
sudo ln -s /etc/nginx/sites-available/gestao-ensaio /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### Passo 6: Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática (já configurado)
sudo certbot renew --dry-run
```

## 🔄 Atualizar Sistema no Servidor

```bash
# Entrar na pasta do projeto
cd /var/www/gestao-ensaio

# Atualizar código do GitHub
git pull origin main

# Instalar novas dependências
npm install

# Executar migrações do banco (se houver)
npm run db:push

# Rebuild
npm run build

# Reiniciar aplicação
pm2 restart gestao-ensaio
```

## 📋 Checklist de Deploy

### Antes do Deploy
- [ ] Código commitado e pushado no GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e configurado
- [ ] Domínio apontado para o servidor (se aplicável)

### Durante o Deploy
- [ ] Dependências instaladas (`npm install`)
- [ ] Build executado com sucesso (`npm run build`)
- [ ] Migrações do banco executadas (`npm run db:push`)
- [ ] Dados iniciais populados (`npm run db:seed`)

### Após o Deploy
- [ ] Aplicação rodando (`pm2 status` ou verificar no painel)
- [ ] Acesso ao site funcionando
- [ ] Login funcionando
- [ ] Banco de dados conectado
- [ ] SSL configurado (se aplicável)

## 🔐 Segurança

### Variáveis de Ambiente
Nunca commite o arquivo `.env` no Git!

```bash
# Verificar se .env está no .gitignore
cat .gitignore | grep .env
```

### Firewall
```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## 📊 Monitoramento

### Ver logs da aplicação
```bash
pm2 logs gestao-ensaio
```

### Ver status
```bash
pm2 status
```

### Reiniciar aplicação
```bash
pm2 restart gestao-ensaio
```

## 🆘 Troubleshooting

### Aplicação não inicia
```bash
# Ver logs
pm2 logs gestao-ensaio --lines 50

# Verificar se porta está em uso
sudo netstat -tulpn | grep 3000
```

### Erro de banco de dados
```bash
# Testar conexão
mysql -u gestao_user -p gestao_ensaio

# Verificar variável DATABASE_URL no .env
cat .env | grep DATABASE_URL
```

### Erro de build
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```
