# 📚 Comandos Git - Gestão de Ensaio

## 🔽 Baixar do GitHub

### Clonar Repositório
```bash
git clone https://github.com/SEU-USUARIO/gestao-ensaio.git
cd gestao-ensaio
```

### Atualizar Código Existente
```bash
# Verificar status
git status

# Atualizar do GitHub
git pull origin main
# ou
git pull origin master
```

## 📤 Enviar para GitHub

### Primeira Vez (Criar Repositório)
```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Initial commit: Sistema de Gestão de Ensaio"

# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/gestao-ensaio.git

# Enviar para GitHub
git push -u origin main
```

### Atualizações (Enviar Mudanças)
```bash
# Ver mudanças
git status

# Adicionar arquivos modificados
git add .

# Ou adicionar arquivos específicos
git add src/app/admin/page.tsx

# Fazer commit
git commit -m "Descrição das mudanças"

# Enviar para GitHub
git push origin main
```

## 🌿 Gerenciar Branches

### Criar Nova Branch
```bash
git checkout -b feature/nova-funcionalidade
```

### Mudar de Branch
```bash
git checkout main
```

### Ver Branches
```bash
git branch
```

### Mesclar Branch
```bash
git checkout main
git merge feature/nova-funcionalidade
```

## 🔄 Comandos Úteis

### Ver Histórico
```bash
git log
git log --oneline
```

### Desfazer Mudanças
```bash
# Desfazer mudanças não commitadas
git checkout -- arquivo.txt

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Desfazer último commit (remove mudanças)
git reset --hard HEAD~1
```

### Ver Diferenças
```bash
# Ver mudanças não commitadas
git diff

# Ver mudanças de um arquivo específico
git diff src/app/admin/page.tsx
```

## 🚀 Deploy em Servidor

### Opção 1: Clonar no Servidor
```bash
# No servidor
cd /var/www
git clone https://github.com/SEU-USUARIO/gestao-ensaio.git
cd gestao-ensaio
npm install
npm run build
```

### Opção 2: Usar Script de Deploy
```bash
# Tornar script executável
chmod +x scripts/deploy.sh

# Executar deploy
./scripts/deploy.sh
```

### Opção 3: Deploy Manual
```bash
# Atualizar código
git pull origin main

# Instalar dependências
npm install

# Executar migrações
npm run db:push

# Build
npm run build

# Reiniciar (com PM2)
pm2 restart gestao-ensaio
```

## 🔐 Configurar Git (Primeira Vez)

```bash
# Configurar nome
git config --global user.name "Seu Nome"

# Configurar email
git config --global user.email "seu@email.com"

# Ver configurações
git config --list
```

## 📝 .gitignore

O arquivo `.gitignore` já está configurado para ignorar:
- `node_modules/`
- `.next/`
- `.env`
- Arquivos de build

## ⚠️ Importante

**NUNCA commite:**
- Arquivos `.env` com senhas
- `node_modules/`
- `.next/`
- Arquivos de banco de dados (`.db`)

## 🔗 Links Úteis

- [Documentação Git](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
