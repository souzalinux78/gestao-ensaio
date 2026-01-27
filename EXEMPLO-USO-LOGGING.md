# Como Usar Winston Logs, Request ID e Error Handler

## Estrutura Criada

### 1. Logger Estruturado (`src/lib/logger.ts`)
- Logs em formato JSON estruturado
- Suporte a Request ID, User ID e Tenant ID
- Sanitização automática de dados sensíveis
- Logs em arquivo (produção) e console (desenvolvimento)

### 2. Request ID (`src/lib/request-id.ts`)
- Gera ID único para cada requisição
- Adiciona header `x-request-id` nas respostas
- Rastreamento completo de requisições

### 3. Error Handler Global (`src/lib/error-handler.ts`)
- Tratamento centralizado de erros
- Respostas padronizadas
- Logging automático de erros
- Erros customizados pré-definidos

### 4. API Handler (`src/lib/api-handler.ts`)
- Wrapper completo para rotas
- Integra Request ID + Error Handling + Logging
- Contexto automático do usuário

## Uso Opcional (Não Quebra Código Existente)

### Opção 1: Usar o Wrapper Completo (Recomendado)

```typescript
// src/app/api/exemplo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

// Handler com contexto completo
async function handler(
  request: NextRequest,
  context: { requestId: string; userId?: number; tenantId?: number }
) {
  // context.requestId está disponível
  // context.userId está disponível se autenticado
  // context.tenantId está disponível se autenticado

  const data = await prisma.ensao.findMany({
    where: { tenantId: context.tenantId || 1 },
  });

  return NextResponse.json(data);
}

// Exportar com wrapper
export const GET = createApiHandler(handler);
export const POST = createApiHandler(handler);
```

### Opção 2: Usar Apenas Error Handler

```typescript
// src/app/api/exemplo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler, Errors } from '@/lib/error-handler';
import { getRequestId } from '@/lib/request-id';

async function handler(request: NextRequest, requestId: string) {
  // Seu código existente aqui
  
  if (!usuario) {
    throw Errors.UNAUTHORIZED('Usuário não autenticado');
  }

  return NextResponse.json({ success: true });
}

export const GET = withErrorHandler(handler);
```

### Opção 3: Usar Logger Manualmente

```typescript
// src/app/api/exemplo/route.ts
import { loggerWithContext } from '@/lib/logger';
import { getRequestId } from '@/lib/request-id';

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  
  // Configurar contexto
  loggerWithContext.setContext({ requestId });
  
  try {
    loggerWithContext.info('Processando requisição');
    
    // Seu código aqui
    
    loggerWithContext.info('Requisição concluída');
    return NextResponse.json({ success: true });
  } catch (error) {
    loggerWithContext.error('Erro ao processar', error);
    throw error;
  } finally {
    loggerWithContext.clearContext();
  }
}
```

## Erros Customizados

```typescript
import { Errors } from '@/lib/error-handler';

// Lançar erros pré-definidos
throw Errors.UNAUTHORIZED('Mensagem customizada');
throw Errors.FORBIDDEN();
throw Errors.NOT_FOUND('Recurso não encontrado');
throw Errors.VALIDATION_ERROR('Dados inválidos', { campo: 'erro' });
throw Errors.CONFLICT('Já existe');
throw Errors.INTERNAL_ERROR('Erro interno');

// Ou criar erro customizado
import { ApiError } from '@/lib/error-handler';
throw new ApiError('Mensagem', 400, 'CUSTOM_CODE', { detalhes: 'extra' });
```

## Logs Estruturados

Os logs são estruturados em JSON:

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

## Variáveis de Ambiente

Adicione ao `.env`:

```env
# Nível de log (error, warn, info, debug)
LOG_LEVEL=info

# Diretório para logs (opcional, padrão: logs)
LOG_DIR=logs
```

## Migração Gradual

Você pode migrar rotas gradualmente:

1. **Rotas novas**: Use `createApiHandler` desde o início
2. **Rotas existentes**: Continue funcionando normalmente
3. **Quando quiser melhorar**: Envolva com `withErrorHandler` ou `createApiHandler`

## Exemplo de Migração

**Antes:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const data = await prisma.ensao.findMany();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar ensaios' },
      { status: 500 }
    );
  }
}
```

**Depois (com wrapper):**
```typescript
export const GET = createApiHandler(async (request, context) => {
  const data = await prisma.ensao.findMany({
    where: { tenantId: context.tenantId || 1 },
  });
  return NextResponse.json(data);
  // Erros são tratados automaticamente
});
```

## Benefícios

✅ **Request ID**: Rastreie requisições do início ao fim  
✅ **Logs Estruturados**: Fácil análise e busca  
✅ **Error Handling**: Respostas consistentes  
✅ **Não Quebra**: Código existente continua funcionando  
✅ **Migração Gradual**: Adote quando quiser  
