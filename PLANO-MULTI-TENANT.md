# Plano de Transformação Multi-Tenant

## Objetivo
Transformar o sistema em SaaS multi-tenant, onde cada empresa/escola (tenant) tem isolamento completo de dados.

## Princípios
- ✅ **NÃO quebrar usuários existentes**: Todos os dados atuais serão migrados para um tenant padrão
- ✅ **Evolução progressiva**: Mudanças incrementais, testáveis a cada etapa
- ✅ **Compatibilidade retroativa**: Sistema continua funcionando durante a migração
- ✅ **Isolamento garantido**: Cada query respeita o tenant_id

---

## ETAPA 1: Criar Tabela Tenant

### O que faz:
Cria a tabela `Tenant` que representa uma empresa/escola.

### Estrutura:
```sql
Tenant {
  id: Int (PK)
  nome: String (nome da empresa/escola)
  slug: String (identificador único, ex: "ccb-teste")
  ativo: Boolean (default: true)
  createdAt, updatedAt
}
```

### Migration:
- Criar tabela `Tenant`
- Criar tenant padrão "Sistema Padrão" para migração de dados existentes

### Impacto:
- ✅ Zero impacto em código existente
- ✅ Apenas adiciona nova tabela

---

## ETAPA 2: Adicionar tenantId ao Usuario

### O que faz:
Adiciona campo `tenantId` na tabela `Usuario` e cria relação.

### Estrutura:
```prisma
Usuario {
  ...
  tenantId: Int (FK → Tenant)
  tenant: Tenant @relation(...)
}
```

### Migration:
- Adicionar coluna `tenantId` (nullable inicialmente)
- Criar índice em `tenantId`
- Criar foreign key

### Impacto:
- ✅ Campo nullable permite migração gradual
- ✅ Usuários existentes continuam funcionando

---

## ETAPA 3: Adicionar tenantId aos Modelos de Dados

### O que faz:
Adiciona `tenantId` em todas as tabelas que precisam isolamento:
- `Ensaio`
- `Musico`
- `Contato`
- `Instrumento` (pode ser compartilhado ou por tenant)
- `Configuracoes` (por tenant)

### Estrutura:
```prisma
Ensaio {
  ...
  tenantId: Int (FK → Tenant)
  tenant: Tenant @relation(...)
}
```

### Migration:
- Adicionar coluna `tenantId` (nullable inicialmente)
- Criar índices compostos: `(tenantId, instrutorId)`, `(tenantId, data)`, etc.

### Impacto:
- ✅ Campos nullable permitem migração gradual
- ✅ Queries existentes continuam funcionando

---

## ETAPA 4: Migrar Dados Existentes

### O que faz:
Atribui todos os dados existentes ao tenant padrão.

### Migration:
1. Criar tenant padrão se não existir
2. Atualizar todos os `Usuario` sem `tenantId` → tenant padrão
3. Atualizar todos os `Ensaio` sem `tenantId` → tenant do instrutor
4. Atualizar todos os `Musico` sem `tenantId` → tenant do instrutor
5. Atualizar todos os `Contato` sem `tenantId` → tenant do usuário
6. Tornar `tenantId` NOT NULL após migração

### Impacto:
- ✅ Dados existentes preservados
- ✅ Sistema continua funcionando normalmente

---

## ETAPA 5: Atualizar JWT

### O que faz:
Adiciona `tenantId` no payload do Access Token.

### Mudanças:
```typescript
AccessTokenPayload {
  userId: number;
  tipo: 'admin' | 'instrutor';
  aprovado: boolean;
  tenantId: number; // NOVO
}
```

### Impacto:
- ✅ Tokens antigos continuam funcionando (fallback)
- ✅ Novos tokens incluem tenantId

---

## ETAPA 6: Criar Middleware tenantResolver

### O que faz:
Extrai e valida o `tenantId` do JWT, garantindo que todas as queries usem o tenant correto.

### Estrutura:
```typescript
export function getTenantFromRequest(request: NextRequest): number | null {
  // 1. Extrair do JWT (prioridade)
  // 2. Fallback para sistema antigo (compatibilidade)
  // 3. Retornar null se não encontrar
}
```

### Impacto:
- ✅ Não quebra código existente
- ✅ Adiciona camada de segurança

---

## ETAPA 7: Atualizar get-user-from-request

### O que faz:
Inclui `tenantId` no objeto `Usuario` retornado.

### Mudanças:
```typescript
Usuario {
  ...
  tenantId: number; // NOVO
}
```

### Impacto:
- ✅ Compatível com código existente
- ✅ tenantId disponível em todas as rotas

---

## ETAPA 8: Atualizar Queries para Isolamento

### O que faz:
Adiciona filtro `tenantId` em todas as queries do Prisma.

### Padrão:
```typescript
// ANTES
const ensaios = await prisma.ensaio.findMany({ where: { instrutorId } });

// DEPOIS
const ensaios = await prisma.ensaio.findMany({ 
  where: { 
    instrutorId,
    tenantId: usuario.tenantId // ISOLAMENTO
  } 
});
```

### Arquivos a atualizar:
- `/api/ensaios/route.ts`
- `/api/ensaios/[id]/route.ts`
- `/api/musicos/route.ts`
- `/api/contatos/route.ts`
- `/api/usuarios/route.ts`
- `/api/webhook/route.ts`

### Impacto:
- ✅ Isolamento garantido
- ✅ Admin vê apenas dados do seu tenant
- ✅ Instrutor vê apenas dados do seu tenant

---

## ETAPA 9: Atualizar Autenticação e Registro

### O que faz:
- Login: Inclui `tenantId` no token
- Registro: Associa novo usuário ao tenant (via domínio de email ou tenant padrão)

### Mudanças:
- `POST /api/auth`: Incluir `tenantId` no token
- `POST /api/usuarios`: Associar ao tenant correto

### Impacto:
- ✅ Novos usuários automaticamente no tenant correto
- ✅ Tokens incluem tenantId

---

## Estratégia de Migração

### Fase 1: Preparação (Etapas 1-3)
- Criar estrutura de tenant
- Adicionar campos nullable
- **Sistema continua funcionando normalmente**

### Fase 2: Migração de Dados (Etapa 4)
- Migrar dados existentes
- Tornar campos NOT NULL
- **Sistema continua funcionando normalmente**

### Fase 3: Integração (Etapas 5-7)
- Atualizar JWT e middleware
- **Sistema continua funcionando (compatibilidade retroativa)**

### Fase 4: Isolamento (Etapas 8-9)
- Adicionar filtros tenantId
- **Isolamento completo garantido**

---

## Garantias de Segurança

1. **Isolamento de Dados**: Todas as queries filtram por `tenantId`
2. **Validação de Tenant**: Middleware valida tenant do JWT
3. **Fallback Seguro**: Sistema antigo continua funcionando durante migração
4. **Índices Compostos**: Performance otimizada com `(tenantId, ...)`

---

## Próximos Passos

Após aprovação, iniciaremos pela **ETAPA 1** com a criação da tabela Tenant e migration inicial.
