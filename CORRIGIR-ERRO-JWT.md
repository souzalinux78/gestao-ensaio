# 🔧 Corrigir Erro: Module not found 'jsonwebtoken'

## ✅ O Que Foi Feito

1. ✅ `jsonwebtoken` adicionado ao `package.json` (dependencies)
2. ✅ `@types/jsonwebtoken` adicionado ao `package.json` (devDependencies)
3. ✅ Dependências instaladas localmente

## 🚀 Próximos Passos no Servidor

### Opção 1: Usar Script de Atualização (Recomendado)

```bash
# No servidor
cd /var/www/gestao-ensaio
./scripts/update-server.sh
```

O script automaticamente:
- Faz `git pull` (pega package.json atualizado)
- Executa `npm install` (instala jsonwebtoken)
- Gera Prisma Client
- Faz build
- Reinicia aplicação

### Opção 2: Manual

```bash
# No servidor
cd /var/www/gestao-ensaio

# 1. Atualizar código
git pull

# 2. Instalar dependências
npm install

# 3. Gerar Prisma Client
npm run db:generate

# 4. Build
npm run build

# 5. Reiniciar
pm2 restart gestao-ensaio
```

## ⚠️ Importante

Antes de executar no servidor, certifique-se de:

1. **Fazer commit e push do package.json atualizado:**
   ```bash
   git add package.json package-lock.json
   git commit -m "Adicionar dependências JWT"
   git push
   ```

2. **Verificar se JWT_SECRET está no .env do servidor:**
   ```bash
   # No servidor
   echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
   ```

3. **Aplicar migração do banco (se ainda não fez):**
   ```bash
   # No servidor
   npx prisma migrate deploy
   # OU
   npx prisma db push
   ```

## ✅ Verificação

Após atualizar, verificar se funcionou:

```bash
# No servidor
pm2 logs gestao-ensaio --lines 50
```

Procurar por erros relacionados a `jsonwebtoken`. Se não houver, está funcionando!
