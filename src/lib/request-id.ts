/**
 * Gerenciamento de Request ID
 * Gera um ID único para cada requisição para rastreamento
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const REQUEST_ID_HEADER = 'x-request-id';
const REQUEST_ID_CONTEXT_KEY = 'requestId';

/**
 * Gera ou obtém o Request ID da requisição
 */
export function getRequestId(request: NextRequest): string {
  // Tentar obter do header
  const existingId = request.headers.get(REQUEST_ID_HEADER);
  if (existingId) {
    return existingId;
  }

  // Gerar novo ID
  return randomUUID();
}

/**
 * Adiciona o Request ID ao header da resposta
 */
export function addRequestIdToResponse(
  response: NextResponse,
  requestId: string
): NextResponse {
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

/**
 * Middleware para adicionar Request ID a todas as requisições
 * Deve ser usado no início do handler de rota
 */
export function withRequestId<T extends NextRequest>(
  request: T,
  handler: (request: T, requestId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const requestId = getRequestId(request);
  
  // Adicionar ao contexto do logger
  const { loggerWithContext } = require('./logger');
  loggerWithContext.setContext({ requestId });

  return handler(request, requestId).then((response) => {
    return addRequestIdToResponse(response, requestId);
  });
}

/**
 * Obtém o Request ID do contexto atual (se disponível)
 */
export function getCurrentRequestId(): string | undefined {
  const { loggerWithContext } = require('./logger');
  // O Request ID é armazenado internamente no loggerWithContext
  // Para acesso direto, precisamos de uma forma de armazenar no contexto
  // Por enquanto, retornamos undefined - será melhorado com AsyncLocalStorage se necessário
  return undefined;
}
