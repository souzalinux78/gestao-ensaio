/**
 * Next.js Middleware
 * Aplica segurança globalmente: headers, rate limiting, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { applySecurityHeaders } from './lib/security-headers';
import { getDefaultCSP } from './lib/csp';
import { checkRateLimit } from './lib/rate-limit';
import { verifyCSRF, getSessionCSRFToken, generateCSRFToken, setCSRFTokenCookie } from './lib/csrf';

/**
 * Rotas que não precisam de rate limiting
 */
const RATE_LIMIT_EXEMPT = [
  '/api/health',
  '/_next',
  '/favicon.ico',
];

/**
 * Rotas que precisam de rate limiting mais restritivo
 */
const STRICT_RATE_LIMIT = [
  '/api/auth',
  '/api/push/subscribe',
];

/**
 * Obtém IP do cliente
 */
function getClientIP(request: NextRequest): string {
  // Tentar obter IP de headers de proxy
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback para IP do request
  return request.ip || 'unknown';
}

/**
 * Verifica se a rota deve ter rate limiting
 */
function shouldRateLimit(pathname: string): boolean {
  return !RATE_LIMIT_EXEMPT.some(exempt => pathname.startsWith(exempt));
}

/**
 * Obtém limites de rate limit baseado na rota
 */
function getRateLimitConfig(pathname: string): { maxRequests: number; windowMs: number } {
  if (STRICT_RATE_LIMIT.some(route => pathname.startsWith(route))) {
    // Limites mais restritivos para autenticação
    return {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutos
    };
  }

  // Limites padrão para outras rotas
  return {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutos
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next();

  // Aplicar headers de segurança
  const csp = getDefaultCSP();
  applySecurityHeaders(response, {
    contentSecurityPolicy: csp,
  });

  // Gerar/renovar token CSRF para requisições GET (para o frontend obter)
  if (request.method === 'GET' && pathname.startsWith('/api/csrf-token')) {
    const token = generateCSRFToken();
    response = setCSRFTokenCookie(response, token);
    return response;
  }

  // Rate limiting para rotas API
  if (pathname.startsWith('/api/') && shouldRateLimit(pathname)) {
    const clientIP = getClientIP(request);
    const config = getRateLimitConfig(pathname);
    const rateLimitResult = checkRateLimit(
      `${clientIP}:${pathname}`,
      config.maxRequests,
      config.windowMs
    );

    // Adicionar headers de rate limit
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

    // Se excedeu o limite, retornar erro
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      );
    }
  }

  // Verificação CSRF para rotas protegidas
  // A função verifyCSRF já verifica internamente se a rota precisa de proteção
  if (pathname.startsWith('/api/')) {
    const sessionToken = await getSessionCSRFToken(request);
    const csrfCheck = verifyCSRF(request, sessionToken);

    // Se a verificação falhou, bloquear
    if (!csrfCheck.valid) {
      return csrfCheck.error || NextResponse.json(
        { error: 'Requisição CSRF inválida' },
        { status: 403 }
      );
    }
  }

  return response;
}

/**
 * Configuração de quais rotas o middleware deve executar
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
