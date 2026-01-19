# Solução para Erro 500 na API de Configurações

## Erro: "Cannot read properties of undefined (reading 'findFirst')"

Este erro ocorre porque o Prisma Client não foi regenerado após as mudanças no schema.

## Solução Passo a Passo

### 1. Pare o servidor Next.js
Pressione `Ctrl+C` no terminal onde o servidor está rodando.

### 2. Regenerar o Prisma Client

No PowerShell, execute:

```powershell
cd "C:\Users\eduardosouza\OneDrive\Documentos\Gestão de Ensaio\gestao-ensaio"
npm run db:generate
```

### 3. Verificar se a tabela existe no banco

Execute o script SQL para criar a tabela se não existir:

```powershell
mysql -u root -p gestao_ensaio < scripts/add-contato-table.sql
```

Ou use o Prisma para sincronizar:

```powershell
npm run db:push
```

### 4. Se a tabela Configuracoes já existia com campos antigos

Execute no MySQL para remover os campos antigos:

```sql
USE gestao_ensaio;
ALTER TABLE Configuracoes DROP COLUMN telefone;
ALTER TABLE Configuracoes DROP COLUMN nome;
```

### 5. Reiniciar o servidor

```powershell
npm run dev
```

## Verificação

Após executar esses passos, acesse novamente:
- http://localhost:3000/admin/configuracoes

O erro deve desaparecer.

## Nota Importante

Sempre que você modificar o arquivo `prisma/schema.prisma`, é necessário:
1. Executar `npm run db:generate` para regenerar o Prisma Client
2. Executar `npm run db:push` para sincronizar o banco de dados (se necessário)
3. Reiniciar o servidor Next.js
