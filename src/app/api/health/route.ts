import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Rota de health check para diagnosticar problemas
export async function GET() {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Verificar variáveis de ambiente
  health.checks.env = {
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Configurado' : '❌ Não configurado',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Configurado' : '❌ Não configurado',
    NODE_ENV: process.env.NODE_ENV || 'não definido',
  };

  // Verificar conexão com banco
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = {
      status: '✅ Conectado',
      message: 'Conexão com banco de dados OK',
    };
  } catch (error: any) {
    health.checks.database = {
      status: '❌ Erro',
      message: error.message,
      error: error.code,
    };
    health.status = 'error';
  }

  // Verificar se tabelas existem
  try {
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `;
    health.checks.tables = {
      status: '✅ OK',
      count: Array.isArray(tables) ? tables.length : 0,
    };
  } catch (error: any) {
    health.checks.tables = {
      status: '❌ Erro',
      message: error.message,
    };
  }

  const statusCode = health.status === 'ok' ? 200 : 500;

  return NextResponse.json(health, { status: statusCode });
}
