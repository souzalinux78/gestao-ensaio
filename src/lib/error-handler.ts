/**
 * Error Handler Global
 * Trata erros de forma centralizada e consistente
 */

import { NextRequest, NextResponse } from 'next/server';
import { loggerWithContext } from './logger';
import { getRequestId, addRequestIdToResponse } from './request-id';

/**
 * Cria erros customizados com status code
 */
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Cria uma resposta de erro padronizada
 */
export function createErrorResponse(
  error: Error | ApiError | any,
  requestId?: string
): NextResponse {
  // Determinar status code
  let statusCode = 500;
  let message = 'Erro interno do servidor';
  let code: string | undefined;
  let details: any = undefined;

  if (error instanceof Error) {
    // Erro com statusCode customizado
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      statusCode = error.statusCode;
    }
    
    message = error.message || message;
    
    if ('code' in error) {
      code = error.code as string;
    }
    
    if ('details' in error) {
      details = error.details;
    }
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    message = error.message || error.error || message;
    statusCode = error.statusCode || error.status || statusCode;
    code = error.code;
    details = error.details;
  }

  // Log do erro
  loggerWithContext.error('Erro na requisição', error, {
    statusCode,
    code,
    details,
  });

  // Resposta padronizada
  const responseBody: any = {
    error: message,
    statusCode,
  };

  if (requestId) {
    responseBody.requestId = requestId;
  }

  if (code) {
    responseBody.code = code;
  }

  // Adicionar detalhes apenas em desenvolvimento ou se explicitamente solicitado
  if (process.env.NODE_ENV === 'development' && details) {
    responseBody.details = details;
  }

  if (process.env.NODE_ENV === 'development' && error instanceof Error && error.stack) {
    responseBody.stack = error.stack;
  }

  const response = NextResponse.json(responseBody, { status: statusCode });
  
  if (requestId) {
    return addRequestIdToResponse(response, requestId);
  }
  
  return response;
}

/**
 * Erros comuns pré-definidos
 */
export const Errors = {
  UNAUTHORIZED: (message: string = 'Não autenticado') =>
    new ApiError(message, 401, 'UNAUTHORIZED'),
  
  FORBIDDEN: (message: string = 'Acesso negado') =>
    new ApiError(message, 403, 'FORBIDDEN'),
  
  NOT_FOUND: (message: string = 'Recurso não encontrado') =>
    new ApiError(message, 404, 'NOT_FOUND'),
  
  VALIDATION_ERROR: (message: string = 'Dados inválidos', details?: any) =>
    new ApiError(message, 400, 'VALIDATION_ERROR', details),
  
  CONFLICT: (message: string = 'Conflito na operação') =>
    new ApiError(message, 409, 'CONFLICT'),
  
  INTERNAL_ERROR: (message: string = 'Erro interno do servidor') =>
    new ApiError(message, 500, 'INTERNAL_ERROR'),
};

/**
 * Wrapper para handlers de rota com tratamento de erro automático
 */
export function withErrorHandler<T extends NextRequest>(
  handler: (request: T, requestId: string) => Promise<NextResponse>
) {
  return async (request: T): Promise<NextResponse> => {
    const { getRequestId } = require('./request-id');
    const requestId = getRequestId(request);

    try {
      // Adicionar Request ID ao contexto do logger
      const { loggerWithContext } = require('./logger');
      loggerWithContext.setContext({ requestId });

      // Executar handler
      const response = await handler(request, requestId);
      
      // Adicionar Request ID à resposta
      return addRequestIdToResponse(response, requestId);
    } catch (error) {
      // Tratar erro
      return createErrorResponse(error, requestId);
    } finally {
      // Limpar contexto do logger
      const { loggerWithContext } = require('./logger');
      loggerWithContext.clearContext();
    }
  };
}
