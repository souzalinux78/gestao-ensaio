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
        aprovado: true,
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
    const { nome, email, senha, tipo, igreja, aprovado } = await request.json();

    if (!nome || !email || !senha || !tipo) {
      return NextResponse.json(
        { error: 'Nome, email, senha e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    // Se for cadastro público (sem aprovado), criar como não aprovado
    // Se for admin criando, usar o valor de aprovado fornecido (ou true para admin)
    const usuarioAprovado = aprovado !== undefined ? aprovado : (tipo === 'admin' ? true : false);

    const usuario = await criarUsuario(nome, email, senha, tipo, igreja);

    // Atualizar o campo aprovado
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { aprovado: usuarioAprovado },
    });

    return NextResponse.json({
      id: usuarioAtualizado.id,
      nome: usuarioAtualizado.nome,
      email: usuarioAtualizado.email,
      tipo: usuarioAtualizado.tipo,
      igreja: usuarioAtualizado.igreja,
      aprovado: usuarioAtualizado.aprovado,
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
