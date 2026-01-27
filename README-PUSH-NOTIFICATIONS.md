# Push Notifications PWA

Estrutura básica de push notifications implementada.

## Estrutura Criada

### 1. Service Worker (`public/sw.js`)
- Event listener para `push` - recebe notificações
- Event listener para `notificationclick` - trata cliques
- Event listener para `notificationclose` - trata fechamento

### 2. APIs Backend

#### `/api/push/subscribe` (POST)
- Salva subscription do usuário
- Requer autenticação
- Body: `{ subscription: PushSubscription }`

#### `/api/push/send` (POST)
- Envia notificações push
- Requer role admin
- Body: `{ title: string, body: string, userId?: number }`

### 3. Frontend

#### Hook `usePushNotifications`
- Gerencia estado de subscription
- Solicita permissão
- Faz subscribe/unsubscribe

#### Componente `PushNotificationButton`
- UI para ativar/desativar notificações
- Integrado na página de configurações

## Como Funciona

1. **Usuário ativa notificações:**
   - Clica em "Ativar Notificações Push"
   - Navegador solicita permissão
   - Se permitido, cria subscription
   - Subscription é salva no backend

2. **Admin envia notificação:**
   - Acessa `/api/push/send`
   - Backend busca subscriptions
   - Envia notificação via web-push

3. **Service Worker recebe:**
   - Mostra notificação
   - Trata clique para abrir app

## Próximos Passos (Para Produção)

### 1. Gerar Chaves VAPID

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Adicione ao `.env`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua-chave-publica
VAPID_PRIVATE_KEY=sua-chave-privada
VAPID_EMAIL=seu-email@exemplo.com
```

### 2. Instalar web-push

```bash
npm install web-push
npm install --save-dev @types/web-push
```

### 3. Criar Tabela PushSubscription

Adicionar ao `schema.prisma`:
```prisma
model PushSubscription {
  id          Int      @id @default(autoincrement())
  userId      Int
  usuario     Usuario  @relation(fields: [userId], references: [id], onDelete: Cascade)
  endpoint    String   @db.Text
  keys        String   @db.Text // JSON com p256dh e auth
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, endpoint])
  @@index([userId])
  @@map("PushSubscription")
}
```

E adicionar relação em `Usuario`:
```prisma
pushSubscriptions PushSubscription[]
```

### 4. Implementar Envio Real

Atualizar `/api/push/send/route.ts`:
```typescript
import webpush from 'web-push';

// Configurar VAPID
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Buscar subscriptions
const subscriptions = await prisma.pushSubscription.findMany({
  where: userId ? { userId } : {},
});

// Enviar para cada subscription
for (const sub of subscriptions) {
  const subscription = {
    endpoint: sub.endpoint,
    keys: JSON.parse(sub.keys),
  };
  
  await webpush.sendNotification(
    subscription,
    JSON.stringify({ title, body })
  );
}
```

## Notas

- Estrutura básica criada sem dependências pesadas
- Funcionalidade completa requer web-push e chaves VAPID
- Service Worker já está configurado para receber notificações
- Frontend pronto para solicitar permissão e fazer subscribe
