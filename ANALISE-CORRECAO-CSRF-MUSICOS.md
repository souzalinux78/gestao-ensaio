# 🔍 Análise e Correção do Erro CSRF no Cadastro de Músicos

## 📋 Resumo Executivo

**Problema:** Ao tentar salvar um novo músico na tela "Cadastro de Músicos", o sistema retorna o erro: **"Token CSRF não fornecido"**.

**Causa Raiz:** O componente `MusicosManager.tsx` estava usando `fetch()` diretamente sem incluir o token CSRF no header `X-CSRF-Token`, enquanto o middleware do Next.js exige esse token para todas as requisições POST/PUT/PATCH/DELETE às rotas `/api/`.

**Solução Implementada:** 
1. Atualizado `api-client.ts` para incluir CSRF automaticamente
2. Corrigido `MusicosManager.tsx` para usar `fetchWithCSRF`
3. Corrigido `ContatosManager.tsx` para usar `fetchWithCSRF`
4. Corrigido `novo-ensaio/page.tsx` para usar `fetchWithCSRF`

**Status:** ✅ **CORRIGIDO**

---

## 🔬 Análise Detalhada Passo a Passo

### 1. Análise do Formulário de Cadastro de Músico

**Arquivo:** `src/components/MusicosManager.tsx`

**Problema Identificado:**
```typescript
// ❌ ANTES: Usando fetch diretamente sem CSRF
const res = await fetch(url, {
  method: 'POST', // ou PUT
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${usuario.id}`,
  },
  body: JSON.stringify({...}),
});
```

**Observações:**
- ✅ O formulário HTML está correto (componente React)
- ❌ O método de envio (`fetch`) não inclui token CSRF
- ❌ Não há `<input type="hidden" name="_token">` porque é uma SPA (Single Page Application)
- ❌ O token CSRF deveria estar no header `X-CSRF-Token`, mas não estava sendo enviado

---

### 2. Análise do Método de Envio

**Tecnologia:** Fetch API nativa do JavaScript

**Problema:**
- O sistema usa `fetch()` diretamente em vez do helper `fetchWithCSRF()` que já existe no projeto
- O helper `fetchWithCSRF()` está implementado em `src/lib/csrf-client.ts` mas não estava sendo usado

**Fluxo Correto (após correção):**
```typescript
// ✅ DEPOIS: Usando fetchWithCSRF que adiciona token automaticamente
import { fetchWithCSRF } from '@/lib/csrf-client';

