import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { criarUsuario } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: {
        nome: 'asc',
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        igreja: true,
        createdAt: true,
      },
    });
    return NextResponse.json(usuarios);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha, tipo, igreja } = await request.json();

    if (!nome || !email || !senha || !tipo) {
      return NextResponse.json(
        { error: 'Nome, email, senha e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    const usuario = await criarUsuario(nome, email, senha, tipo, igreja);

    return NextResponse.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      igreja: usuario.igreja,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
