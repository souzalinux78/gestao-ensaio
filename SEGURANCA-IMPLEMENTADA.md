# ✅ Segurança Implementada

## 📋 Resumo

Foram implementadas **4 medidas de segurança incrementais**:

1. ✅ **Helmet** - Headers de segurança HTTP
2. ✅ **Rate Limit** - Limitação de requisições
3. ✅ **CSRF** - Proteção contra Cross-Site Request Forgery
4. ✅ **CSP** - Content Security Policy

---

## 🔒 1. Helmet (Headers de Segurança)

### Arquivos Criados
- `src/lib/security-headers.ts` - Módulo de headers de segurança
- `src/middleware.ts` - Middleware Next.js que aplica headers globalmente

### Headers Implementados
- `X-Frame-Options: DENY` - Proteção contra clickjacking
- `X-Content-Type-Options: nosniff` - Previne MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Mitigação XSS
- `X-DNS-Prefetch-Control: off` - Controla DNS prefetch
- `X-Download-Options: noopen` - Proteção IE
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cross-Origin-Opener-Policy: same-origin`
- `Origin-Agent-Cluster: ?1`
- `Permissions-Policy` - Bloqueia recursos desnecessários
- `Strict-Transport-Security` - HSTS (apenas produção)

### Como Funciona
Os headers são aplicados automaticamente via middleware do Next.js em todas as requisições.

---

## ⏱️ 2. Rate Limit

### Arquivos
- `src/lib/rate-limit.ts` - Sistema de rate limiting (melhorado)
- `src/middleware.ts` - Aplica rate limit globalmente

### Configuração
- **Rotas Restritivas** (5 req/15min):
  - `/api/auth`
  - `/api/push/subscribe`

- **Rotas Padrão** (100 req/15min):
  - Todas as outras rotas API

- **Rotas Isentas**:
  - `/api/health`
  - `/_next/*`
  - `/favicon.ico`

### Headers de Resposta
- `X-RateLimit-Limit` - Limite máximo
- `X-RateLimit-Remaining` - Requisições restantes
- `X-RateLimit-Reset` - Timestamp de reset
- `Retry-After` - Segundos até poder tentar novamente (quando bloqueado)

### Resposta 429
Quando o limite é excedido, retorna:
```json
{
  "error": "Muitas requisições. Tente novamente mais tarde.",
  "retryAfter": 900
}
```

---

## 🛡️ 3. CSRF (Cross-Site Request Forgery)

### Arquivos
- `src/lib/csrf.ts` - Sistema de proteção CSRF
- `src/lib/csrf-client.ts` - Helper para frontend
- `src/app/api/csrf-token/route.ts` - API para obter token
- `src/middleware.ts` - Verificação automática

### Rotas Protegidas
Proteção automática para métodos:
- `POST`
- `PUT`
- `PATCH`
- `DELETE`

### Rotas Isentas
- `/api/auth` - Autenticação
- `/api/webhook` - Webhooks
- `/api/health` - Health check

### Como Usar no Frontend

#### Opção 1: Helper Automático
```typescript
import { fetchWithCSRF } from '@/lib/csrf-client';

// Usar em vez de fetch normal
const response = await fetchWithCSRF('/api/ensaios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

#### Opção 2: Manual
```typescript
import { getCSRFToken } from '@/lib/csrf-client';

// Obter token
const token = await getCSRFToken();

// Adicionar ao header
const response = await fetch('/api/ensaios', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token,
  },
  body: JSON.stringify(data),
});
```

### Obter Token Inicial
```typescript
// Chamar ao carregar a aplicação
const response = await fetch('/api/csrf-token');
const { token } = await response.json();
// Token também é salvo em cookie automaticamente
```

### Invalidação
```typescript
import { invalidateCSRFToken } from '@/lib/csrf-client';

// Após logout, por exemplo
invalidateCSRFToken();
```

---

## 🔐 4. CSP (Content Security Policy)

### Arquivos
- `src/lib/csp.ts` - Geração de políticas CSP
- `src/middleware.ts` - Aplica CSP via headers

### Política Padrão
```typescript
default-src 'self'
script-src 'self' 'unsafe-inline'
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob:
connect-src 'self'
font-src 'self' data:
object-src 'none'
media-src 'self'
frame-src 'none'
worker-src 'self' blob:
manifest-src 'self'
form-action 'self'
base-uri 'self'
frame-ancestors 'none'
upgrade-insecure-requests (apenas produção)
```

### Personalização
Edite `src/lib/csp.ts` para ajustar as diretivas conforme necessário.

### Modo Desenvolvimento vs Produção
- **Dev**: Permite `'unsafe-eval'` para hot reload do Next.js
- **Prod**: Mais restritivo, sem `'unsafe-eval'`

---

## 🔧 Configuração

### Middleware
O middleware (`src/middleware.ts`) aplica todas as proteções automaticamente:
1. Headers de segurança (Helmet)
2. Rate limiting
3. Verificação CSRF
4. CSP

### Próximos Passos (Opcional)

#### Para Produção em Escala:
1. **Rate Limit com Redis**: Substituir store em memória por Redis
   ```typescript
   // src/lib/rate-limit-redis.ts
   // Implementar com ioredis ou similar
   ```

2. **CSRF com Sessão**: Integrar com sistema de sessão do servidor
   ```typescript
   // Adaptar getSessionCSRFToken() para usar sessão real
   ```

3. **CSP com Nonce**: Usar nonces em vez de `'unsafe-inline'`
   ```typescript
   // Gerar nonce por requisição
   // Injetar em scripts/styles
   ```

---

## 📝 Notas Importantes

### Compatibilidade
- ✅ Funciona com Next.js 14+
- ✅ Compatível com PWA existente
- ✅ Não quebra funcionalidades existentes

### Performance
- Rate limit em memória (adequado para pequeno/médio tráfego)
- Headers aplicados via middleware (overhead mínimo)
- CSRF token em cookie (acesso rápido)

### Segurança
- Tokens CSRF com hash SHA-256
- Rate limit por IP + rota
- CSP configurável por ambiente
- Headers seguem melhores práticas OWASP

---

## 🐛 Troubleshooting

### Erro 403 CSRF
- Certifique-se de obter token antes de fazer POST/PUT/DELETE
- Verifique se o header `X-CSRF-Token` está sendo enviado
- Confirme que o cookie `csrf-token` está presente

### Rate Limit Muito Restritivo
- Ajuste limites em `src/middleware.ts` → `getRateLimitConfig()`
- Adicione rotas isentas em `RATE_LIMIT_EXEMPT`

### CSP Bloqueando Recursos
- Verifique console do navegador para violações
- Ajuste diretivas em `src/lib/csp.ts` → `getDefaultCSP()`
- Adicione domínios permitidos conforme necessário

---

## ✅ Checklist de Implementação

- [x] Helmet - Headers de segurança
- [x] Rate Limit - Limitação de requisições
- [x] CSRF - Proteção CSRF
- [x] CSP - Content Security Policy
- [x] Middleware global
- [x] Helpers para frontend
- [x] Documentação

---

**Data de Implementação**: 2024
**Versão**: 2.0.30+
