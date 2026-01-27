# 📋 Plano: ETAPA 8 - Atualizar Queries para Filtrar por tenantId

## Estratégia:

1. **Usar `resolveTenantFromRequest`** para obter tenantId
2. **Adicionar filtro `tenantId`** em todas as queries
3. **Manter compatibilidade** - se tenantId for null, usar tenant padrão (ID = 1)
4. **Validar tenant** antes de criar/atualizar dados

## Rotas a Atualizar:

### Prioridade Alta (Dados Principais):
1. ✅ `/api/ensaios/route.ts` - GET, POST
2. ✅ `/api/ensaios/[id]/route.ts` - GET, PUT, DELETE
3. ✅ `/api/musicos/route.ts` - GET, POST
4. ✅ `/api/musicos/[id]/route.ts` - PUT, DELETE
5. ✅ `/api/contatos/route.ts` - GET, POST
6. ✅ `/api/contatos/[id]/route.ts` - PUT, DELETE

### Prioridade Média:
7. ✅ `/api/usuarios/route.ts` - GET, POST (admin vê todos do tenant)
8. ✅ `/api/usuarios/[id]/route.ts` - PUT
9. ✅ `/api/instrumentos/route.ts` - GET, POST

### Prioridade Baixa:
10. ✅ `/api/configuracoes/route.ts` - GET, PUT
11. ✅ `/api/webhook/route.ts` - POST

## Padrão de Implementação:

```typescript
// 1. Obter tenantId
const tenantId = await resolveTenantFromRequest(request);
const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão

// 2. Adicionar filtro nas queries
const dados = await prisma.modelo.findMany({
  where: {
    tenantId: tenantIdFinal, // ISOLAMENTO
    // ... outros filtros
  },
});

// 3. Incluir tenantId ao criar
const novo = await prisma.modelo.create({
  data: {
    tenantId: tenantIdFinal, // ISOLAMENTO
    // ... outros campos
  },
});
```

## Importante:

⚠️ **Admin vê apenas dados do seu tenant**
⚠️ **Instrutor vê apenas dados do seu tenant**
⚠️ **Isolamento garantido em todas as queries**
