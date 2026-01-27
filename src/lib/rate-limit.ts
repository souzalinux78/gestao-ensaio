/**
 * Rate Limiting simples em memória
 * Para produção, considere usar Redis ou serviço externo
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Verifica se o IP excedeu o limite de requisições
 * @param identifier - IP ou identificador único
 * @param maxRequests - Número máximo de requisições
 * @param windowMs - Janela de tempo em milissegundos
 * @returns true se permitido, false se bloqueado
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutos
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = store[identifier];

  // Se não existe registro ou expirou, criar novo
  if (!record || now > record.resetTime) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  // Incrementar contador
  record.count++;

  // Se excedeu limite, bloquear
  if (record.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Limpar registros expirados (chamado periodicamente)
 */
export function cleanupExpired() {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

// Limpar registros expirados a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpired, 5 * 60 * 1000);
}
