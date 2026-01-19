# 🚀 Guia Rápido de Deploy

## 📥 Baixar do GitHub

```bash
# Clonar repositório
git clone https://github.com/SEU-USUARIO/gestao-ensaio.git
cd gestao-ensaio

# Instalar dependências
npm install
```

## ☁️ Deploy Rápido (Vercel - Recomendado)

### 1. Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "New Project"
4. Importe o repositório `gestao-ensaio`

### 2. Configurar Variáveis de Ambiente
No painel da Vercel, adicione:
```
DATABASE_URL=mysql://usuario:senha@host:porta/gestao_ensaio
NEXTAUTH_SECRET=seu-secret-aleatorio
```

### 3. Deploy Automático
A Vercel faz deploy automaticamente a cada push no GitHub!

## 🖥️ Deploy em VPS (Servidor Próprio)

### Passo 1: Preparar Servidor
```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL
sudo apt install mysql-server -y

# Instalar PM2
sudo npm install -g pm2
```

### Passo 2: Clonar e Configurar
```bash
# Clonar projeto
cd /var/www
sudo git clone https://github.com/SEU-USUARIO/gestao-ensaio.git
sudo chown -R $USER:$USER gestao-ensaio
cd gestao-ensaio

# Instalar dependências
npm install

# Criar arquivo .env
nano .env
```

**Conteúdo do `.env`:**
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/gestao_ensaio"
NEXTAUTH_SECRET="gere-um-secret-aleatorio-aqui"
NODE_ENV=production
```

### Passo 3: Configurar Banco
```bash
# Criar banco
mysql -u root -p
```

```sql
CREATE DATABASE gestao_ensaio;
CREATE USER 'gestao_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON gestao_ensaio.* TO 'gestao_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Executar migrações
npm run db:push
npm run db:seed
```

### Passo 4: Build e Iniciar
```bash
# Build
npm run build

# Iniciar com PM2
pm2 start npm --name "gestao-ensaio" -- start
pm2 save
pm2 startup
```

### Passo 5: Nginx (Opcional)
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/gestao-ensaio
```

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/gestao-ensaio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔄 Atualizar Sistema

```bash
cd /var/www/gestao-ensaio
git pull origin main
npm install
npm run db:push
npm run build
pm2 restart gestao-ensaio
```

## ✅ Checklist

- [ ] Código no GitHub
- [ ] Banco de dados criado
- [ ] Variáveis de ambiente configuradas
- [ ] Build executado com sucesso
- [ ] Aplicação rodando
- [ ] Domínio configurado (se aplicável)

## 🆘 Problemas Comuns

### Erro de conexão com banco
- Verifique `DATABASE_URL` no `.env`
- Teste conexão: `mysql -u usuario -p gestao_ensaio`

### Porta 3000 em uso
```bash
sudo lsof -i :3000
sudo kill -9 PID
```

### PM2 não inicia
```bash
pm2 logs gestao-ensaio
npm run build
```
