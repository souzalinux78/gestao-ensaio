# Resumo: Winston Logs, Request ID e Error Handler Global

## ✅ Implementado

### 1. Winston Logs Estruturados (`src/lib/logger.ts`)

**Características:**
- ✅ Logs em formato JSON estruturado
- ✅ Suporte a Request ID, User ID e Tenant ID
- ✅ Sanitização automática de dados sensíveis (senhas, tokens, emails)
- ✅ Logs em arquivo (produção) e console formatado (desenvolvimento)
- ✅ Rotação de arquivos (máx 5MB, 5 arquivos)
- ✅ Níveis de log configuráveis via `LOG_LEVEL`

**Compatibilidade:**
- ✅ Mantém interface do logger antigo (`logger.info()`, `logger.error()`, etc.)
- ✅ Código existente continua funcionando sem alterações

### 2. Request ID (`src/lib/request-id.ts`)

**Características:**
- ✅ Gera UUID único para cada requisição usando `crypto.randomUUID()`
- ✅ Adiciona header `x-request-id` em todas as respostas
- ✅ Permite rastreamento completo de requisições
- ✅ Integrado com o logger para contexto automático

**Uso:**
```typescript
import { getRequestId } from '@/lib/request-id';
const requestId = getRequestId(request);
```

### 3. Error Handler Global (`src/lib/error-handler.ts`)

**Características:**
- ✅ Tratamento centralizado de erros
- ✅ Respostas padronizadas com Request ID
- ✅ Logging automático de erros
- ✅ Erros customizados pré-definidos (`Errors.UNAUTHORIZED`, `Errors.FORBIDDEN`, etc.)
- ✅ Detalhes de erro apenas em desenvolvimento

**Erros Pré-definidos:**
- `Errors.UNAUTHORIZED()` - 401
- `Errors.FORBIDDEN()` - 403
- `Errors.NOT_FOUND()` - 404
- `Errors.VALIDATION_ERROR()` - 400
- `Errors.CONFLICT()` - 409
- `Errors.INTERNAL_ERROR()` - 500

### 4. API Handler Wrapper (`src/lib/api-handler.ts`)

**Características:**
- ✅ Wrapper completo que integra tudo
- ✅ Request ID automático
- ✅ Error handling automático
- ✅ Logging automático de requisições
- ✅ Contexto do usuário (userId, tenantId) automático

**Uso:**
```typescript
export const GET = createApiHandler(async (request, context) => {
  // context.requestId, context.userId, context.tenantId disponíveis
  return NextResponse.json({ data });
});
```

## 📁 Arquivos Criados

1. `src/lib/logger.ts` - Logger estruturado com Winston
2. `src/lib/request-id.ts` - Gerenciamento de Request ID
3. `src/lib/error-handler.ts` - Error Handler Global
4. `src/lib/api-handler.ts` - Wrapper para rotas
5. `EXEMPLO-USO-LOGGING.md` - Documentação de uso
6. `src/lib/README-LOGGING.md` - Guia rápido

## 📦 Dependências Adicionadas

- `winston` - Sistema de logging estruturado
- `uuid` removido (usando `crypto.randomUUID()` nativo)

## 🔄 Compatibilidade

**✅ NÃO QUEBRA CÓDIGO EXISTENTE**

- O logger antigo (`logger.info()`, `logger.error()`, etc.) continua funcionando
- Todas as rotas existentes continuam funcionando normalmente
- O novo sistema é **opcional** e pode ser adotado gradualmente

## 🚀 Como Usar

### Opção 1: Wrapper Completo (Recomendado para novas rotas)

```typescript
import { createApiHandler } from '@/lib/api-handler';

export const GET = createApiHandler(async (request, context) => {
  // Request ID, User ID, Tenant ID disponíveis em context
  // Erros são tratados automaticamente
  // Logs são gerados automaticamente
  return NextResponse.json({ data });
});
```

### Opção 2: Apenas Error Handler

```typescript
import { withErrorHandler, Errors } from '@/lib/error-handler';

async function handler(request: NextRequest, requestId: string) {
  if (!usuario) throw Errors.UNAUTHORIZED();
  return NextResponse.json({ data });
}

export const GET = withErrorHandler(handler);
```

### Opção 3: Logger Manual

```typescript
import { loggerWithContext } from '@/lib/logger';
import { getRequestId } from '@/lib/request-id';

loggerWithContext.setContext({ requestId: getRequestId(request) });
loggerWithContext.info('Mensagem', { metadata });
```

## 📊 Formato dos Logs

**Desenvolvimento (Console):**
```
10:30:45 [INFO] Requisição recebida [RequestID: 550e8400...] [UserID: 123]
```

**Produção (JSON):**
```json
{
  "timestamp": "2024-01-15 10:30:45",
  "level": "INFO",
  "message": "Requisição recebida",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": 123,
  "tenantId": 1,
  "meta": {
    "method": "GET",
    "url": "/api/ensaios"
  }
}
```

## ⚙️ Configuração

Adicione ao `.env` (opcional):

```env
# Nível de log (error, warn, info, debug)
LOG_LEVEL=info

# Diretório para logs (padrão: logs/)
LOG_DIR=logs
```

## 📝 Próximos Passos (Opcional)

1. **Migrar rotas gradualmente**: Envolva rotas existentes com `createApiHandler` quando quiser
2. **Adicionar mais contexto**: Use `loggerWithContext` para adicionar mais informações aos logs
3. **Monitoramento**: Os logs estruturados podem ser facilmente integrados com ferramentas de monitoramento (ELK, Datadog, etc.)

## ✨ Benefícios

- ✅ **Rastreabilidade**: Request ID permite rastrear requisições do início ao fim
- ✅ **Debugging**: Logs estruturados facilitam busca e análise
- ✅ **Consistência**: Error handling padronizado em todas as rotas
- ✅ **Segurança**: Sanitização automática de dados sensíveis
- ✅ **Não Invasivo**: Código existente continua funcionando
- ✅ **Migração Gradual**: Adote quando quiser, sem pressa
