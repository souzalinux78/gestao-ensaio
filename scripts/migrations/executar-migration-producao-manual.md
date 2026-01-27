# Guia Manual: Executar Migration 001 em Produção

## ⚠️ IMPORTANTE: Backup Antes de Tudo!

**SEMPRE faça backup do banco antes de executar migrations em produção!**

---

## Opção 1: Via Script Automatizado (Recomendado)

```bash
# 1. Conectar ao servidor
ssh usuario@servidor

# 2. Ir para o diretório do projeto
cd /caminho/para/gestao-ensaio

# 3. Dar permissão de execução
chmod +x scripts/migrations/executar-migration-producao.sh

# 4. Executar script
./scripts/migrations/executar-migration-producao.sh
```

O script irá:
- ✅ Criar backup automático
- ✅ Verificar estado atual
- ✅ Executar migration
- ✅ Verificar resultado

---

## Opção 2: Via MySQL Direto (Manual)

### Passo 1: Backup do Banco

```bash
# Conectar ao servidor
ssh usuario@servidor

# Criar backup
mysqldump -u usuario -p nome_do_banco > backup_pre_migration_001_$(date +%Y%m%d_%H%M%S).sql
```

### Passo 2: Verificar Estado Atual

```bash
# Conectar ao MySQL
mysql -u usuario -p nome_do_banco

# Verificar se tabela já existe
SHOW TABLES LIKE 'Tenant';

# Se já existir, verificar conteúdo
SELECT * FROM Tenant;
```

### Passo 3: Executar Migration

```bash
# Opção A: Via arquivo SQL
mysql -u usuario -p nome_do_banco < scripts/migrations/001-create-tenant-table.sql

# Opção B: Via linha de comando MySQL
mysql -u usuario -p nome_do_banco << EOF
-- Copiar e colar o conteúdo de 001-create-tenant-table.sql aqui
EOF
```

### Passo 4: Verificar Resultado

```bash
mysql -u usuario -p nome_do_banco

# Verificar tabela criada
SHOW TABLES LIKE 'Tenant';

# Verificar estrutura
DESCRIBE Tenant;

# Verificar tenant padrão criado
SELECT * FROM Tenant WHERE slug = 'sistema-padrao';
```

---

## Opção 3: Via Prisma (Se Prisma CLI estiver disponível)

```bash
# 1. Conectar ao servidor
ssh usuario@servidor

# 2. Ir para o diretório do projeto
cd /caminho/para/gestao-ensaio

# 3. Gerar Prisma Client (se necessário)
npx prisma generate

# 4. Aplicar schema (cria tabela automaticamente)
npx prisma db push

# ⚠️ ATENÇÃO: db push aplica TODAS as mudanças do schema
# Use apenas se tiver certeza de que o schema está sincronizado
```

---

## Opção 4: Via phpMyAdmin ou Adminer (Interface Web)

1. Acesse o phpMyAdmin/Adminer
2. Selecione o banco de dados
3. Vá em "SQL" ou "Importar"
4. Cole o conteúdo de `scripts/migrations/001-create-tenant-table.sql`
5. Execute

---

## Verificação Pós-Migration

Execute estas queries para confirmar que tudo está correto:

```sql
-- 1. Verificar se tabela existe
SHOW TABLES LIKE 'Tenant';

-- 2. Verificar estrutura
DESCRIBE Tenant;

-- 3. Verificar tenant padrão
SELECT id, nome, slug, ativo FROM Tenant WHERE slug = 'sistema-padrao';

-- 4. Verificar índices
SHOW INDEX FROM Tenant;
```

**Resultado esperado:**
- ✅ Tabela `Tenant` existe
- ✅ Tenant com `slug = 'sistema-padrao'` existe
- ✅ Índices criados: `Tenant_slug_key`, `Tenant_slug_idx`, `Tenant_ativo_idx`

---

## Rollback (Se Necessário)

Se algo der errado, você pode reverter:

```sql
-- ⚠️ CUIDADO: Isso remove a tabela e todos os dados!
DROP TABLE IF EXISTS Tenant;
```

Depois, restaure o backup:

```bash
mysql -u usuario -p nome_do_banco < backup_pre_migration_001_YYYYMMDD_HHMMSS.sql
```

---

## Troubleshooting

### Erro: "Table 'Tenant' already exists"
- A migration já foi executada
- Verifique se o tenant padrão existe: `SELECT * FROM Tenant;`
- Se tudo estiver OK, pode prosseguir para ETAPA 2

### Erro: "Access denied"
- Verifique usuário e senha do MySQL
- Verifique permissões do usuário no banco

### Erro: "Unknown database"
- Verifique se o nome do banco está correto
- Verifique se o banco existe: `SHOW DATABASES;`

### Erro: "Duplicate entry 'sistema-padrao'"
- O tenant padrão já existe
- Isso é normal se a migration foi executada antes
- Pode prosseguir normalmente

---

## Próximos Passos

Após executar esta migration com sucesso:

1. ✅ **ETAPA 1 COMPLETA** - Tabela Tenant criada
2. ⏭️ **ETAPA 2** - Adicionar tenantId ao Usuario
3. ⏭️ **ETAPA 3** - Adicionar tenantId aos modelos de dados
4. ⏭️ **ETAPA 4** - Migrar dados existentes

---

## Checklist de Segurança

Antes de executar em produção:

- [ ] Backup do banco criado
- [ ] Testado em ambiente de desenvolvimento/staging
- [ ] Janela de manutenção agendada (se necessário)
- [ ] Equipe notificada
- [ ] Plano de rollback preparado
- [ ] Script de verificação pós-migration pronto
