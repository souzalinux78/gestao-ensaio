# ✅ ETAPA 2 COMPLETA: tenantId Adicionado ao Usuario

## O que foi feito:

### 1. Schema Prisma Atualizado
- ✅ Campo `tenantId` adicionado ao modelo `Usuario` (nullable inicialmente)
- ✅ Relação `tenant` criada com `Tenant`
- ✅ Índices criados:
  - `Usuario_tenantId_idx` - índice simples em `tenantId`
  - `Usuario_tenantId_tipo_idx` - índice composto para filtros comuns

### 2. Migration SQL Criada
- ✅ Arquivo: `scripts/migrations/002-add-tenantId-to-usuario.sql`
- ✅ Adiciona coluna `tenantId` (nullable)
- ✅ Cria índices para performance
- ✅ **Foreign key NÃO criada ainda** (será na ETAPA 4 após migrar dados)

### 3. Script de Execução
- ✅ Arquivo: `scripts/migrations/executar-migration-002.sh`
- ✅ Script automatizado para executar em produção
- ✅ Cria backup antes de executar
- ✅ Verifica estado atual
- ✅ Valida resultado

## Estrutura Criada:

```sql
ALTER TABLE `Usuario` 
ADD COLUMN `tenantId` INT NULL AFTER `aprovado`;

CREATE INDEX `Usuario_tenantId_idx` ON `Usuario` (`tenantId`);
CREATE INDEX `Usuario_tenantId_tipo_idx` ON `Usuario` (`tenantId`, `tipo`);
```

## Importante:

⚠️ **Foreign Key NÃO foi criada ainda!**
- A foreign key será adicionada na **ETAPA 4** após migrar todos os dados existentes
- Isso permite migração gradual sem quebrar dados existentes

## Próximos Passos:

### ETAPA 3: Adicionar tenantId aos Modelos de Dados
- Adicionar `tenantId` em: `Ensaio`, `Musico`, `Contato`, `Instrumento`, `Configuracoes`
- Criar índices compostos para performance

### ETAPA 4: Migrar Dados Existentes
- Atribuir todos os usuários ao tenant padrão
- Atribuir todos os dados relacionados
- **Criar foreign key** após migração

## Como Executar a Migration:

```bash
# No servidor de produção:
chmod +x scripts/migrations/executar-migration-002.sh
./scripts/migrations/executar-migration-002.sh
```

Ou manualmente:
```bash
mysql -u usuario -p nome_do_banco < scripts/migrations/002-add-tenantId-to-usuario.sql
```

## Status:
✅ **ETAPA 2 COMPLETA** - tenantId adicionado ao Usuario
⏳ **Aguardando ETAPA 3** - Adicionar tenantId aos modelos de dados
