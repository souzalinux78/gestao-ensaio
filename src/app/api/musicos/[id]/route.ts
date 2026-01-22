import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { nome } = await request.json();

    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { error: 'Nome do músico é obrigatório' },
        { status: 400 }
      );
    }

    const musicoExistente = await prisma.musico.findUnique({
      where: { id },
    });

    if (!musicoExistente) {
      return NextResponse.json(
        { error: 'Músico não encontrado' },
        { status: 404 }
      );
    }

    const usuario = await obterUsuarioDaRequisicao(request);
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (usuario.tipo !== 'admin' && musicoExistente.instrutorId !== usuario.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este músico' },
        { status: 403 }
      );
    }

    const musico = await prisma.musico.update({
      where: { id },
      data: {
        nome: nome.trim(),
      },
    });

    return NextResponse.json(musico);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Músico já existe' },
        { status: 400 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Músico não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const musicoExistente = await prisma.musico.findUnique({
      where: { id },
    });

    if (!musicoExistente) {
      return NextResponse.json(
        { error: 'Músico não encontrado' },
        { status: 404 }
      );
    }

    const usuario = await obterUsuarioDaRequisicao(request);
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (usuario.tipo !== 'admin' && musicoExistente.instrutorId !== usuario.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este músico' },
        { status: 403 }
      );
    }

    await prisma.musico.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Músico não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
