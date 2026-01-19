# Instruções de Configuração

## 1. Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto (`gestao-ensaio/.env`) com o seguinte conteúdo:

```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/gestao_ensaio?schema=public"
NEXTAUTH_SECRET="gere-um-secret-aleatorio-aqui"
```

**Substitua:**
- `SUA_SENHA` pela sua senha do MySQL
- `root` pelo seu usuário MySQL (se diferente)
- `3306` pela porta do MySQL (se diferente)

## 2. Criar o banco de dados MySQL

Execute o script SQL para criar o banco:

```bash
mysql -u root -p < scripts/create-database.sql
```

Ou execute manualmente no MySQL:

```sql
CREATE DATABASE IF NOT EXISTS gestao_ensaio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 3. Sincronizar schema do Prisma

```bash
npm run db:push
```

## 4. Popular dados iniciais

```bash
npm run db:seed
```

Isso irá:
- Criar todos os 38 instrumentos padrão
- Criar usuário admin: `admin@congregacao.com` / `admin123`
- Criar usuário instrutor: `instrutor@congregacao.com` / `instrutor123`

⚠️ **IMPORTANTE**: Altere as senhas após o primeiro login!

## 5. Executar o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## Solução de Problemas

### Erro: "Environment variable not found: DATABASE_URL"

Certifique-se de que o arquivo `.env` existe na raiz do projeto e contém a variável `DATABASE_URL`.

### Erro: "Unknown file extension .ts"

O script foi atualizado para usar `ts-node` com configuração correta. Se ainda houver problemas, você pode executar o script SQL diretamente:

```bash
mysql -u root -p gestao_ensaio < scripts/populate-instrumentos.sql
```

E criar os usuários manualmente via Prisma Studio:

```bash
npm run db:studio
```
