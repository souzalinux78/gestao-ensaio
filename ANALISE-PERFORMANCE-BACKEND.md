# ⚡ Análise de Performance - Backend

## 📊 Gargalos Identificados

### 🔴 CRÍTICO

#### 1. Falta de Paginação em Listagens
**Localização:** Múltiplas rotas
- `/api/ensaios` GET - Sem limite, pode retornar milhares de registros
- `/api/usuarios` GET - Sem limite
- `/api/contatos` GET - Sem limite
- `/api/musicos` GET - Sem limite

**Impacto:**
- Timeout em listagens grandes
- Alto uso de memória
- Lento para o usuário
- Pode travar o servidor

**Exemplo:**
```typescript
// ATUAL (ruim)
const ensaios = await prisma.ensaio.findMany({ ... });
// Retorna TODOS os ensaios, pode ser 10.000+ registros!
```

---

#### 2. Queries Sequenciais Desnecessárias
**Localização:** 
- `/api/ensaios` POST - Busca instrutor, depois valida musicos (sequencial)
- `/api/webhook` - Busca config → ensaio → contatos (3 queries sequenciais)
- `/api/usuarios` POST - Cria usuário, depois atualiza (2 queries)

**Impacto:**
- Latência acumulada
- Tempo de resposta 2-3x maior

**Exemplo:**
```typescript
// ATUAL (ruim)
const instrutor = await prisma.usuario.findUnique(...);  // Query 1
const total = await prisma.musico.count(...);            // Query 2 (sequencial)
// Total: ~20-40ms

// OTIMIZADO
const [instrutor, total] = await Promise.all([           // Paralelo
  prisma.usuario.findUnique(...),
  prisma.musico.count(...)
]);
// Total: ~10-20ms (50% mais rápido)
```

---

#### 3. Include Desnecessário em Queries
**Localização:** `/api/ensaios` GET
**Problema:** Sempre inclui TODOS os relacionamentos, mesmo quando não precisa

**Impacto:**
- Queries JOIN complexas
- Dados desnecessários transferidos
- Mais lento

---

### 🟠 ALTA PRIORIDADE

#### 4. Falta de Índices Compostos
**Localização:** Schema Prisma
**Problema:**
- Filtro por `data + instrutorId` (muito comum) não tem índice composto
- Filtro por `igreja` via relacionamento não otimizado

**Impacto:**
- Full table scan em queries frequentes
- Lento com muitos registros

---

#### 5. Query de Configurações Repetida
**Localização:** `/api/webhook`, `/api/configuracoes`
**Problema:** Busca configurações toda vez (sempre a mesma)

**Impacto:**
- Query desnecessária a cada requisição
- Poderia ser cacheada (configuração muda raramente)

---

#### 6. Validação Duplicada de Usuário
**Localização:** `/api/ensaios` POST, `/api/musicos` POST
**Problema:** Busca usuário apenas para validar existência

**Impacto:**
- Query extra desnecessária
- Poderia usar constraint do banco

---

### 🟡 MÉDIA PRIORIDADE

#### 7. Select Não Específico
**Localização:** Múltiplas rotas
**Problema:** Algumas queries usam `include` completo ao invés de `select` específico

**Impacto:**
- Dados desnecessários
- Mais lento

---

#### 8. Ordenação Sem Índice
**Localização:** Múltiplas rotas
**Problema:** `orderBy` em campos sem índice

**Impacto:**
- Filesort no MySQL (lento)

---

## ✅ Otimizações Propostas

### 1. Adicionar Paginação

**Arquivo:** `src/app/api/ensaios/route.ts`

```typescript
// ANTES
const ensaios = await prisma.ensaio.findMany({ ... });

// DEPOIS
const page = parseInt(searchParams.get('page') || '1');
const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
const skip = (page - 1) * limit;

const [ensaios, total] = await Promise.all([
  prisma.ensaio.findMany({
    where,
    include: { ... },
    orderBy: { data: 'desc' },
    skip,
    take: limit,
  }),
  prisma.ensaio.count({ where }),
]);

return NextResponse.json({
  data: ensaios,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
```

**Aplicar em:**
- `/api/ensaios` GET
- `/api/usuarios` GET
- `/api/contatos` GET
- `/api/musicos` GET

---

### 2. Paralelizar Queries

**Arquivo:** `src/app/api/ensaios/route.ts` (POST)

```typescript
// ANTES (sequencial)
const instrutor = await prisma.usuario.findUnique(...);
const total = await prisma.musico.count(...);

// DEPOIS (paralelo)
const [instrutor, total] = await Promise.all([
  prisma.usuario.findUnique({ where: { id: instrutorIdFinal } }),
  musicosSelecionados.length > 0
    ? prisma.musico.count({
        where: {
          id: { in: ids },
          instrutorId: instrutorIdFinal,
        },
      })
    : Promise.resolve(0),
]);
```

