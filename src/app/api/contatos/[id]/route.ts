import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { nome, telefone } = await request.json();

    if (!nome || !telefone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o contato existe e pertence ao usuário
    const contatoExistente = await prisma.contato.findUnique({
      where: { id },
    });

    if (!contatoExistente) {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem permissão (é o dono do contato)
    const usuario = await obterUsuarioDaRequisicao(request);
    if (usuario && usuario.tipo !== 'admin' && contatoExistente.usuarioId !== usuario.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este contato' },
        { status: 403 }
      );
    }

    const contato = await prisma.contato.update({
      where: { id },
      data: {
        nome: nome.trim(),
        telefone: telefone.trim(),
      },
    });

    return NextResponse.json(contato);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Verificar se o contato existe e pertence ao usuário
    const contatoExistente = await prisma.contato.findUnique({
      where: { id },
    });

    if (!contatoExistente) {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem permissão (é o dono do contato)
    const usuario = await obterUsuarioDaRequisicao(request);
    if (usuario && usuario.tipo !== 'admin' && contatoExistente.usuarioId !== usuario.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este contato' },
        { status: 403 }
      );
    }

    await prisma.contato.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
