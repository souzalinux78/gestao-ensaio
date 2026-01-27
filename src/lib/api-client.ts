import { obterSessao } from './session';

/**
 * Cliente HTTP que adiciona autenticação automaticamente
 * Usa o ID do usuário da sessão no header Authorization
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

  if (sessao?.id) {
    headers['Authorization'] = `Bearer ${sessao.id}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
