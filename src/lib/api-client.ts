import { obterSessao } from './session';
import { getCSRFToken } from './csrf-client';

/**
 * Cliente HTTP que adiciona autenticação e CSRF automaticamente
 * Prioriza accessToken (JWT) se disponível, senão usa ID (compatibilidade)
 * Adiciona token CSRF para métodos POST, PUT, PATCH, DELETE
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const sessao = obterSessao();
  
  // Adicionar header de autenticação se houver sessão
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Copiar headers existentes se forem um objeto
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      // Se for array de arrays
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      // Se for objeto Record
      Object.assign(headers, options.headers);
    }
  }

  const hasJwtToken = Boolean(sessao && 'accessToken' in sessao && sessao.accessToken);
  if (hasJwtToken) {
    headers['Authorization'] = `Bearer ${sessao!.accessToken}`;
  } else if (sessao?.id) {
    // Compatibilidade com sistema legado
    headers['Authorization'] = `Bearer ${sessao.id}`;
  }

  // Adicionar token CSRF para métodos que precisam de proteção
  const method = options.method || 'GET';
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (protectedMethods.includes(method.toUpperCase())) {
    try {
      const csrfToken = await getCSRFToken();
      headers['X-CSRF-Token'] = csrfToken;
    } catch (error) {
      // Se falhar ao obter token CSRF, logar mas não bloquear (pode ser rota isenta)
      console.warn('[apiFetch] Erro ao obter token CSRF:', error);
    }
  }

  const requestWith = (requestHeaders: Record<string, string>) =>
    fetch(url, {
      ...options,
      headers: requestHeaders,
      cache: 'no-store',
      credentials: 'same-origin',
    });

  let response = await requestWith(headers);

  // Se JWT falhar com 401, tentar fallback legado com ID antes de deslogar
  if (response.status === 401 && hasJwtToken && sessao?.id) {
    const legacyHeaders = { ...headers, Authorization: `Bearer ${sessao.id}` };
    response = await requestWith(legacyHeaders);
  }

  // Se ainda 401, tentar refresh de token e repetir uma vez
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
          const { salvarSessao } = await import('./session');
          salvarSessao({
            ...sessao,
            accessToken: refreshData.accessToken,
          });

          const refreshedHeaders = {
            ...headers,
            Authorization: `Bearer ${refreshData.accessToken}`,
          };
          response = await requestWith(refreshedHeaders);
        }
      }
    } catch {
      // Ignorar erro de refresh e tratar 401 abaixo
    }
  }

  // Se ainda 401 após retries, limpar sessão e redirecionar para login
  if (response.status === 401 && typeof window !== 'undefined') {
    const { removerSessao } = await import('./session');
    removerSessao();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  return response;
}