**Aplicar em:**
- `/api/ensaios` POST
- `/api/webhook` POST

---

### 3. Adicionar Índices Compostos

**Arquivo:** `prisma/schema.prisma`

```prisma
model Ensaio {
  // ... campos existentes
  
  // Índice composto para filtro comum: data + instrutorId
  @@index([instrutorId, data])
  // Índice para ordenação por data
  @@index([data])
  @@map("Ensaio")
}
```

**SQL Manual (se necessário):**
```sql
-- Índice composto para queries filtradas por instrutor e data
CREATE INDEX idx_ensaio_instrutor_data ON Ensaio(instrutorId, data DESC);

-- Índice para filtro por igreja (via join)
CREATE INDEX idx_usuario_igreja_tipo ON Usuario(igreja, tipo);
```

---

### 4. Cache de Configurações

**Arquivo:** `src/lib/config-cache.ts` (novo)

```typescript
let configCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function getConfig() {
  if (configCache && Date.now() - configCache.timestamp < CACHE_TTL) {
    return configCache.data;
  }
  
  const config = await prisma.configuracoes.findFirst();
  configCache = { data: config, timestamp: Date.now() };
  return config;
}
```

---

### 5. Otimizar Include/Select

**Arquivo:** `src/app/api/ensaios/route.ts` (GET)

```typescript
// ANTES (inclui tudo)
include: {
  instrumentos: { include: { instrumento: true } },
  funcoes: true,
  instrutor: { select: { ... } },
}

// DEPOIS (select específico quando possível)
select: {
  id: true,
  data: true,
  totalGeral: true,
  instrumentos: {
    select: {
      quantidade: true,
      instrumento: { select: { nome: true } },
    },
  },
  funcoes: true,
  instrutor: { select: { id: true, nome: true, igreja: true } },
}
```

---

### 6. Remover Query Duplicada

**Arquivo:** `src/app/api/usuarios/route.ts` (POST)

```typescript
// ANTES (2 queries)
const usuario = await criarUsuario(...);
const usuarioAtualizado = await prisma.usuario.update({
  where: { id: usuario.id },
  data: { aprovado: usuarioAprovado },
});

// DEPOIS (1 query)
const usuario = await prisma.usuario.create({
  data: {
    nome: nomeSanitizado,
    email: email.trim().toLowerCase(),
    senha: senhaHash,
    tipo: tipoFinal,
    igreja: igrejaSanitizada,
    aprovado: usuarioAprovado, // Já inclui aqui
  },
});
```

---

## 📋 Índices SQL Recomendados

### Índices Compostos (Alta Prioridade)

```sql
-- 1. Ensaio: filtro por instrutor + data (muito comum)
CREATE INDEX idx_ensaio_instrutor_data 
ON Ensaio(instrutorId, data DESC);

-- 2. Usuario: filtro por tipo + aprovado (admin lista usuários)
CREATE INDEX idx_usuario_tipo_aprovado 
ON Usuario(tipo, aprovado);

-- 3. Ensaio: filtro por data range (relatórios)
CREATE INDEX idx_ensaio_data_range 
ON Ensaio(data);
```

### Índices Simples (Média Prioridade)

```sql
-- 4. Contato: busca por nome (filtros)
CREATE INDEX idx_contato_nome 
ON Contato(nome);

-- 5. Musico: busca por nome (filtros)
CREATE INDEX idx_musico_nome 
ON Musico(nome);
```

---

## 🎯 Priorização de Otimizações

### Fase 1 - Impacto Imediato (Implementar AGORA)
1. ✅ Paginação em `/api/ensaios` GET
2. ✅ Índice composto `Ensaio(instrutorId, data)`
3. ✅ Paralelizar queries em `/api/ensaios` POST

### Fase 2 - Melhorias Importantes (Esta semana)
4. ✅ Paginação em `/api/usuarios` GET
5. ✅ Cache de configurações
6. ✅ Remover query duplicada em `/api/usuarios` POST

### Fase 3 - Otimizações Adicionais (Próximo sprint)
7. ✅ Select específico ao invés de include completo
8. ✅ Paginação em outras rotas
9. ✅ Índices adicionais

---

## 📊 Estimativa de Melhoria

| Otimização | Ganho Estimado | Complexidade |
|------------|----------------|--------------|
| Paginação | 80-95% (tempo) | Baixa |
| Índices Compostos | 60-80% (queries) | Baixa |
| Paralelização | 40-50% (latência) | Baixa |
| Cache Config | 90% (redução queries) | Baixa |
| Select Específico | 20-30% (dados) | Média |

---

## ⚠️ Notas Importantes

- **Não alterar lógica principal** ✅
- **Manter compatibilidade** ✅
- **Mudanças incrementais** ✅
- **Testar após cada otimização** ✅
