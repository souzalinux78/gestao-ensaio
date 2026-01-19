# Sistema de Gestão de Ensaio

Sistema web para gestão de ensaios musicais com controle de presença por instrumento e funções.

## Funcionalidades

- **Administrador**: Acesso a relatórios de ensaios filtrados por data
- **Instrutor**: Cadastro de ensaios com quantidade de músicos por instrumento e funções
- Geração de PDF com relatório completo do ensaio
- Cadastro dinâmico de novos instrumentos

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- MySQL
- Tailwind CSS
- jsPDF

## Pré-requisitos

- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

## Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados MySQL

Crie o arquivo `.env.local` na raiz do projeto com:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/gestao_ensaio?schema=public"
NEXTAUTH_SECRET="seu-secret-aqui-gerado-aleatoriamente"
```

Substitua:
- `usuario`: seu usuário MySQL
- `senha`: sua senha MySQL
- `3306`: porta do MySQL (se diferente)

### 3. Criar banco de dados

Execute o script SQL para criar o banco e as tabelas:

```bash
mysql -u root -p < scripts/create-database.sql
```

### 4. Popular instrumentos padrão

Opção 1 - Via SQL:
```bash
mysql -u root -p gestao_ensaio < scripts/populate-instrumentos.sql
```

Opção 2 - Via Prisma (recomendado):
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

O script `db:seed` também criará usuários iniciais:
- **Admin**: email: `admin@congregacao.com`, senha: `admin123`
- **Instrutor**: email: `instrutor@congregacao.com`, senha: `instrutor123`

⚠️ **IMPORTANTE**: Altere as senhas após o primeiro login!

## Executar o projeto

### Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### Produção

```bash
npm run build
npm start
```

## Estrutura do Projeto

```
gestao-ensaio/
├── prisma/              # Schema do Prisma
├── scripts/             # Scripts SQL e TypeScript
├── src/
│   ├── app/             # Páginas e rotas Next.js
│   ├── components/      # Componentes React
│   ├── lib/             # Bibliotecas e utilitários
│   └── types/           # Tipos TypeScript
└── public/              # Arquivos estáticos
```

## Uso

### Login

1. Acesse http://localhost:3000
2. Faça login com as credenciais criadas

### Como Instrutor

1. Clique em "Novo Ensaio"
2. Selecione a data do ensaio
3. Informe a quantidade de músicos por instrumento
4. Adicione novos instrumentos se necessário
5. Informe a quantidade de pessoas por função
6. Salve o ensaio
7. Gere o PDF clicando em "Gerar PDF"

### Como Administrador

1. Acesse a página de relatórios
2. Filtre por data de início e fim
3. Visualize todos os ensaios
4. Gere PDFs dos relatórios

## Instrumentos Padrão

O sistema vem com 38 instrumentos pré-cadastrados, incluindo:
- Violino, Viola, Violoncelo
- Saxofone (Alto, Tenor, Barítono, etc.)
- Trompete, Trombone, Tuba
- Clarinete, Flauta, Oboé
- E muitos outros...

Novos instrumentos podem ser adicionados durante o cadastro de ensaios.

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção
- `npm run db:generate` - Gera Prisma Client
- `npm run db:push` - Sincroniza schema com banco
- `npm run db:studio` - Abre Prisma Studio
- `npm run db:seed` - Popula banco com dados iniciais

## Suporte

Para problemas ou dúvidas, verifique:
1. Se o MySQL está rodando
2. Se a string de conexão no `.env.local` está correta
3. Se todas as dependências foram instaladas
4. Se o banco de dados foi criado corretamente
