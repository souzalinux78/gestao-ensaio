import {
  isValidEmail,
  isValidPassword,
  passwordsMatch,
  cleanFormData,
  hasRequiredFields,
  validateForm,
} from '../form-helpers';

describe('form-helpers', () => {
  describe('isValidEmail', () => {
    it('deve validar email correto', () => {
      expect(isValidEmail('teste@exemplo.com')).toBe(true);
      expect(isValidEmail('usuario@dominio.com.br')).toBe(true);
    });
    
    it('deve rejeitar email inválido', () => {
      expect(isValidEmail('email-invalido')).toBe(false);
      expect(isValidEmail('@exemplo.com')).toBe(false);
      expect(isValidEmail('teste@')).toBe(false);
    });
  });
  
  describe('isValidPassword', () => {
    it('deve validar senha com 6 ou mais caracteres', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('senha123')).toBe(true);
    });
    
    it('deve rejeitar senha com menos de 6 caracteres', () => {
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword('abc')).toBe(false);
    });
  });
  
  describe('passwordsMatch', () => {
    it('deve retornar true quando senhas coincidem', () => {
      expect(passwordsMatch('senha123', 'senha123')).toBe(true);
    });
    
    it('deve retornar false quando senhas não coincidem', () => {
      expect(passwordsMatch('senha123', 'senha456')).toBe(false);
    });
  });
  
  describe('cleanFormData', () => {
    it('deve remover espaços em branco de strings', () => {
      const data = {
        nome: '  João Silva  ',
        email: 'teste@exemplo.com',
        idade: 30,
      };
      
      const cleaned = cleanFormData(data);
      
      expect(cleaned.nome).toBe('João Silva');
      expect(cleaned.email).toBe('teste@exemplo.com');
      expect(cleaned.idade).toBe(30);
    });
  });
  
  describe('hasRequiredFields', () => {
    it('deve retornar valid true quando todos os campos estão preenchidos', () => {
      const data = {
        nome: 'João',
        email: 'teste@exemplo.com',
        senha: '123456',
      };
      
      const result = hasRequiredFields(data, ['nome', 'email', 'senha']);
      
      expect(result.valid).toBe(true);
      expect(result.missingFields).toEqual([]);
    });
    
    it('deve retornar valid false e listar campos faltantes', () => {
      const data = {
        nome: 'João',
        email: '',
      };
      
      const result = hasRequiredFields(data, ['nome', 'email', 'senha']);
      
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('email');
      expect(result.missingFields).toContain('senha');
    });
  });
  
  describe('validateForm', () => {
    it('deve retornar objeto vazio quando validação passa', () => {
      const data = {
        email: 'teste@exemplo.com',
        senha: '123456',
      };
      
      const rules = {
        email: (value: string) => (isValidEmail(value) ? null : 'Email inválido'),
        senha: (value: string) => (isValidPassword(value) ? null : 'Senha muito curta'),
      };
      
      const errors = validateForm(data, rules);
      
      expect(errors).toEqual({});
    });
    
    it('deve retornar erros quando validação falha', () => {
      const data = {
        email: 'email-invalido',
        senha: '123',
      };
      
      const rules = {
        email: (value: string) => (isValidEmail(value) ? null : 'Email inválido'),
        senha: (value: string) => (isValidPassword(value) ? null : 'Senha muito curta'),
      };
      
      const errors = validateForm(data, rules);
      
      expect(errors.email).toBe('Email inválido');
      expect(errors.senha).toBe('Senha muito curta');
    });
  });
});
