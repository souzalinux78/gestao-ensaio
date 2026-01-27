/**
 * Utilitários de validação de entrada
 * Proteção básica contra dados inválidos
 */

export function sanitizeString(input: string | null | undefined, maxLength = 255): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > maxLength) return trimmed.substring(0, maxLength);
  return trimmed;
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Senha é obrigatória' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Senha deve ter pelo menos 6 caracteres' };
  }
  if (password.length > 100) {
    return { valid: false, error: 'Senha muito longa (máximo 100 caracteres)' };
  }
  return { valid: true };
}

export function validateInteger(value: any, min = 0, max = Number.MAX_SAFE_INTEGER): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  if (isNaN(num)) return null;
  if (num < min || num > max) return null;
  return num;
}

export function validateDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  return d;
}
