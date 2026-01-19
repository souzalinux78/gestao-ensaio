import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';

export async function GET(request: NextRequest) {
  try {
    // Obter usuário da sessão (via query param ou header)
    const usuarioIdParam = request.nextUrl.searchParams.get('usuarioId');
    let usuarioId: number | null = null;

    if (usuarioIdParam) {
      usuarioId = parseInt(usuarioIdParam);
    } else {
      // Tentar obter da requisição
      const usuario = await obterUsuarioDaRequisicao(request);
      if (usuario) {
        usuarioId = usuario.id;
      }
    }

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const contatos = await prisma.contato.findMany({
      where: {
        usuarioId: usuarioId,
      },
      orderBy: {
        nome: 'asc',
      },
    });
    return NextResponse.json(contatos);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome, telefone, usuarioId } = await request.json();

    if (!nome || !telefone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    // Se não veio usuarioId no body, tentar obter da sessão
    let usuarioIdFinal = usuarioId;
    if (!usuarioIdFinal) {
      const usuario = await obterUsuarioDaRequisicao(request);
      if (usuario) {
        usuarioIdFinal = usuario.id;
      }
    }

    if (!usuarioIdFinal) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const contato = await prisma.contato.create({
      data: {
        nome: nome.trim(),
        telefone: telefone.trim(),
        usuarioId: usuarioIdFinal,
      },
    });

    return NextResponse.json(contato);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
