/**
 * Helper para CSRF no frontend
 * Facilita a obtenção e uso de tokens CSRF
 */

import { obterSessao, salvarSessao } from './session';

let csrfToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

/**
 * Obtém token CSRF do cookie ou da API
 */
export async function getCSRFToken(): Promise<string> {
  // Se já temos o token, retornar
  if (csrfToken) {
    return csrfToken;
  }

  // Se já há uma requisição em andamento, aguardar
  if (tokenPromise) {
    return tokenPromise;
  }

  // Buscar token do cookie primeiro
  const cookieToken = getCookie('csrf-token');
  if (cookieToken) {
    csrfToken = cookieToken;
    return cookieToken;
  }

// Se não encontrou no cookie, buscar da API
tokenPromise = fetch('/api/csrf-token')
  .then(async (response): Promise<string> => {
    if (!response.ok) {
      throw new Error('Erro ao obter token CSRF');
    }

    const data = await response.json();
    const token = data.token as string;

    csrfToken = token;
    tokenPromise = null;

    return token;
  })
  .catch((error) => {
    tokenPromise = null;
    throw error;
  });

  return tokenPromise;
}

/**
 * Obtém valor de cookie
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

/**
 * Adiciona header CSRF a uma requisição fetch
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCSRFToken();
  const sessao = obterSessao();
  const hasJwtToken = Boolean(sessao?.accessToken);
  const headers = new Headers(options.headers);

  // Adicionar token CSRF ao header
  headers.set('X-CSRF-Token', token);

  // Adicionar autenticação da sessão quando disponível
  if (!headers.has('Authorization')) {
    if (sessao?.accessToken) {
      headers.set('Authorization', `Bearer ${sessao.accessToken}`);
    } else if (sessao?.id) {
      headers.set('Authorization', `Bearer ${sessao.id}`);
    }
  }

  const requestWith = (requestHeaders: Headers) =>
    fetch(url, {
      ...options,
      headers: requestHeaders,
      credentials: 'same-origin',
    });

  let response = await requestWith(headers);

  // Se JWT falhar, tentar fallback legado com ID
  if (response.status === 401 && hasJwtToken && sessao?.id) {
    const legacyHeaders = new Headers(headers);
    legacyHeaders.set('Authorization', `Bearer ${sessao.id}`);
    response = await requestWith(legacyHeaders);
  }

  // Se ainda 401, tentar refresh do token e repetir uma vez
  if (response.status === 401 && sessao?.id) {
    try {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData?.accessToken) {
          salvarSessao({
            ...sessao,
            accessToken: refreshData.accessToken,
          });

          const refreshedHeaders = new Headers(headers);
          refreshedHeaders.set('Authorization', `Bearer ${refreshData.accessToken}`);
          response = await requestWith(refreshedHeaders);
        }
      }
    } catch {
      // Ignorar falha de refresh e retornar o 401 original
    }
  }

  return response;
}

/**
 * Invalida token CSRF (útil após logout)
 */
export function invalidateCSRFToken(): void {
  csrfToken = null;
  tokenPromise = null;
}
