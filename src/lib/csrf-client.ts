/**
 * Helper para CSRF no frontend
 * Facilita a obtenção e uso de tokens CSRF
 */

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

  const headers = new Headers(options.headers);

  // Adicionar token CSRF ao header
  headers.set('X-CSRF-Token', token);

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Invalida token CSRF (útil após logout)
 */
export function invalidateCSRFToken(): void {
  csrfToken = null;
  tokenPromise = null;
}
