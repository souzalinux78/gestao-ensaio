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

  // PRIORIDADE 1: Usar accessToken (JWT) se disponível
  if (sessao && 'accessToken' in sessao && sessao.accessToken) {
    headers['Authorization'] = `Bearer ${sessao.accessToken}`;
  } 
  // PRIORIDADE 2: Fallback para sistema antigo (compatibilidade)
  else if (sessao?.id) {
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

  // Fazer requisição com cache: 'no-store' para evitar cache de respostas 401
  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store', // Sempre buscar versão fresca, nunca usar cache
    credentials: 'same-origin', // Incluir cookies se necessário
  });

  // Se receber 401, limpar sessão e redirecionar para login
  if (response.status === 401) {
    // Limpar sessão local
    if (typeof window !== 'undefined') {
      const { removerSessao } = await import('./session');
      removerSessao();
      
      // Redirecionar para login apenas se não estiver já na página de login
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
  }

  return response;
}
