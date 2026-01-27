# 🔒 Análise de Autenticação - Migração para JWT

## 📊 Estado Atual (NÃO É JWT)

### Como Funciona Hoje

1. **Login (`/api/auth`):**
   - Retorna objeto com dados do usuário
   - Frontend salva em `localStorage` como JSON

2. **Armazenamento Frontend:**
   ```typescript
   // src/lib/session.ts
   localStorage.setItem('gestao_ensaio_user', JSON.stringify(usuario))
   ```

3. **Autenticação em Requisições:**
   ```typescript
   // src/lib/api-client.ts
   headers['Authorization'] = `Bearer ${sessao.id}`  // ⚠️ APENAS O ID!
   ```

4. **Validação Backend:**
   ```typescript
   // src/lib/get-user-from-request.ts
   const userId = parseInt(authHeader.replace('Bearer ', ''))
   // Busca usuário no banco sem verificar assinatura!
   ```

---

## 🔴 Riscos Críticos Identificados

### 1. **Token Replay / Falsificação de Identidade** ⚠️ CRÍTICO
**Problema:** Qualquer pessoa pode criar `Authorization: Bearer 123` e acessar como usuário ID 123.

**Cenário de Ataque:**
```bash
# Atacante descobre que admin tem ID 1
curl -H "Authorization: Bearer 1" https://app.com/api/usuarios
# ✅ Retorna lista de usuários (acesso como admin!)
```

**Impacto:**
- Acesso total ao sistema
- Escalação de privilégios
- Violação de dados (LGPD)

---

### 2. **Sem Expiração** ⚠️ CRÍTICO
**Problema:** Token nunca expira. Se alguém roubar o ID, acesso permanente.

**Cenário:**
- Usuário faz login em computador público
- Esquece de fazer logout
- Qualquer pessoa pode usar o ID indefinidamente

---

### 3. **Sem Refresh Token** ⚠️ ALTA
**Problema:** Não há mecanismo para renovar sessão sem novo login.

**Impacto:**
- Usuários precisam fazer login frequentemente
- UX ruim
- Sem controle de sessões ativas

---

### 4. **Armazenamento Inseguro** ⚠️ MÉDIA
**Problema:** Dados do usuário em `localStorage` (vulnerável a XSS).

**Risco:**
- Script malicioso pode ler `localStorage`
- Roubo de identidade

---

### 5. **Sem Revogação** ⚠️ ALTA
**Problema:** Não há como invalidar sessões.

**Cenário:**
- Admin muda senha de usuário
- Usuário ainda pode usar ID antigo até fazer logout manual

---

### 6. **Sem Verificação de Integridade** ⚠️ CRÍTICO
**Problema:** Backend confia cegamente no ID enviado.

**Impacto:**
- Zero proteção contra manipulação
- Fácil de explorar

---

## ✅ Solução Proposta: JWT Incremental

### Estratégia de Migração

**Fase 1:** Implementar JWT paralelo (não quebrar sistema atual)
**Fase 2:** Migrar frontend gradualmente
**Fase 3:** Desativar sistema antigo após validação

---

### Arquitetura JWT Proposta

```
┌─────────────┐
│   Login     │
│  /api/auth  │
└──────┬──────┘
       │
       ├─► Gera JWT Access Token (15min)
       ├─► Gera JWT Refresh Token (7 dias)
       └─► Retorna ambos
       
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       ├─► Access Token → localStorage (temporário)
       └─► Refresh Token → httpOnly cookie (seguro)
       
┌─────────────┐
│   API Call  │
└──────┬──────┘
       │
       ├─► Envia Access Token no header
       └─► Se expirado, usa Refresh Token
```

---

### Especificações Técnicas

#### Access Token
- **Algoritmo:** HS256 (HMAC SHA-256)
- **Expiração:** 15 minutos
- **Payload:**
  ```json
  {
    "userId": 123,
    "tipo": "admin",
    "aprovado": true,
    "iat": 1234567890,
    "exp": 1234568790
  }
  ```
- **Armazenamento:** `localStorage` (temporário, será migrado)

#### Refresh Token
- **Algoritmo:** HS256
- **Expiração:** 7 dias
- **Payload:**
  ```json
  {
    "userId": 123,
    "tokenId": "uuid-v4",
    "iat": 1234567890,
    "exp": 1234571490
  }
  ```
- **Armazenamento:** `httpOnly` cookie (seguro contra XSS)
- **Banco de Dados:** Tabela `RefreshToken` para revogação

