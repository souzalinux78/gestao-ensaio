# 🔒 Relatório de Análise de Segurança - Backend

## 📋 Problemas Identificados

### 🔴 CRÍTICO

#### 1. Autenticação Insegura - ID no Header
**Localização:** `src/lib/get-user-from-request.ts:12`
```typescript
const userId = parseInt(authHeader.replace('Bearer ', ''));
```
**Problema:** Qualquer usuário pode falsificar o ID no header `Authorization: Bearer 123` e acessar dados de outros usuários.
**Impacto Real:** 
- Acesso não autorizado a dados de qualquer usuário
- Escalação de privilégios (instrutor pode acessar como admin)
- Violação de dados pessoais (LGPD)
**Correção Mínima:** Implementar JWT tokens assinados ou sessões seguras com hash.

---

#### 2. Falta de Rate Limiting
**Localização:** `src/app/api/auth/route.ts`
**Problema:** API de login não tem proteção contra brute force.
**Impacto Real:**
- Ataques de força bruta em senhas
- DDoS em endpoints de autenticação
- Bloqueio de contas legítimas
**Correção Mínima:** Adicionar rate limiting (ex: 5 tentativas por IP a cada 15 minutos).

---

### 🟠 ALTA PRIORIDADE

#### 3. Validação de Entrada Insuficiente
**Localizações:** 
- `src/app/api/ensaios/route.ts:22` - `parseInt(instrutorId)` sem validação
- `src/app/api/contatos/route.ts:12` - `parseInt(usuarioIdParam)` sem validação
- `src/app/api/usuarios/route.ts:32` - Campos não validados
- `src/app/api/webhook/route.ts:7` - `ensaioId` não validado

**Problema:** 
- `parseInt()` pode retornar `NaN` se receber string inválida
- Campos de texto não têm limite de tamanho
- Tipos não são validados antes de usar

**Impacto Real:**
- Erros 500 por valores inválidos
- Possível DoS com strings muito grandes
- Dados corrompidos no banco

**Correção Mínima:** 
- Validar `parseInt` retorna número válido
- Adicionar limites de tamanho (ex: nome max 255 chars)
- Validar tipos antes de usar

---

#### 4. Headers HTTP de Segurança Ausentes
**Localização:** `next.config.js`
**Problema:** Falta:
- `X-Frame-Options: DENY` (proteção clickjacking)
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy` (CSP)

**Impacto Real:**
- Vulnerável a clickjacking
- MIME type sniffing attacks
- XSS não mitigado pelo navegador

**Correção Mínima:** Adicionar headers básicos de segurança no `next.config.js`.

---

#### 5. CORS Não Configurado
**Localização:** `next.config.js`
**Problema:** CORS pode estar permitindo qualquer origem (padrão Next.js).
**Impacto Real:**
- Requisições de qualquer domínio podem acessar APIs
- CSRF facilitado
**Correção Mínima:** Configurar CORS restritivo (apenas domínios permitidos).

---

#### 6. Autorização Inconsistente
**Localizações:**
- `src/app/api/ensaios/[id]/route.ts:11` - GET não verifica permissão
- `src/app/api/usuarios/route.ts:5` - GET lista todos sem verificar admin
- `src/app/api/configuracoes/route.ts:4` - GET não verifica autenticação

**Problema:** Algumas rotas não verificam se o usuário tem permissão.
**Impacto Real:**
- Instrutores podem ver dados de outros instrutores
- Dados sensíveis expostos sem autenticação

**Correção Mínima:** Adicionar verificação de autenticação/autorização em todas as rotas sensíveis.

---

### 🟡 MÉDIA PRIORIDADE

#### 7. Sanitização de Inputs Ausente
**Localização:** Múltiplas APIs
**Problema:** Strings não são sanitizadas antes de salvar (XSS potencial).
**Impacto Real:**
- XSS armazenado se dados forem renderizados sem escape
- Dados maliciosos no banco

**Correção Mínima:** Sanitizar strings (remover caracteres perigosos, limitar tamanho).

---

#### 8. Exposição de Stack Traces
**Localização:** Múltiplas APIs
**Problema:** `error.message` e `error.stack` expostos em produção.
**Impacto Real:**
- Informações sobre estrutura interna
- Caminhos de arquivos expostos

**Correção Mínima:** Ocultar detalhes de erro em produção (já parcialmente implementado).

---

#### 9. Query Raw sem Sanitização
**Localização:** `src/app/api/health/route.ts:23,41`
**Problema:** `$queryRaw` usado, mas com template literals seguros.
**Status:** ✅ **SEGURO** - Prisma usa prepared statements.

---

#### 10. Validação de Webhook URL Ausente
**Localização:** `src/app/api/configuracoes/route.ts:40`
**Problema:** URL do webhook não é validada.
**Impacto Real:**
- SSRF (Server-Side Request Forgery) se URL maliciosa for configurada
**Correção Mínima:** Validar que URL é HTTPS e de domínio permitido.

---

### 🟢 BAIXA PRIORIDADE

#### 11. Secrets em Logs
**Localização:** `src/app/api/health/route.ts:15-17`
**Problema:** Health check expõe se `DATABASE_URL` está configurado (não o valor, apenas status).
**Status:** ✅ **ACEITÁVEL** - Apenas status, não valores.

---

#### 12. Falta de Validação de Tipo de Usuário
**Localização:** `src/app/api/usuarios/route.ts:42`
**Problema:** Tipo pode ser qualquer string, não apenas 'admin' ou 'instrutor'.
**Impacto Real:**
- Dados inválidos no banco
**Correção Mínima:** Validar enum de tipos.

---

## 📊 Resumo por Severidade

| Severidade | Quantidade | Status |
|------------|------------|--------|
| 🔴 Crítico | 2 | Requer ação imediata |
| 🟠 Alta | 4 | Corrigir em breve |
| 🟡 Média | 3 | Melhorar quando possível |
| 🟢 Baixa | 2 | Aceitável por enquanto |

---

## 🎯 Priorização de Correções

### Fase 1 - Crítico (Implementar AGORA)
1. ✅ Autenticação JWT (requer planejamento)
2. ✅ Rate Limiting em `/api/auth`

### Fase 2 - Alta Prioridade (Esta semana)
3. ✅ Validação de entrada em todas as APIs
4. ✅ Headers HTTP de segurança
5. ✅ CORS restritivo
6. ✅ Autorização consistente

### Fase 3 - Média Prioridade (Próximo sprint)
7. ✅ Sanitização de inputs
8. ✅ Validação de webhook URL
9. ✅ Validação de tipos enum

---

## 📝 Notas Importantes

- **Prisma protege contra SQL Injection** ✅
- **Bcrypt usado corretamente** ✅
- **Senhas não são logadas** ✅ (após melhorias recentes)
- **Estrutura de pastas não será alterada** ✅
- **APIs públicas não serão alteradas** ✅
- **Correções serão patches pequenos e isolados** ✅
