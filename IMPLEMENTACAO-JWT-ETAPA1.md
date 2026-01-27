# 🚀 Implementação JWT - Etapa 1: Infraestrutura

## Objetivo
Criar infraestrutura JWT sem quebrar sistema atual. Implementação 100% compatível.

## Arquivos a Criar/Modificar

### 1. Instalar Dependências
```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### 2. Adicionar ao Schema Prisma
```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    Int
  usuario   Usuario  @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([token])
  @@index([expiresAt])
  @@map("RefreshToken")
}
```

E adicionar relação no Usuario:
```prisma
model Usuario {
  // ... campos existentes
  refreshTokens RefreshToken[]
}
```

### 3. Criar src/lib/jwt.ts
- Gerar access token (15min)
- Gerar refresh token (7 dias)
- Validar tokens
- Extrair payload

### 4. Criar src/app/api/auth/refresh/route.ts
- Endpoint para renovar access token
- Validar refresh token
- Retornar novo access token

### 5. Modificar src/lib/get-user-from-request.ts
- Aceitar JWT OU ID antigo
- Priorizar JWT
- Fallback para compatibilidade

## Compatibilidade
✅ Sistema antigo continua funcionando
✅ Novo sistema funciona em paralelo
✅ Migração gradual possível
