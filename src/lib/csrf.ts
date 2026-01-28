/**
 * CSRF Protection
 * Proteção contra Cross-Site Request Forgery
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';

/**
 * Métodos HTTP que precisam de proteção CSRF
 */
const PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Rotas que não precisam de proteção CSRF
 */
const CSRF_EXEMPT_ROUTES = [
  '/api/auth', // Autenticação pode ter fluxo diferente
  '/api/webhook', // Webhooks geralmente não usam CSRF
  '/api/health',
];

/**
 * Gera token CSRF
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Cria hash do token para armazenamento seguro
 */
export function hashCSRFToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verifica se a rota precisa de proteção CSRF
 */
export function requiresCSRFProtection(pathname: string, method: string): boolean {
  // Apenas métodos protegidos
  if (!PROTECTED_METHODS.includes(method)) {
    return false;
  }

  // Rotas isentas
  if (CSRF_EXEMPT_ROUTES.some(route => pathname.startsWith(route))) {
    return false;
  }

  return true;
}

/**
 * Obtém token CSRF do header ou cookie
 */
export function getCSRFToken(request: NextRequest): string | null {
  // Tentar obter do header primeiro (preferido)
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {
    return headerToken;
  }

  // Fallback para cookie
  const cookieToken = request.cookies.get('csrf-token')?.value;
  return cookieToken || null;
}

/**
 * Valida token CSRF
 */
export function validateCSRFToken(
  request: NextRequest,
  sessionToken?: string
): { valid: boolean; error?: string } {
  const requestToken = getCSRFToken(request);

  if (!requestToken) {
    return {
      valid: false,
      error: 'Token CSRF não fornecido',
    };
  }

  if (!sessionToken) {
    return {
      valid: false,
      error: 'Sessão não encontrada',
    };
  }

  // Comparar tokens (hash para segurança)
  const requestHash = hashCSRFToken(requestToken);
  const sessionHash = hashCSRFToken(sessionToken);

  if (requestHash !== sessionHash) {
    return {
      valid: false,
      error: 'Token CSRF inválido',
    };
  }

  return { valid: true };
}

/**
 * Middleware para verificar CSRF
 * Use em rotas que precisam de proteção
 */
export function verifyCSRF(
  request: NextRequest,
  sessionToken?: string
): { valid: boolean; error?: NextResponse } {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Verificar se precisa de proteção
  if (!requiresCSRFProtection(pathname, method)) {
    return { valid: true };
  }

  // Validar token
  const validation = validateCSRFToken(request, sessionToken);

  if (!validation.valid) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: validation.error || 'Requisição CSRF inválida',
          code: 'CSRF_ERROR',
        },
        { status: 403 }
      ),
    };
  }

  return { valid: true };
}

/**
 * Adiciona token CSRF ao cookie da resposta
 */
export function setCSRFTokenCookie(
  response: NextResponse,
  token: string
): NextResponse {
  // Cookie seguro (HttpOnly, SameSite, Secure em produção)
  const isProduction = process.env.NODE_ENV === 'production';
  
  response.cookies.set('csrf-token', token, {
    httpOnly: false, // Precisa ser acessível via JavaScript para enviar no header
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 horas
  });

  return response;
}

/**
 * Helper para obter token CSRF da sessão
 * Adapte conforme seu sistema de sessão
 */
export async function getSessionCSRFToken(
  request: NextRequest
): Promise<string | undefined> {
  // Implementação básica: obter do cookie
  // Em produção, você pode querer obter de uma sessão no servidor
  const token = request.cookies.get('csrf-token')?.value;
  return token;
}
