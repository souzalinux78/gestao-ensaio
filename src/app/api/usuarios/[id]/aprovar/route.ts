import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { aprovado } = await request.json();

    if (typeof aprovado !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo aprovado deve ser um booleano' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { aprovado },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        igreja: true,
        aprovado: true,
      },
    });

    return NextResponse.json(usuario);
  } catch (error: any) {
    console.error('[USUARIOS] Erro ao aprovar/reprovar:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
