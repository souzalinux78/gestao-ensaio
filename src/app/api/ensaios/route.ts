import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dataInicio = searchParams.get('dataInicio');
  const dataFim = searchParams.get('dataFim');
  const instrutorId = searchParams.get('instrutorId');
  const igreja = searchParams.get('igreja');

  const where: any = {};
  
  // Se for instrutor, filtrar apenas seus ensaios
  if (instrutorId) {
    where.instrutorId = parseInt(instrutorId);
  }
  
  if (dataInicio || dataFim) {
    where.data = {};
    if (dataInicio) {
      where.data.gte = new Date(dataInicio);
    }
    if (dataFim) {
      where.data.lte = new Date(dataFim);
    }
  }

  // Filtrar por igreja (através do instrutor)
  if (igreja && igreja.trim() !== '') {
    where.instrutor = {
      igreja: {
        contains: igreja.trim(),
      },
    };
  }

  const ensaios = await prisma.ensaio.findMany({
    where,
    include: {
      instrumentos: {
        include: {
          instrumento: true,
        },
      },
      funcoes: true,
      instrutor: {
        select: {
          id: true,
          nome: true,
          igreja: true,
        },
      },
    },
    orderBy: {
      data: 'desc',
    },
  });

  return NextResponse.json(ensaios);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, instrumentos, funcoes, totalGeral, hinosEnsaidos, regencia, instrutorId } = body;

    // Usar instrutorId do body ou tentar obter da sessão
    let instrutorIdFinal = instrutorId;

    if (!instrutorIdFinal) {
      const usuario = await obterUsuarioDaRequisicao(request);
      if (usuario && usuario.tipo === 'instrutor') {
        instrutorIdFinal = usuario.id;
      }
    }

    if (!instrutorIdFinal) {
      return NextResponse.json(
        { error: 'ID do instrutor é obrigatório' },
        { status: 400 }
      );
    }

    const instrutor = await prisma.usuario.findUnique({
      where: { id: instrutorIdFinal },
    });

    if (!instrutor) {
      return NextResponse.json(
        { error: 'Instrutor não encontrado' },
        { status: 404 }
      );
    }

    const ensaio = await prisma.ensaio.create({
      data: {
        data: new Date(data),
        instrutorId: instrutorIdFinal,
        totalGeral,
        hinosEnsaidos: hinosEnsaidos || null,
        regencia: regencia || null,
        instrumentos: {
          create: instrumentos.map((item: any) => ({
            instrumentoId: item.instrumentoId,
            quantidade: item.quantidade,
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
