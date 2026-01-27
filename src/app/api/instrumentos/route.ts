import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { resolveTenantFromRequest } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  // Obter tenantId para isolamento
  const tenantId = await resolveTenantFromRequest(request);
  const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão

  const instrumentos = await prisma.instrumento.findMany({
    where: {
      tenantId: tenantIdFinal, // ISOLAMENTO: filtrar por tenant (ou null para instrumentos globais)
    },
    orderBy: {
      nome: 'asc',
    },
  });
  return NextResponse.json(instrumentos);
}

export async function POST(request: NextRequest) {
  try {
    const { nome } = await request.json();

    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { error: 'Nome do instrumento é obrigatório' },
        { status: 400 }
      );
    }

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão

    const instrumento = await prisma.instrumento.create({
      data: { 
        nome: nome.trim(),
        tenantId: tenantIdFinal, // ISOLAMENTO: associar ao tenant
      },
    });

    return NextResponse.json(instrumento);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Instrumento já existe' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
