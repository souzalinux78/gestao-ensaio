import { NextResponse } from 'next/server';

// Rota de health check para diagnosticar problemas
// Não usa Prisma diretamente para evitar erros em cascata
export async function GET() {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'Next.js',
    checks: {},
  };

  // Verificar variáveis de ambiente
  health.checks.env = {
    DATABASE_URL: process.env.DATABASE_URL ? 'Configurado' : 'Nao configurado',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Configurado' : 'Nao configurado',
    NODE_ENV: process.env.NODE_ENV || 'nao definido',
  };

  // Verificar conexão com banco (com tratamento de erro robusto)
  try {
    const { prisma } = await import('@/lib/db');
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = {
      status: 'Conectado',
      message: 'Conexao com banco de dados OK',
    };
  } catch (error: any) {
    health.checks.database = {
      status: 'Erro',
      message: error.message || 'Erro desconhecido',
      errorCode: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
    health.status = 'error';
  }

  // Verificar se tabelas existem
  try {
    const { prisma } = await import('@/lib/db');
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `;
    health.checks.tables = {
      status: 'OK',
      count: Array.isArray(tables) ? tables.length : 0,
    };
  } catch (error: any) {
    health.checks.tables = {
      status: 'Erro',
      message: error.message,
    };
  }

  // Verificar se Prisma Client foi gerado
  try {
    await import('@prisma/client');
    health.checks.prisma = {
      status: 'OK',
      message: 'Prisma Client disponivel',
    };
  } catch (error: any) {
    health.checks.prisma = {
      status: 'Erro',
      message: 'Prisma Client nao gerado - Execute: npm run db:generate',
    };
  }

  const statusCode = health.status === 'ok' ? 200 : 500;

  return NextResponse.json(health, { 
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
