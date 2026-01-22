import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';

// GET - Buscar um ensaio específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const ensaio = await prisma.ensaio.findUnique({
      where: { id },
      include: {
        instrumentos: {
          include: {
            instrumento: true,
          },
        },
        musicos: {
          include: {
            musico: true,
          },
        },
        funcoes: true,
        instrutor: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!ensaio) {
      return NextResponse.json(
        { error: 'Ensaio não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(ensaio);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um ensaio
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { data, instrumentos, funcoes, totalGeral, hinosEnsaidos, regencia, musicos } = body;

    // Verificar se o ensaio existe
    const ensaioExistente = await prisma.ensaio.findUnique({
      where: { id },
      include: {
        instrutor: {
          select: {
            id: true,
          },
        },
        funcoes: true,
      },
    });

    if (!ensaioExistente) {
      return NextResponse.json(
        { error: 'Ensaio não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão (apenas o instrutor dono ou admin pode editar)
    const usuario = await obterUsuarioDaRequisicao(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (usuario.tipo !== 'admin' && usuario.id !== ensaioExistente.instrutorId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este ensaio' },
        { status: 403 }
      );
    }

    // Deletar instrumentos e funções antigas
    await prisma.ensaioInstrumento.deleteMany({
      where: { ensaioId: id },
    });

    await prisma.ensaioMusico.deleteMany({
      where: { ensaioId: id },
    });

    if (ensaioExistente.funcoes) {
      await prisma.ensaioFuncoes.delete({
        where: { ensaioId: id },
      });
    }

    const musicosSelecionados = Array.isArray(musicos) ? musicos : [];
    if (musicosSelecionados.length > 0) {
      const ids = musicosSelecionados.map((item: any) => item.musicoId);
      const total = await prisma.musico.count({
        where: {
          id: { in: ids },
          instrutorId: ensaioExistente.instrutorId,
        },
      });
      if (total !== ids.length) {
        return NextResponse.json(
          { error: 'Há músicos inválidos para este instrutor' },
          { status: 400 }
        );
      }
    }

    // Atualizar o ensaio
    const ensaio = await prisma.ensaio.update({
      where: { id },
      data: {
        data: data ? new Date(data) : undefined,
        totalGeral,
        hinosEnsaidos: hinosEnsaidos || null,
        regencia: regencia || null,
        instrumentos: {
          create: instrumentos.map((item: any) => ({
            instrumentoId: item.instrumentoId,
            quantidade: item.quantidade,
          })),
        },
        musicos: {
          create: musicosSelecionados.map((item: any) => ({
            musicoId: item.musicoId,
          })),
        },
        funcoes: {
          create: funcoes,
        },
      },
      include: {
        instrumentos: {
          include: {
            instrumento: true,
          },
        },
        musicos: {
          include: {
            musico: true,
          },
        },
        funcoes: true,
      },
    });

    return NextResponse.json(ensaio);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
