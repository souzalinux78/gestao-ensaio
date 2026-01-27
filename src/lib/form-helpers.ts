/**
 * Helpers para formulários
 */

/**
 * Valida se email é válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida se senha atende requisitos mínimos
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Valida se senhas coincidem
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Limpa dados do formulário (remove espaços, trim)
 */
export function cleanFormData<T extends Record<string, any>>(data: T): T {
  const cleaned = { ...data };
  
  for (const key in cleaned) {
    if (typeof cleaned[key] === 'string') {
      cleaned[key] = cleaned[key].trim();
    }
  }
  
  return cleaned;
}

/**
 * Valida se formulário tem campos obrigatórios preenchidos
 */
export function hasRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '' || 
        (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field);
    }
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Cria objeto de erro de validação
 */
export function createValidationError(field: string, message: string) {
  return {
    field,
    message,
  };
}

/**
 * Valida múltiplos campos e retorna erros
 */
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, (value: any) => string | null>
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  for (const field in rules) {
    const validator = rules[field];
    const value = data[field];
    const error = validator(value);
    
    if (error) {
      errors[field] = error;
    }
  }
  
  return errors;
}
