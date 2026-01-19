import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Verificar se o modelo existe
    if (!prisma.configuracoes) {
      return NextResponse.json(
        { error: 'Prisma Client não foi regenerado. Execute: npm run db:generate' },
        { status: 500 }
      );
    }

    // Buscar ou criar configuração (sempre teremos apenas uma)
    let config = await prisma.configuracoes.findFirst();
    
    if (!config) {
      config = await prisma.configuracoes.create({
        data: {
          webhook: null,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Erro na API de configurações:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao carregar configurações',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { webhook } = await request.json();

    // Buscar configuração existente ou criar nova
    let config = await prisma.configuracoes.findFirst();

    if (config) {
      // Atualizar configuração existente
      config = await prisma.configuracoes.update({
        where: { id: config.id },
        data: {
          webhook: webhook || null,
        },
      });
    } else {
      // Criar nova configuração
      config = await prisma.configuracoes.create({
        data: {
          webhook: webhook || null,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
