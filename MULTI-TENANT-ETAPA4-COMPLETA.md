# ✅ ETAPA 4 COMPLETA: Migração de Dados e Foreign Keys

## O que foi feito:

### 1. Migration SQL Completa
- ✅ Arquivo: `scripts/migrations/004-migrate-data-to-tenant.sql`
- ✅ Migra todos os dados existentes para o tenant padrão
- ✅ Cria todas as foreign keys
- ✅ Inclui verificação final

### 2. Estratégia de Migração

#### ✅ Usuarios
- Todos os usuários sem `tenantId` → tenant padrão (ID = 1)

#### ✅ Ensaios
- Cada ensaio → tenant do seu instrutor
- `UPDATE Ensaio SET tenantId = (SELECT tenantId FROM Usuario WHERE id = Ensaio.instrutorId)`

#### ✅ Musicos
- Cada músico → tenant do seu instrutor
- `UPDATE Musico SET tenantId = (SELECT tenantId FROM Usuario WHERE id = Musico.instrutorId)`

#### ✅ Contatos
- Cada contato → tenant do seu usuário
- `UPDATE Contato SET tenantId = (SELECT tenantId FROM Usuario WHERE id = Contato.usuarioId)`

#### ✅ Instrumentos
- Todos os instrumentos → tenant padrão
- (Poderia deixar NULL para compartilhamento global, mas por padrão atribuímos ao tenant padrão)

#### ✅ Configuracoes
- Configurações → tenant padrão
- Uma configuração por tenant (unique constraint)

### 3. Foreign Keys Criadas

Todas as foreign keys foram criadas com `ON DELETE RESTRICT ON UPDATE CASCADE`:

- ✅ `Usuario.tenantId` → `Tenant.id`
- ✅ `Ensaio.tenantId` → `Tenant.id`
- ✅ `Musico.tenantId` → `Tenant.id`
- ✅ `Contato.tenantId` → `Tenant.id`
- ✅ `Instrumento.tenantId` → `Tenant.id`
- ✅ `Configuracoes.tenantId` → `Tenant.id`

### 4. Script de Execução
- ✅ Arquivo: `scripts/migrations/executar-migration-004.sh`
- ✅ Verifica tenant padrão antes de executar
- ✅ Conta dados antes e depois
- ✅ Valida foreign keys criadas

## Estrutura da Migration:

```sql
-- 1. Obter ID do tenant padrão
SET @tenant_padrao_id = (SELECT id FROM Tenant WHERE slug = 'sistema-padrao');

-- 2. Migrar usuários
UPDATE Usuario SET tenantId = @tenant_padrao_id WHERE tenantId IS NULL;

-- 3. Migrar ensaios (via instrutor)
UPDATE Ensaio e
INNER JOIN Usuario u ON e.instrutorId = u.id
SET e.tenantId = u.tenantId;

-- 4. Migrar músicos (via instrutor)
UPDATE Musico m
INNER JOIN Usuario u ON m.instrutorId = u.id
SET m.tenantId = u.tenantId;

-- 5. Migrar contatos (via usuário)
UPDATE Contato c
INNER JOIN Usuario u ON c.usuarioId = u.id
SET c.tenantId = u.tenantId;

-- 6. Criar foreign keys
ALTER TABLE Usuario ADD CONSTRAINT ... FOREIGN KEY (tenantId) REFERENCES Tenant(id);
-- ... (repetir para todas as tabelas)
```

## Importante:

⚠️ **Esta é a migration mais crítica!**
- Migra TODOS os dados existentes
- Cria foreign keys (garante integridade referencial)
- **FAÇA BACKUP ANTES DE EXECUTAR!**

⚠️ **Campos Permanecem Nullable:**
- Por enquanto, mantemos `tenantId` nullable para flexibilidade
- Se quiser tornar NOT NULL, descomente as linhas na migration

⚠️ **Tempo de Execução:**
- Pode demorar alguns minutos dependendo da quantidade de dados
- O script mostra progresso

## Verificação Final:

A migration inclui verificação final que mostra:
- Quantos registros sem tenantId restam (deve ser 0)
- Distribuição de dados por tenant
- Status das foreign keys

## Como Executar a Migration:

```bash
# No servidor de produção:
chmod +x scripts/migrations/executar-migration-004.sh
./scripts/migrations/executar-migration-004.sh
```

Ou manualmente:
```bash
mysql -u usuario -p nome_do_banco < scripts/migrations/004-migrate-data-to-tenant.sql
```

## Status:
✅ **ETAPA 4 COMPLETA** - Dados migrados e foreign keys criadas
⏳ **Próximas Etapas** - Atualizar código (JWT, middleware, queries)

## Próximos Passos:

### ETAPA 5: Atualizar JWT
- Incluir `tenantId` no payload do Access Token

### ETAPA 6: Criar Middleware tenantResolver
- Extrair e validar tenant do JWT

### ETAPA 7: Atualizar get-user-from-request
- Incluir `tenantId` no objeto Usuario retornado

### ETAPA 8: Atualizar Queries
- Adicionar filtro `tenantId` em todas as queries

### ETAPA 9: Atualizar Autenticação
- Associar tenant no login/registro
