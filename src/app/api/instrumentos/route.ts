import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const instrumentos = await prisma.instrumento.findMany({
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

    const instrumento = await prisma.instrumento.create({
      data: { nome: nome.trim() },
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
