# 🧪 Análise de Testes

## 📊 Estado Atual

### ❌ Testes Não Existem

**Verificação:**
- ✅ Nenhum arquivo `.test.ts` ou `.spec.ts` encontrado
- ✅ Nenhuma dependência de teste no `package.json`
- ✅ Nenhum script de teste configurado

**Impacto:**
- Sem garantia de qualidade
- Refatorações arriscadas
- Bugs podem passar despercebidos

---

## ✅ Setup Mínimo Proposto

### 1. Dependências Necessárias

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@types/jest": "^29.5.0"
  }
}
```

---

### 2. Configuração Jest

**Criar:** `jest.config.js`
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

---

### 3. Setup File

**Criar:** `jest.setup.js`
```javascript
import '@testing-library/jest-dom'
```

---

### 4. Scripts no package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 📝 Exemplos de Testes

### 1. Teste Backend - API Route

**Criar:** `src/app/api/health/__tests__/route.test.ts`
```typescript
import { GET } from '../route';
import { NextRequest } from 'next/server';

describe('/api/health', () => {
  it('deve retornar status 200', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
  });
});
```

---

### 2. Teste Backend - Helper Function

**Criar:** `src/lib/__tests__/formatters.test.ts`
```typescript
import { formatDateBR, formatPhone, formatCurrency } from '../formatters';

describe('formatters', () => {
  describe('formatDateBR', () => {
    it('deve formatar data corretamente', () => {
      const date = new Date('2024-01-15');
      expect(formatDateBR(date)).toBe('15/01/2024');
    });
    
    it('deve retornar string vazia para data inválida', () => {
      expect(formatDateBR('invalid')).toBe('');
    });
  });
  
  describe('formatPhone', () => {
    it('deve formatar telefone fixo', () => {
      expect(formatPhone('1112345678')).toBe('(11) 1234-5678');
    });
    
    it('deve formatar celular', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    });
  });
  
  describe('formatCurrency', () => {
    it('deve formatar moeda brasileira', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
    });
  });
});
```

---

### 3. Teste Frontend - Component

**Criar:** `src/components/__tests__/Alert.test.tsx`
```typescript
import { render, screen } from '@testing-library/react';
import Alert from '../Alert';

describe('Alert', () => {
  it('deve renderizar mensagem de sucesso', () => {
    render(<Alert tipo="sucesso" texto="Operação realizada!" />);
    
    expect(screen.getByText('Operação realizada!')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });
  
  it('deve renderizar mensagem de erro', () => {
    render(<Alert tipo="erro" texto="Erro ao processar" />);
    
    expect(screen.getByText('Erro ao processar')).toBeInTheDocument();
    expect(screen.getByText('✕')).toBeInTheDocument();
  });
  
  it('deve chamar onClose quando botão de fechar é clicado', () => {
    const onClose = jest.fn();
    render(<Alert tipo="info" texto="Mensagem" onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Fechar');
    closeButton.click();
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

---

### 4. Teste Frontend - Hook

**Criar:** `src/hooks/__tests__/useFormatters.test.ts`
```typescript
import { renderHook } from '@testing-library/react';
// Exemplo quando criar hooks customizados
```

---

## 📋 Plano de Implementação

### Fase 1 - Setup Básico (Implementar AGORA)
1. ✅ Instalar dependências de teste
2. ✅ Configurar Jest
3. ✅ Criar script de teste

### Fase 2 - Testes Básicos (Esta semana)
4. ✅ Teste de formatters
5. ✅ Teste de validators
6. ✅ Teste de componente Alert

### Fase 3 - Testes Avançados (Próximo sprint)
7. ✅ Testes de API routes
8. ✅ Testes de hooks customizados
9. ✅ Testes de integração

---

## 🎯 Priorização

### Alta Prioridade (Base Mínima)
- ✅ Setup Jest
- ✅ Teste de helpers (formatters, validators)
- ✅ Teste de componente simples (Alert)

### Média Prioridade (Cobertura Básica)
- ✅ Testes de API routes críticas
- ✅ Testes de componentes principais
- ✅ Testes de hooks

### Baixa Prioridade (Cobertura Completa)
- ✅ Testes de integração
- ✅ Testes E2E
- ✅ Cobertura alta (>80%)

---

## ⚠️ Notas Importantes

- **Setup mínimo** - Apenas o necessário para começar
- **Testes simples** - Foco em funcionalidades críticas
- **Nada complexo** - Testes unitários básicos
- **Base de qualidade** - Garantir que código funciona