---

### Proteções Implementadas

1. ✅ **Assinatura Digital** - Token não pode ser falsificado
2. ✅ **Expiração** - Tokens expiram automaticamente
3. ✅ **Refresh Token** - Renovação sem novo login
4. ✅ **Revogação** - Tokens podem ser invalidados
5. ✅ **Token Replay** - Mitigado com expiração curta + refresh
6. ✅ **XSS Protection** - Refresh token em httpOnly cookie

---

## 📝 Plano de Implementação Incremental

### Etapa 1: Infraestrutura JWT (Backend)
- [x] Instalar `jsonwebtoken`
- [ ] Criar `src/lib/jwt.ts` (gerar/validar tokens)
- [ ] Criar tabela `RefreshToken` no Prisma
- [ ] Endpoint `/api/auth/refresh` para renovar token

### Etapa 2: Modificar Login (Backend)
- [ ] Modificar `/api/auth` para retornar JWT + dados do usuário
- [ ] Manter compatibilidade: retornar ambos formatos
- [ ] Adicionar refresh token em cookie httpOnly

### Etapa 3: Validação Híbrida (Backend)
- [ ] Modificar `get-user-from-request.ts` para aceitar JWT OU ID
- [ ] Priorizar JWT se presente
- [ ] Fallback para sistema antigo (compatibilidade)

### Etapa 4: Frontend - Cliente JWT
- [ ] Criar `src/lib/jwt-client.ts` (gerenciar tokens)
- [ ] Modificar `api-client.ts` para usar JWT
- [ ] Implementar refresh automático

### Etapa 5: Migração Gradual
- [ ] Testar com usuários de teste
- [ ] Monitorar logs
- [ ] Migrar produção gradualmente

### Etapa 6: Remover Sistema Antigo
- [ ] Deprecar autenticação por ID
- [ ] Forçar migração para JWT
- [ ] Remover código legado

---

## 🔧 Código Incremental

### 1. Instalação de Dependências

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### 2. Variáveis de Ambiente

```env
# .env
JWT_SECRET=seu-secret-super-seguro-aqui-minimo-32-caracteres
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Estrutura de Arquivos

```
src/lib/
  ├── jwt.ts              (novo) - Geração/validação JWT
  ├── jwt-client.ts        (novo) - Cliente frontend
  └── get-user-from-request.ts (modificar) - Suporte híbrido

src/app/api/
  └── auth/
      ├── route.ts        (modificar) - Retornar JWT
      └── refresh/
          └── route.ts    (novo) - Renovar token

prisma/
  └── schema.prisma       (modificar) - Adicionar RefreshToken
```

---

## ⚠️ Compatibilidade

### Durante Migração

1. **Backend aceita ambos:**
   - JWT (prioridade)
   - ID antigo (fallback)

2. **Frontend pode usar:**
   - JWT (novo)
   - ID antigo (durante transição)

3. **Login retorna:**
   ```json
   {
     "id": 123,
     "nome": "João",
     "token": "eyJhbGc...",  // NOVO
     "refreshToken": "..."   // NOVO (em cookie)
   }
   ```

---

## 🎯 Benefícios da Solução

1. ✅ **Segurança Real** - Tokens assinados, não falsificáveis
2. ✅ **Expiração Automática** - Sessões não ficam abertas para sempre
3. ✅ **Refresh Automático** - UX melhor, sem logins frequentes
4. ✅ **Revogação** - Controle total sobre sessões
5. ✅ **Compatibilidade** - Migração sem quebrar sistema
6. ✅ **Incremental** - Implementação gradual, baixo risco

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Atual (Inseguro) | Proposto (JWT) |
|---------|------------------|----------------|
| Falsificação | ✅ Fácil (qualquer ID) | ❌ Impossível (assinatura) |
| Expiração | ❌ Nunca expira | ✅ 15 minutos |
| Refresh | ❌ Não existe | ✅ Automático |
| Revogação | ❌ Não existe | ✅ Via banco |
| Replay Attack | ✅ Vulnerável | ⚠️ Mitigado (expiração) |
| XSS Protection | ❌ localStorage | ✅ httpOnly cookie |

---

## 🚀 Próximos Passos

1. Revisar este documento
2. Aprovar estratégia
3. Implementar Etapa 1 (infraestrutura)
4. Testar em desenvolvimento
5. Deploy gradual

---

## 📚 Referências

- [JWT.io](https://jwt.io) - Documentação oficial
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JWT Specification
