# 🚀 Como Executar Migration 001 em Produção

## ⚠️ IMPORTANTE: Faça Backup Primeiro!

**SEMPRE faça backup do banco antes de executar migrations em produção!**

---

## 📋 Opções Disponíveis

### ✅ Opção 1: Script Automatizado (RECOMENDADO)

O script faz tudo automaticamente: backup, verificação, execução e validação.

```bash
# 1. Conectar ao servidor
ssh usuario@servidor

# 2. Ir para o diretório do projeto
cd /var/www/gestao-ensaio

# 3. Dar permissão de execução
chmod +x scripts/migrations/executar-migration-producao.sh

# 4. Executar script
./scripts/migrations/executar-migration-producao.sh
```

**O que o script faz:**
- ✅ Cria backup automático do banco
- ✅ Verifica se tabela já existe
- ✅ Executa a migration
- ✅ Verifica se foi criada corretamente
- ✅ Mostra resumo final

---

### ✅ Opção 2: Via MySQL Direto (Manual)

#### Passo 1: Backup

```bash
# Conectar ao servidor
ssh usuario@servidor

# Criar backup
mysqldump -u usuario -p nome_do_banco > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Passo 2: Executar Migration

```bash
# Opção A: Via arquivo SQL
mysql -u usuario -p nome_do_banco < scripts/migrations/001-create-tenant-table.sql

# Opção B: Via linha de comando
mysql -u usuario -p nome_do_banco
```

Dentro do MySQL, cole o conteúdo de `scripts/migrations/001-create-tenant-table.sql`

#### Passo 3: Verificar

```bash
mysql -u usuario -p nome_do_banco

# Verificar se tabela foi criada
SHOW TABLES LIKE 'Tenant';

# Verificar tenant padrão
SELECT * FROM Tenant WHERE slug = 'sistema-padrao';
```

---

### ✅ Opção 3: Via Prisma (Se disponível)

```bash
# 1. Conectar ao servidor
ssh usuario@servidor

# 2. Ir para o diretório
cd /var/www/gestao-ensaio

# 3. Gerar Prisma Client
npx prisma generate

# 4. Aplicar schema (cria tabela automaticamente)
npx prisma db push
```

⚠️ **ATENÇÃO**: `db push` aplica TODAS as mudanças do schema. Use apenas se tiver certeza.

---

## 🔍 Verificação Pós-Migration

Execute este script SQL para verificar se tudo está correto:

```bash
mysql -u usuario -p nome_do_banco < scripts/migrations/verificar-migration-001.sql
```

Ou execute manualmente:

```sql
-- Verificar se tabela existe
SHOW TABLES LIKE 'Tenant';

-- Verificar estrutura
DESCRIBE Tenant;

-- Verificar tenant padrão
SELECT id, nome, slug, ativo FROM Tenant WHERE slug = 'sistema-padrao';

-- Verificar índices
SHOW INDEX FROM Tenant;
```

**Resultado esperado:**
- ✅ Tabela `Tenant` existe
- ✅ Tenant com `slug = 'sistema-padrao'` existe
- ✅ Índices criados corretamente

---

## 🔄 Rollback (Se Necessário)

Se algo der errado, você pode reverter:

```sql
-- ⚠️ CUIDADO: Remove tabela e todos os dados!
DROP TABLE IF EXISTS Tenant;
```

Depois, restaure o backup:

```bash
mysql -u usuario -p nome_do_banco < backup_YYYYMMDD_HHMMSS.sql
```

---

## 📝 Informações do Servidor

Baseado no seu projeto, o servidor parece estar em:
- **Diretório**: `/var/www/gestao-ensaio`
- **Gerenciador**: PM2
- **Banco**: MySQL

### Comandos Úteis:

```bash
# Ver status da aplicação
pm2 status

# Ver logs
pm2 logs gestao-ensaio

# Parar aplicação (se necessário antes da migration)
pm2 stop gestao-ensaio

# Reiniciar aplicação (após migration)
pm2 restart gestao-ensaio
```

---

## ✅ Checklist Antes de Executar

- [ ] Backup do banco criado
- [ ] Testado em desenvolvimento/staging (se possível)
- [ ] Janela de manutenção agendada (se necessário)
- [ ] Equipe notificada
- [ ] Plano de rollback preparado
- [ ] Script de verificação pronto

---

## 🆘 Troubleshooting

### Erro: "Table 'Tenant' already exists"
- ✅ A migration já foi executada
- Verifique: `SELECT * FROM Tenant;`
- Se tudo estiver OK, pode prosseguir para ETAPA 2

### Erro: "Access denied"
- Verifique usuário e senha do MySQL
- Verifique permissões: `GRANT ALL PRIVILEGES ON nome_do_banco.* TO 'usuario'@'localhost';`

### Erro: "Unknown database"
- Verifique nome do banco: `SHOW DATABASES;`
- Crie se necessário: `CREATE DATABASE nome_do_banco;`

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `scripts/migrations/executar-migration-producao-manual.md` - Guia completo manual
- `scripts/migrations/verificar-migration-001.sql` - Script de verificação

---

## 🎯 Próximos Passos

Após executar esta migration com sucesso:

1. ✅ **ETAPA 1 COMPLETA** - Tabela Tenant criada
2. ⏭️ **ETAPA 2** - Adicionar tenantId ao Usuario
3. ⏭️ **ETAPA 3** - Adicionar tenantId aos modelos de dados
4. ⏭️ **ETAPA 4** - Migrar dados existentes

---

## 💡 Dica

Se você usar o script automatizado (`executar-migration-producao.sh`), ele faz tudo automaticamente e é mais seguro! 🚀
