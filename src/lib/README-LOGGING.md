# Sistema de Logging e Error Handling

## Estrutura

### Arquivos Criados

1. **`src/lib/logger.ts`** - Logger estruturado com Winston
   - Logs em JSON estruturado
   - Suporte a Request ID, User ID, Tenant ID
   - Sanitização automática de dados sensíveis

2. **`src/lib/request-id.ts`** - Gerenciamento de Request ID
   - Gera UUID único para cada requisição
   - Adiciona header `x-request-id` nas respostas

3. **`src/lib/error-handler.ts`** - Error Handler Global
   - Tratamento centralizado de erros
   - Respostas padronizadas
   - Erros customizados pré-definidos

4. **`src/lib/api-handler.ts`** - Wrapper para rotas
   - Integra Request ID + Error Handling + Logging
   - Contexto automático do usuário

## Compatibilidade

✅ **O código existente continua funcionando!**

O logger exportado (`logger`) mantém a mesma interface:
- `logger.info(message, context?)`
- `logger.warn(message, context?)`
- `logger.error(message, error?, context?)`
- `logger.debug(message, context?)`

## Uso Opcional

Você pode usar o novo sistema gradualmente:

1. **Código existente**: Continua usando `logger` normalmente
2. **Novas rotas**: Use `createApiHandler` para ter tudo integrado
3. **Migração gradual**: Envolva rotas existentes quando quiser

Veja `EXEMPLO-USO-LOGGING.md` para exemplos detalhados.
