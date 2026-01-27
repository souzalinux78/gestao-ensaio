# ✅ ETAPA 3 COMPLETA: tenantId Adicionado aos Modelos de Dados

## O que foi feito:

### 1. Schema Prisma Atualizado
Todos os modelos de dados foram atualizados com `tenantId`:

#### ✅ Ensaio
- Campo `tenantId` (nullable)
- Relação com `Tenant`
- Índices compostos:
  - `Ensaio_tenantId_idx` - índice simples
  - `Ensaio_tenantId_data_idx` - filtro por tenant e data
  - `Ensaio_tenantId_instrutorId_idx` - filtro por tenant e instrutor

#### ✅ Musico
- Campo `tenantId` (nullable)
- Relação com `Tenant`
- Unique constraint atualizado: `(tenantId, instrutorId, nome)`
- Índices compostos para performance

#### ✅ Contato
- Campo `tenantId` (nullable)
- Relação com `Tenant`
- Índices compostos: `(tenantId, usuarioId)`

#### ✅ Instrumento
- Campo `tenantId` (nullable) - permite compartilhamento global ou por tenant
- Relação com `Tenant`
- Unique constraint atualizado: `(tenantId, nome)` - permite mesmo nome em tenants diferentes
- Se `tenantId` for NULL, instrumento é global/compartilhado

#### ✅ Configuracoes
- Campo `tenantId` (nullable)
- Relação com `Tenant`
- Unique constraint: `(tenantId)` - uma configuração por tenant

### 2. Migration SQL Criada
- ✅ Arquivo: `scripts/migrations/003-add-tenantId-to-models.sql`
- ✅ Adiciona `tenantId` em todas as tabelas
- ✅ Cria índices compostos para performance
- ✅ Atualiza constraints unique para incluir `tenantId`
- ✅ **Foreign keys NÃO criadas ainda** (serão na ETAPA 4)

### 3. Script de Execução
- ✅ Arquivo: `scripts/migrations/executar-migration-003.sh`
- ✅ Script automatizado com backup e validação
- ✅ Verifica todas as tabelas antes e depois

## Estrutura Criada:

```sql
-- Ensaio
ALTER TABLE `Ensaio` ADD COLUMN `tenantId` INT NULL;
CREATE INDEX `Ensaio_tenantId_idx` ON `Ensaio` (`tenantId`);
CREATE INDEX `Ensaio_tenantId_data_idx` ON `Ensaio` (`tenantId`, `data` DESC);
CREATE INDEX `Ensaio_tenantId_instrutorId_idx` ON `Ensaio` (`tenantId`, `instrutorId`);

-- Musico
ALTER TABLE `Musico` ADD COLUMN `tenantId` INT NULL;
CREATE UNIQUE INDEX `Musico_tenantId_instrutorId_nome_key` ON `Musico` (`tenantId`, `instrutorId`, `nome`);

-- Contato
ALTER TABLE `Contato` ADD COLUMN `tenantId` INT NULL;
CREATE INDEX `Contato_tenantId_usuarioId_idx` ON `Contato` (`tenantId`, `usuarioId`);

-- Instrumento
ALTER TABLE `Instrumento` ADD COLUMN `tenantId` INT NULL;
CREATE UNIQUE INDEX `Instrumento_tenantId_nome_key` ON `Instrumento` (`tenantId`, `nome`);

-- Configuracoes
ALTER TABLE `Configuracoes` ADD COLUMN `tenantId` INT NULL;
CREATE UNIQUE INDEX `Configuracoes_tenantId_key` ON `Configuracoes` (`tenantId`);
```

## Importante:

⚠️ **Foreign Keys NÃO foram criadas ainda!**
- As foreign keys serão adicionadas na **ETAPA 4** após migrar todos os dados
- Isso permite migração gradual sem quebrar dados existentes

⚠️ **Constraints Unique Atualizados:**
- `Musico`: Agora é `(tenantId, instrutorId, nome)` - permite mesmo nome em tenants diferentes
- `Instrumento`: Agora é `(tenantId, nome)` - permite mesmo nome em tenants diferentes
- `Configuracoes`: Agora é `(tenantId)` - uma configuração por tenant

## Próximos Passos:

### ETAPA 4: Migrar Dados Existentes
- Atribuir todos os usuários ao tenant padrão (ID = 1)
- Atribuir todos os ensaios ao tenant do instrutor
- Atribuir todos os músicos ao tenant do instrutor
- Atribuir todos os contatos ao tenant do usuário
- Atribuir instrumentos ao tenant padrão (ou deixar NULL para compartilhado)
- Atribuir configurações ao tenant padrão
- **Criar foreign keys** após migração
- Tornar campos `tenantId` NOT NULL após migração

## Como Executar a Migration:

```bash
# No servidor de produção:
chmod +x scripts/migrations/executar-migration-003.sh
./scripts/migrations/executar-migration-003.sh
```

Ou manualmente:
```bash
mysql -u usuario -p nome_do_banco < scripts/migrations/003-add-tenantId-to-models.sql
```

## Status:
✅ **ETAPA 3 COMPLETA** - tenantId adicionado a todos os modelos de dados
⏳ **Aguardando ETAPA 4** - Migrar dados existentes e criar foreign keys
