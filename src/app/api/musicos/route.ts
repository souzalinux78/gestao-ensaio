import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';

export async function GET(request: NextRequest) {
  try {
    const usuario = await obterUsuarioDaRequisicao(request);
    const instrutorIdParam = request.nextUrl.searchParams.get('instrutorId');
    console.info('[GET /api/musicos] inicio', {
      instrutorIdParam,
      usuarioId: usuario?.id,
      usuarioTipo: usuario?.tipo,
    });
    if (!usuario && !instrutorIdParam) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    let instrutorId = usuario?.id;
    if (usuario?.tipo === 'admin') {
      if (!instrutorIdParam) {
        return NextResponse.json(
          { error: 'ID do instrutor é obrigatório' },
          { status: 400 }
        );
      }
      instrutorId = parseInt(instrutorIdParam);
    }

    if (!instrutorId && instrutorIdParam) {
      instrutorId = parseInt(instrutorIdParam);
    }

    if (!instrutorId) {
      return NextResponse.json(
        { error: 'ID do instrutor é obrigatório' },
        { status: 400 }
      );
    }

    const musicos = await prisma.musico.findMany({
      where: {
        instrutorId,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    console.info('[GET /api/musicos] sucesso', {
      instrutorId,
      total: musicos.length,
    });
    return NextResponse.json(musicos);
  } catch (error: any) {
    console.error('[GET /api/musicos] erro', {
      mensagem: error?.message,
      code: error?.code,
    });
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
    console.info('[POST /api/musicos] inicio', {
      instrutorIdBody: instrutorId,
      usuarioId: usuario?.id,
      usuarioTipo: usuario?.tipo,
      authHeader: request.headers.get('authorization') ? 'presente' : 'ausente',
    });
    let instrutorIdFinal = usuario?.id ?? instrutorId;
    if (usuario?.tipo === 'admin') {
      instrutorIdFinal = instrutorId;
    }

    if (!instrutorIdFinal) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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