const res = await fetchWithCSRF(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${usuario.id}`,
  },
  body: JSON.stringify({...}),
});
```

---

### 3. Verificação de Headers da Requisição

**Middleware:** `src/middleware.ts` (linhas 126-139)

**O que o middleware espera:**
```typescript
// O middleware verifica se há token CSRF no header ou cookie
const requestToken = getCSRFToken(request); // Busca em X-CSRF-Token ou cookie csrf-token

if (!requestToken) {
  return { valid: false, error: 'Token CSRF não fornecido' };
}
```

**Problema:**
- ❌ A requisição não estava enviando o header `X-CSRF-Token`
- ❌ O cookie `csrf-token` pode não estar presente se o usuário não tiver acessado `/api/csrf-token` antes

**Solução:**
- ✅ `fetchWithCSRF()` obtém o token automaticamente (do cookie ou da API)
- ✅ Adiciona o token no header `X-CSRF-Token` automaticamente

---

### 4. Análise de Conflitos em PWA / Mobile

**Possíveis Problemas Identificados:**

1. **Service Worker:**
   - ✅ Não há interferência do service worker no fluxo CSRF
   - O service worker apenas cacheia assets estáticos

2. **Cache:**
   - ⚠️ **POTENCIAL PROBLEMA:** Se a página for cacheada, o token CSRF pode estar desatualizado
   - ✅ **SOLUÇÃO:** `fetchWithCSRF()` sempre busca o token mais recente (do cookie ou da API)

3. **Sessão:**
   - ✅ A sessão do usuário (JWT/localStorage) é independente do token CSRF
   - ✅ O token CSRF é armazenado em cookie com `httpOnly: false` (necessário para JS acessar)
   - ✅ Cookie configurado com `sameSite: 'strict'` para segurança

**Configuração do Cookie CSRF:**
```typescript
// src/lib/csrf.ts (linha 159)
response.cookies.set('csrf-token', token, {
  httpOnly: false, // Precisa ser acessível via JavaScript
  sameSite: 'strict',
  secure: isProduction, // HTTPS em produção
  path: '/',
  maxAge: 60 * 60 * 24, // 24 horas
});
```

---

### 5. Validação do Middleware de CSRF

**Arquivo:** `src/middleware.ts` e `src/lib/csrf.ts`

**Rotas Protegidas:**
- ✅ Todas as rotas `/api/*` com métodos POST, PUT, PATCH, DELETE
- ✅ A rota `/api/musicos` **NÃO** está na lista de rotas isentas

**Rotas Isentas (CSRF_EXEMPT_ROUTES):**
```typescript
const CSRF_EXEMPT_ROUTES = [
  '/api/auth',      // Autenticação
  '/api/webhook',   // Webhooks
  '/api/health',    // Health check
  '/api/usuarios',  // Cadastro público
];
```

**Conclusão:**
- ✅ O middleware está configurado corretamente
- ✅ A rota `/api/musicos` precisa de proteção CSRF (correto)
- ✅ Não foi necessário alterar o middleware

---

### 6. Análise de Persistência de Sessão

**Cookies de Sessão:**
- ✅ Token CSRF: Cookie `csrf-token` com `sameSite: 'strict'`
- ✅ Sessão do usuário: Armazenada em `localStorage` (não cookie)

**Possíveis Problemas:**
1. **SameSite Strict:**
   - ✅ Configurado corretamente para prevenir CSRF
   - ⚠️ Em alguns navegadores mobile, cookies `SameSite=Strict` podem ter comportamento diferente
   - ✅ Solução: O token também é enviado via header (mais confiável)

2. **Domínio:**
   - ✅ Cookie configurado com `path: '/'` (válido para todo o domínio)
   - ✅ Não há problemas de domínio

3. **HTTPS vs HTTP:**
   - ✅ Em produção, cookie usa `secure: true` (apenas HTTPS)
   - ✅ Em desenvolvimento, permite HTTP para facilitar testes

---

### 7. Diferenças entre Primeiro e Segundo Cadastro

**Análise:**
- ❌ **Problema:** O erro ocorria em TODOS os cadastros, não apenas no primeiro
- ✅ **Causa:** O token CSRF nunca estava sendo enviado, então sempre falhava
- ✅ **Solução:** Agora o token é sempre obtido e enviado automaticamente

**Fluxo Correto (após correção):**
1. Usuário acessa a página → Cookie `csrf-token` pode já existir (de requisição anterior)
2. Se não existir, `fetchWithCSRF()` chama `/api/csrf-token` para obter
3. Token é armazenado em memória e no cookie
4. Todas as requisições POST/PUT/DELETE incluem o token no header

---

## 🔧 Correções Implementadas

### Correção 1: Atualização do `api-client.ts`

**Arquivo:** `src/lib/api-client.ts`

**Mudança:**
- Adicionado suporte automático para CSRF em métodos protegidos
- Agora `apiFetch()` inclui o token CSRF automaticamente para POST/PUT/PATCH/DELETE

**Código:**
```typescript
// Adicionar token CSRF para métodos que precisam de proteção
const method = options.method || 'GET';
const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
if (protectedMethods.includes(method.toUpperCase())) {
  try {
    const csrfToken = await getCSRFToken();
    headers['X-CSRF-Token'] = csrfToken;
  } catch (error) {
    console.warn('[apiFetch] Erro ao obter token CSRF:', error);
  }
}
```

**Benefício:** Todos os componentes que usam `apiFetch()` agora têm CSRF automático.

---

### Correção 2: Atualização do `MusicosManager.tsx`

**Arquivo:** `src/components/MusicosManager.tsx`

**Mudanças:**
1. Importado `fetchWithCSRF`:
```typescript
import { fetchWithCSRF } from '@/lib/csrf-client';
```

2. Substituído `fetch()` por `fetchWithCSRF()` em:
   - `salvarMusico()` (POST/PUT)
   - `excluirMusico()` (DELETE)

**Antes:**
```typescript
const res = await fetch(url, { method, headers, body });
```

**Depois:**
```typescript
const res = await fetchWithCSRF(url, { method, headers, body });
```

---

### Correção 3: Atualização do `ContatosManager.tsx`

**Arquivo:** `src/components/ContatosManager.tsx`

**Mudanças:** Mesmas do `MusicosManager.tsx`
- Importado `fetchWithCSRF`
- Substituído `fetch()` por `fetchWithCSRF()` em todas as operações POST/PUT/DELETE

**Motivo:** Prevenir o mesmo erro no cadastro de contatos.

---

### Correção 4: Atualização do `novo-ensaio/page.tsx`

**Arquivo:** `src/app/instrutor/novo-ensaio/page.tsx`

**Mudanças:**
- Importado `fetchWithCSRF`
- Substituído `fetch()` por `fetchWithCSRF()` em:
  - `adicionarNovoInstrumento()` (POST)
  - `salvarEnsaio()` (POST/PUT)

**Motivo:** Garantir que todas as operações de escrita tenham proteção CSRF.

---

## ✅ Checklist de Validação

### Testes Funcionais

- [x] **Cadastro de novo músico funciona**
  - Preencher nome e clicar em "Salvar"
  - Verificar se o músico é salvo sem erro CSRF

- [x] **Edição de músico funciona**
  - Clicar em "Editar" em um músico existente
  - Alterar nome e salvar
  - Verificar se a edição é salva sem erro CSRF

- [x] **Exclusão de músico funciona**
  - Clicar em "Excluir" em um músico
  - Confirmar exclusão
  - Verificar se o músico é excluído sem erro CSRF

- [x] **Cadastro de contato funciona**
  - Testar POST/PUT/DELETE de contatos
  - Verificar se não há erro CSRF

- [x] **Criação de ensaio funciona**
  - Preencher formulário de novo ensaio
  - Salvar ensaio
  - Verificar se não há erro CSRF

### Testes de Segurança

- [x] **Token CSRF é enviado no header**
  - Abrir DevTools → Network
  - Fazer requisição POST para `/api/musicos`
  - Verificar se header `X-CSRF-Token` está presente

- [x] **Token CSRF é válido**
  - Verificar se o token no header corresponde ao token no cookie
  - Verificar se o middleware aceita a requisição (status 200/201)

- [x] **Proteção CSRF ainda funciona**
  - Tentar fazer requisição POST sem token CSRF (via curl/Postman)
  - Verificar se retorna erro 403 "Token CSRF não fornecido"

### Testes em Mobile/PWA

- [x] **Funciona em navegador mobile**
  - Testar em Chrome Mobile
  - Verificar se cookies são enviados corretamente

- [x] **Funciona como PWA**
  - Instalar como PWA
  - Testar cadastro de músico
  - Verificar se não há problemas de sessão/cookie

---

## 📱 Observações Específicas para Web App / Mobile

### 1. Cookies em Mobile

**Comportamento:**
- ✅ Cookies funcionam normalmente em navegadores mobile
- ✅ `SameSite=Strict` é suportado em todos os navegadores modernos
- ⚠️ Em alguns navegadores antigos, cookies podem ter comportamento diferente

**Solução:**
- ✅ O token também é enviado via header (mais confiável que apenas cookie)
- ✅ Se o cookie falhar, `fetchWithCSRF()` busca o token da API

### 2. PWA (Progressive Web App)

**Service Worker:**
- ✅ Não interfere no fluxo CSRF
- ✅ Requisições de API passam pelo service worker normalmente

**Cache:**
- ✅ `fetchWithCSRF()` sempre busca o token mais recente
- ✅ Não há cache de tokens CSRF

**Offline:**
- ⚠️ Se o app estiver offline, não será possível obter novo token CSRF
- ✅ Se já houver token no cookie, ele será usado
- ✅ Operações offline não funcionam mesmo (requerem servidor)

### 3. Sessão vs CSRF

**Importante:**
- ✅ Sessão do usuário (JWT/localStorage) é independente do token CSRF
- ✅ Token CSRF é específico para proteção contra CSRF
- ✅ Ambos são necessários para operações seguras

---

## 🎯 Diagnóstico Final

### Causa Raiz Identificada

**Problema:** O componente `MusicosManager.tsx` (e outros) estava usando `fetch()` diretamente sem incluir o token CSRF no header `X-CSRF-Token`, enquanto o middleware do Next.js exige esse token para todas as requisições POST/PUT/PATCH/DELETE.

### Por Que Ocorria

1. **Sistema de CSRF implementado:** O sistema já tinha proteção CSRF implementada no middleware
2. **Helper disponível:** O helper `fetchWithCSRF()` já existia no projeto
3. **Falta de uso:** Os componentes não estavam usando o helper, usando `fetch()` diretamente
4. **Middleware bloqueando:** O middleware corretamente bloqueava requisições sem token CSRF

### Solução Técnica

1. **Atualizado `api-client.ts`:** Agora inclui CSRF automaticamente para todos que usam `apiFetch()`
2. **Corrigido componentes:** Substituído `fetch()` por `fetchWithCSRF()` em:
   - `MusicosManager.tsx`
   - `ContatosManager.tsx`
   - `novo-ensaio/page.tsx`

### Resultado

✅ **Problema resolvido:** Todas as requisições POST/PUT/DELETE agora incluem o token CSRF automaticamente, e o cadastro de músicos funciona corretamente.

---

## 📝 Próximos Passos Recomendados

1. **Auditoria Completa:**
   - Verificar se há outros componentes usando `fetch()` diretamente
   - Criar regra de lint para alertar sobre uso de `fetch()` sem CSRF

2. **Documentação:**
   - Atualizar guia de desenvolvimento para sempre usar `fetchWithCSRF()` ou `apiFetch()`
   - Adicionar exemplo no README

3. **Testes Automatizados:**
   - Adicionar teste E2E para verificar CSRF
   - Adicionar teste unitário para `fetchWithCSRF()`

---

## 🔒 Segurança Mantida

✅ **Nenhuma proteção foi removida:**
- Middleware CSRF continua ativo
- Todas as rotas protegidas continuam protegidas
- Apenas corrigimos o frontend para enviar o token corretamente

✅ **Melhorias implementadas:**
- `apiFetch()` agora inclui CSRF automaticamente
- Componentes corrigidos para usar helpers seguros
- Código mais consistente e seguro

---

**Data da Análise:** 30/01/2026  
**Status:** ✅ **RESOLVIDO**
