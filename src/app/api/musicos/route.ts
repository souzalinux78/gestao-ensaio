import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';

export async function GET(request: NextRequest) {
  try {
    const usuario = await obterUsuarioDaRequisicao(request);
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    let instrutorId = usuario.id;
    if (usuario.tipo === 'admin') {
      const instrutorIdParam = request.nextUrl.searchParams.get('instrutorId');
      if (!instrutorIdParam) {
        return NextResponse.json(
          { error: 'ID do instrutor é obrigatório' },
          { status: 400 }
        );
      }
      instrutorId = parseInt(instrutorIdParam);
    }

    const musicos = await prisma.musico.findMany({
      where: {
        instrutorId,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(musicos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome, instrutorId } = await request.json();

    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { error: 'Nome do músico é obrigatório' },
        { status: 400 }
      );
    }

    const usuario = await obterUsuarioDaRequisicao(request);
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    let instrutorIdFinal = usuario.id;
    if (usuario.tipo === 'admin') {
      instrutorIdFinal = instrutorId;
    }

    if (!instrutorIdFinal) {
      return NextResponse.json(
        { error: 'ID do instrutor é obrigatório' },
        { status: 400 }
      );
    }

    const musico = await prisma.musico.create({
      data: {
        nome: nome.trim(),
        instrutorId: instrutorIdFinal,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
