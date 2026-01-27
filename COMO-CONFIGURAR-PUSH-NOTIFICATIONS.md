# Como Configurar Push Notifications

## Problema: Chave VAPID não configurada

Se você está vendo o erro "Chave VAPID não configurada", siga estes passos:

## Passo 1: Gerar Chaves VAPID

Execute o script de geração de chaves:

```bash
node scripts/gerar-vapid-keys.js
```

O script irá gerar duas chaves:
- **Chave Pública** (NEXT_PUBLIC_VAPID_PUBLIC_KEY) - será exposta no cliente
- **Chave Privada** (VAPID_PRIVATE_KEY) - deve ser mantida em segredo

## Passo 2: Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env` ou `.env.local` na raiz do projeto e adicione:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua-chave-publica-gerada
VAPID_PRIVATE_KEY=sua-chave-privada-gerada
VAPID_EMAIL=seu-email@exemplo.com
```

**Importante:**
- A chave pública começa com `NEXT_PUBLIC_` para ser acessível no cliente
- A chave privada NÃO deve começar com `NEXT_PUBLIC_`
- O email é usado para identificação do servidor de push

## Passo 3: Reiniciar o Servidor

Após adicionar as variáveis, reinicie o servidor:

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## Passo 4: Testar

1. Acesse a página de Configurações no painel admin
2. Vá para a aba "Notificações Push"
3. Clique em "Ativar Notificações Push"
4. Permita as notificações no navegador

## Solução Alternativa: Usar web-push

Se o script não funcionar, você pode usar a biblioteca `web-push`:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Isso gerará as chaves no formato correto.

## Notas Importantes

- As chaves VAPID são específicas do seu servidor
- Não compartilhe a chave privada
- Em produção, use variáveis de ambiente seguras
- O email VAPID pode ser qualquer email válido (não precisa receber emails)

## Próximos Passos

Após configurar as chaves, você pode:
1. Implementar o envio real de notificações (ver `README-PUSH-NOTIFICATIONS.md`)
2. Criar a tabela `PushSubscription` no banco de dados
3. Instalar a biblioteca `web-push` para envio de notificações
