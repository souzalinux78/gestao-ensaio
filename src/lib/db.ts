import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Verificar se DATABASE_URL está configurado (apenas em produção)
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('❌ ERRO: DATABASE_URL não está configurado no arquivo .env');
  // Não lançar erro aqui para evitar crash, apenas logar
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Testar conexão ao inicializar (apenas logar, não bloquear)
if (process.env.DATABASE_URL) {
  prisma.$connect()
    .then(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Conectado ao banco de dados MySQL');
      }
    })
    .catch((error) => {
      console.error('❌ Erro ao conectar ao banco de dados:', error.message);
      console.error('Verifique se:');
      console.error('  1. O MySQL está rodando');
      console.error('  2. A DATABASE_URL está correta no .env');
      console.error('  3. O banco de dados existe');
      console.error('  4. O usuário tem permissões');
      // Não lançar erro para permitir que a aplicação inicie
    });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
