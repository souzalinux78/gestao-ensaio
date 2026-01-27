import { formatDateBR, formatPhone, formatCurrency, formatNumber, truncateText, capitalizeWords } from '../formatters';

describe('formatters', () => {
  describe('formatDateBR', () => {
    it('deve formatar data corretamente', () => {
      const date = new Date('2024-01-15');
      expect(formatDateBR(date)).toBe('15/01/2024');
    });
    
    it('deve formatar string de data', () => {
      expect(formatDateBR('2024-01-15')).toBe('15/01/2024');
    });
    
    it('deve retornar string vazia para data inválida', () => {
      expect(formatDateBR('invalid')).toBe('');
      expect(formatDateBR(new Date('invalid'))).toBe('');
    });
  });
  
  describe('formatPhone', () => {
    it('deve formatar telefone fixo (10 dígitos)', () => {
      expect(formatPhone('1112345678')).toBe('(11) 1234-5678');
    });
    
    it('deve formatar celular (11 dígitos)', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    });
    
    it('deve retornar original se não for formato conhecido', () => {
      expect(formatPhone('123')).toBe('123');
      expect(formatPhone('')).toBe('');
    });
    
    it('deve remover caracteres não numéricos', () => {
      expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
    });
  });
  
  describe('formatCurrency', () => {
    it('deve formatar moeda brasileira', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
      expect(formatCurrency(1000)).toBe('R$ 1.000,00');
    });
  });
  
  describe('formatNumber', () => {
    it('deve formatar número com separador de milhar', () => {
      expect(formatNumber(1234)).toBe('1.234');
      expect(formatNumber(1234567)).toBe('1.234.567');
    });
  });
  
  describe('truncateText', () => {
    it('deve truncar texto longo', () => {
      const text = 'Este é um texto muito longo que precisa ser truncado';
      expect(truncateText(text, 20)).toBe('Este é um texto mui...');
    });
    
    it('deve retornar texto original se for menor que maxLength', () => {
      expect(truncateText('Texto curto', 20)).toBe('Texto curto');
    });
    
    it('deve lidar com texto vazio', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });
  
  describe('capitalizeWords', () => {
    it('deve capitalizar primeira letra de cada palavra', () => {
      expect(capitalizeWords('joão silva')).toBe('João Silva');
      expect(capitalizeWords('MARIA SANTOS')).toBe('Maria Santos');
    });
    
    it('deve lidar com texto vazio', () => {
      expect(capitalizeWords('')).toBe('');
    });
  });
});
