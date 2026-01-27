import { obterSessao } from './session';

/**
 * Cliente HTTP que adiciona autenticação automaticamente
 * Prioriza accessToken (JWT) se disponível, senão usa ID (compatibilidade)
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

  return fetch(url, {
    ...options,
    headers,
  });
}
