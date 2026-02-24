import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';
import { resolveTenantFromRequest } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dataInicio = searchParams.get('dataInicio');
  const dataFim = searchParams.get('dataFim');
  const instrutorId = searchParams.get('instrutorId');
  const igreja = searchParams.get('igreja');

  // Obter usuário da requisição para verificar se é admin
  const usuario = await obterUsuarioDaRequisicao(request);
  
  // Obter tenantId para isolamento de dados
  const tenantId = await resolveTenantFromRequest(request);
  const tenantIdFinal = tenantId ?? null;

  const where: any = tenantIdFinal !== null
    ? { tenantId: tenantIdFinal } // ISOLAMENTO: filtrar por tenant quando houver tenant resolvido
    : {};
  
  // Se for instrutor (não admin), filtrar apenas seus ensaios
  // Admin pode ver todos os ensaios (a menos que especifique instrutorId)
  if (usuario && usuario.tipo === 'instrutor' && !instrutorId) {
    where.instrutorId = usuario.id;
  } else if (instrutorId) {
    const instrutorIdNum = parseInt(instrutorId);
    if (isNaN(instrutorIdNum) || instrutorIdNum <= 0) {
      return NextResponse.json(
        { error: 'ID do instrutor inválido' },
        { status: 400 }
      );
    }
    where.instrutorId = instrutorIdNum;
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

  // Paginação
  const page = parseInt(searchParams.get('page') || '1');
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 20; // Max 100, default 20
  const skip = (page - 1) * limit;

  // Buscar ensaios e total em paralelo
  const [ensaios, total] = await Promise.all([
    prisma.ensaio.findMany({
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
      skip,
      take: limit,
    }),
    prisma.ensaio.count({ where }),
  ]);

  // Se não há parâmetros de paginação, retornar formato antigo (compatibilidade)
  const hasPagination = searchParams.has('page') || searchParams.has('limit');
  
  if (hasPagination) {
    return NextResponse.json({
      data: ensaios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
  
  // Formato antigo (compatibilidade)
  return NextResponse.json(ensaios);
}

export async function POST(request: NextRequest) {
  try {
    const usuario = await obterUsuarioDaRequisicao(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      data,
      instrumentos,
      funcoes,
      totalGeral,
      hinosEnsaidos,
      regencia,
      atendimento1Nome,
      atendimento1Tipo,
      atendimento2Nome,
      atendimento2Tipo,
      instrutorId,
      musicos,
    } = body;

    // Usar instrutorId do body ou tentar obter da sessão
    let instrutorIdFinal: number | string | undefined = instrutorId;

    if (!instrutorIdFinal) {
      instrutorIdFinal = usuario.id;
    }

    if (!instrutorIdFinal) {
      return NextResponse.json(
        { error: 'ID do instrutor é obrigatório' },
        { status: 400 }
      );
    }

    const instrutorIdNumerico = Number(instrutorIdFinal);
    if (!Number.isInteger(instrutorIdNumerico) || instrutorIdNumerico <= 0) {
      return NextResponse.json(
        { error: 'ID do instrutor inválido' },
        { status: 400 }
      );
    }

    const musicosSelecionados = Array.isArray(musicos) ? musicos : [];
    
    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId ?? null;
    
    // Validar instrutor e musicos em paralelo
    const [instrutor, totalMusicos] = await Promise.all([
      prisma.usuario.findUnique({
        where: { id: instrutorIdNumerico },
      }),
      musicosSelecionados.length > 0
        ? prisma.musico.count({
            where: {
              id: { in: musicosSelecionados.map((item: any) => item.musicoId) },
              instrutorId: instrutorIdNumerico,
              ...(tenantIdFinal !== null ? { tenantId: tenantIdFinal } : {}), // ISOLAMENTO quando tenant estiver definido
            },
          })
        : Promise.resolve(0),
    ]);

    if (!instrutor) {
      return NextResponse.json(
        { error: 'Instrutor não encontrado' },
        { status: 404 }
      );
    }

    // ISOLAMENTO: Verificar se instrutor pertence ao mesmo tenant
    if (tenantIdFinal !== null && instrutor.tenantId !== tenantIdFinal) {
      return NextResponse.json(
        { error: 'Instrutor não encontrado' },
        { status: 404 }
      );
    }

    if (musicosSelecionados.length > 0 && totalMusicos !== musicosSelecionados.length) {
      return NextResponse.json(
        { error: 'Há músicos inválidos para este instrutor' },
        { status: 400 }
      );
    }

    const ensaio = await prisma.ensaio.create({
      data: {
        data: new Date(data),
        instrutorId: instrutorIdNumerico,
        tenantId: tenantIdFinal, // ISOLAMENTO: associar ao tenant quando existir
        totalGeral,
        hinosEnsaidos: hinosEnsaidos || null,
        regencia: regencia || null,
        atendimento1Nome: atendimento1Nome || null,
        atendimento1Tipo: atendimento1Tipo || null,
        atendimento2Nome: atendimento2Nome || null,
        atendimento2Tipo: atendimento2Tipo || null,
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
