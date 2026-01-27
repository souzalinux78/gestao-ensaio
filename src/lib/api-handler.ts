/**
 * Helper para criar handlers de API com Request ID e Error Handling
 * Pode ser usado opcionalmente nas rotas existentes
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from './error-handler';
import { getRequestId } from './request-id';
import { loggerWithContext } from './logger';
import { obterUsuarioDaRequisicao } from './get-user-from-request';

/**
 * Contexto da requisição disponível no handler
 */
export interface RequestContext {
  requestId: string;
  userId?: number;
  tenantId?: number;
}

/**
 * Tipo para handler de API
 */
export type ApiHandler<T extends NextRequest = NextRequest> = (
  request: T,
  context: RequestContext
) => Promise<NextResponse>;

/**
 * Wrapper completo para handlers de API
 * Inclui:
 * - Request ID automático
 * - Error handling global
 * - Logging estruturado
 * - Contexto do usuário
 */
export function createApiHandler<T extends NextRequest = NextRequest>(
  handler: ApiHandler<T>
) {
  return withErrorHandler(async (request: T, requestId: string): Promise<NextResponse> => {
    // Obter contexto do usuário (se autenticado)
    const usuario = await obterUsuarioDaRequisicao(request);
    
    // Criar contexto
    const context: RequestContext = {
      requestId,
      userId: usuario?.id,
      tenantId: usuario?.tenantId || undefined,
    };

    // Configurar contexto no logger
    loggerWithContext.setContext({
      requestId: context.requestId,
      userId: context.userId,
      tenantId: context.tenantId,
    });

    // Log da requisição
    loggerWithContext.info('Requisição recebida', {
      method: request.method,
      url: request.url,
      pathname: request.nextUrl.pathname,
    });

    try {
      // Executar handler
      const response = await handler(request, context);

      // Log da resposta
      loggerWithContext.info('Requisição processada', {
        method: request.method,
        url: request.url,
        status: response.status,
      });

      return response;
    } finally {
      // Limpar contexto do logger
      loggerWithContext.clearContext();
    }
  });
}

/**
 * Helper para criar handlers simples sem contexto adicional
 * Útil para migração gradual
 */
export function simpleApiHandler<T extends NextRequest = NextRequest>(
  handler: (request: T) => Promise<NextResponse>
) {
  return createApiHandler(async (request: T, context: RequestContext) => {
    return handler(request);
  });
}
