/**
 * Funções de formatação reutilizáveis
 */

/**
 * Formata data para formato brasileiro (dd/MM/yyyy)
 */
export function formatDateBR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Formata telefone brasileiro
 * Ex: (11) 98765-4321
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  
  // Remove caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length === 10) {
    // Telefone fixo: (11) 1234-5678
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else if (numbers.length === 11) {
    // Celular: (11) 98765-4321
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  
  return phone; // Retorna original se não for formato conhecido
}

/**
 * Formata número para moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata número com separador de milhar
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Trunca texto com ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

/**
 * Capitaliza primeira letra de cada palavra
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
