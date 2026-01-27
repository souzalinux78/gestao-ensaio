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
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (sessao?.id) {
    headers['Authorization'] = `Bearer ${sessao.id}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
