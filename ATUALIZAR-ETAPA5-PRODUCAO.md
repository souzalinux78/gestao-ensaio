# 🚀 Como Atualizar Servidor Após ETAPA 5

## O que foi alterado na ETAPA 5:
- ✅ JWT agora inclui `tenantId` no payload
- ✅ Tipo `Usuario` atualizado com `tenantId`
- ✅ `get-user-from-request.ts` atualizado
- ✅ `verificarCredenciais` atualizado

## ⚠️ IMPORTANTE:
**NÃO precisa executar migrations!** Apenas atualizar o código.

---

## Opção 1: Script Automatizado (Recomendado)

```bash
# 1. Conectar ao servidor
ssh usuario@servidor

# 2. Ir para o diretório do projeto
cd /var/www/gestao-ensaio

# 3. Executar script de atualização
./scripts/update-server.sh
```

O script faz:
- ✅ Para aplicação
- ✅ Atualiza código (git pull)
- ✅ Instala dependências
- ✅ Gera Prisma Client
- ✅ Limpa cache
- ✅ Faz build
- ✅ Reinicia aplicação

---

## Opção 2: Manual (Passo a Passo)

```bash
# 1. Conectar ao servidor
ssh usuario@servidor

# 2. Ir para o diretório
cd /var/www/gestao-ensaio

# 3. Parar aplicação
pm2 stop gestao-ensaio

# 4. Atualizar código (se usar Git)
git pull

# 5. Instalar dependências (se necessário)
npm install

# 6. Gerar Prisma Client (IMPORTANTE - schema foi atualizado)
npx prisma generate

# 7. Limpar cache
rm -rf .next
rm -rf node_modules/.cache

# 8. Build
npm run build

# 9. Reiniciar aplicação
pm2 restart gestao-ensaio

# 10. Verificar logs
pm2 logs gestao-ensaio --lines 50
```

---

## ⚠️ Comandos Críticos:

### 1. Gerar Prisma Client (OBRIGATÓRIO)
```bash
npx prisma generate
```
**Por quê?** O schema Prisma foi atualizado com `tenantId`, então o Prisma Client precisa ser regenerado.

### 2. Build
```bash
npm run build
```
**Por quê?** O código TypeScript foi alterado (JWT, tipos, etc).

### 3. Reiniciar PM2
```bash
pm2 restart gestao-ensaio
```
**Por quê?** Para carregar o novo código.

---

## Verificação Pós-Atualização:

### 1. Verificar se aplicação está rodando:
```bash
pm2 status
```

### 2. Verificar logs:
```bash
pm2 logs gestao-ensaio --lines 50
```

### 3. Testar login:
- Fazer login no sistema
- Verificar se token JWT inclui `tenantId` (via DevTools → Application → Local Storage)
- Verificar se não há erros no console

### 4. Verificar se Prisma Client foi atualizado:
```bash
# Verificar se arquivo foi atualizado recentemente
ls -la node_modules/.prisma/client/
```

---

## Troubleshooting:

### Erro: "Prisma Client not generated"
```bash
npx prisma generate
```

### Erro: "Type error: tenantId does not exist"
```bash
# Regenerar Prisma Client
npx prisma generate
# Rebuild
npm run build
```

### Erro: "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npm run build
```

### Aplicação não inicia:
```bash
# Ver logs detalhados
pm2 logs gestao-ensaio --err --lines 100

# Verificar se build foi criado
ls -la .next/

# Tentar rebuild
rm -rf .next
npm run build
pm2 restart gestao-ensaio
```

---

## Checklist:

Antes de atualizar:
- [ ] Backup do código atual (git commit ou backup manual)
- [ ] Verificar se migrations anteriores foram executadas (ETAPAS 1-4)
- [ ] Janela de manutenção agendada (se necessário)

Após atualizar:
- [ ] Aplicação está rodando (`pm2 status`)
- [ ] Sem erros nos logs (`pm2 logs`)
- [ ] Login funciona corretamente
- [ ] Token JWT inclui `tenantId` (verificar no DevTools)

---

## Comando Rápido (Tudo em Um):

```bash
cd /var/www/gestao-ensaio && \
pm2 stop gestao-ensaio && \
git pull && \
npm install && \
npx prisma generate && \
rm -rf .next node_modules/.cache && \
npm run build && \
pm2 restart gestao-ensaio && \
pm2 logs gestao-ensaio --lines 20
```

---

## Próximos Passos:

Após atualizar com sucesso:
1. ✅ **ETAPA 5 COMPLETA** - JWT atualizado
2. ⏭️ **ETAPA 6** - Criar middleware tenantResolver
3. ⏭️ **ETAPA 8** - Atualizar queries para filtrar por tenantId
4. ⏭️ **ETAPA 9** - Atualizar autenticação/registro
