# 🏗️ Análise de Arquitetura

## 📊 Problemas Identificados

### 🔴 CRÍTICO

#### 1. Arquivo Muito Grande
**Localização:** `src/app/admin/usuarios/page.tsx` (~693 linhas)

**Problema:**
- Componente com múltiplas responsabilidades
- Lógica de formulário, filtros, CRUD tudo em um arquivo
- Difícil de manter e testar

**Sugestão:**
- Extrair hooks customizados (`useUsuarios`, `useFiltros`)
- Separar componentes (`UsuarioForm`, `UsuarioList`, `FiltrosUsuarios`)
- Criar helpers (`usuarioHelpers.ts`)

---

#### 2. Função com Múltiplas Responsabilidades
**Localização:** `src/app/api/webhook/route.ts` (~395 linhas)

**Problema:**
- Função `POST` muito longa
- Faz formatação, validação, busca de dados, envio HTTP
- Difícil de testar e manter

**Sugestão:**
- Extrair formatação para `src/lib/webhook-formatter.ts`
- Extrair validação para helpers
- Separar lógica de envio

---

#### 3. Duplicação de Código
**Localização:** Múltiplos lugares

**Problemas:**
- Lógica de validação de usuário duplicada
- Formatação de dados similar em vários lugares
- Estilos de botões/inputs repetidos

**Sugestão:**
- Criar helpers reutilizáveis
- Usar componentes base (já criados: `Alert`, classes CSS)

---

### 🟠 ALTA PRIORIDADE

#### 4. Nomes Pobres
**Localização:** Múltiplos arquivos

**Problemas:**
- `carregarUsuarios()` - genérico, não indica o que faz
- `salvarEnsaio()` - não indica se é create ou update
- `data` - muito genérico

**Sugestão:**
- `carregarUsuarios()` → `fetchUsuarios()` ou `loadUsuariosList()`
- `salvarEnsaio()` → `createOrUpdateEnsaio()`
- `data` → `ensaioData` ou `formData`

---

#### 5. Falta de Helpers
**Localização:** Lógica espalhada

**Problemas:**
- Formatação de data repetida
- Validação de formulários duplicada
- Transformação de dados em vários lugares

**Sugestão:**
- `src/lib/formatters.ts` - formatação de datas, números
- `src/lib/form-helpers.ts` - helpers de formulário
- `src/lib/data-transformers.ts` - transformação de dados

---

## ✅ Melhorias Propostas

### 1. Extrair Hooks Customizados

**Criar:** `src/hooks/useUsuarios.ts`
```typescript
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchUsuarios = async () => { ... };
  const createUsuario = async (data) => { ... };
  const updateUsuario = async (id, data) => { ... };
  const deleteUsuario = async (id) => { ... };
  
  return { usuarios, loading, fetchUsuarios, createUsuario, ... };
}
```

**Benefício:** Lógica reutilizável, mais fácil de testar

---

### 2. Criar Helpers de Formatação

**Criar:** `src/lib/formatters.ts`
```typescript
export function formatDateBR(date: Date | string): string { ... }
export function formatPhone(phone: string): string { ... }
export function formatCurrency(value: number): string { ... }
```

**Benefício:** Código DRY, fácil de manter

---

### 3. Separar Componentes Grandes

**Criar:** 
- `src/components/usuarios/UsuarioForm.tsx`
- `src/components/usuarios/UsuarioList.tsx`
- `src/components/usuarios/FiltrosUsuarios.tsx`

**Benefício:** Componentes menores, mais fáceis de manter

---

### 4. Melhorar Nomenclatura

**Padrão sugerido:**
- Funções assíncronas: `fetch*`, `load*`, `create*`, `update*`, `delete*`
- Handlers: `handle*`
- Helpers: `format*`, `validate*`, `transform*`
- Hooks: `use*`

---

## 📋 Plano de Implementação

### Fase 1 - Helpers Básicos (Implementar AGORA)
1. ✅ Criar `src/lib/formatters.ts`
2. ✅ Criar `src/lib/form-helpers.ts`
3. ✅ Melhorar nomenclatura em funções críticas

### Fase 2 - Hooks Customizados (Esta semana)
4. ✅ Criar `src/hooks/useUsuarios.ts`
5. ✅ Criar `src/hooks/useEnsaios.ts`
6. ✅ Refatorar componentes para usar hooks

### Fase 3 - Componentes Menores (Próximo sprint)
7. ✅ Separar `UsuarioForm` de `usuarios/page.tsx`
8. ✅ Separar `FiltrosUsuarios` de `usuarios/page.tsx`
9. ✅ Extrair lógica de webhook

---

## 🎯 Priorização

### Alta Prioridade (Impacto Imediato)
- ✅ Helpers de formatação
- ✅ Melhorar nomenclatura
- ✅ Extrair hooks customizados

### Média Prioridade (Melhoria Manutenção)
- ✅ Separar componentes grandes
- ✅ Extrair lógica de webhook
- ✅ Criar helpers de formulário

### Baixa Prioridade (Polimento)
- ✅ Refatorar completamente componentes grandes
- ✅ Criar mais hooks customizados
- ✅ Documentação de arquitetura
