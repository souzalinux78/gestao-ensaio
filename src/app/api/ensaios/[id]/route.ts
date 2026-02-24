import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';
import { resolveTenantFromRequest } from '@/lib/middleware';
import { safeParseInt } from '@/lib/validators';

// GET - Buscar um ensaio específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = safeParseInt(params.id);
    if (!id || id <= 0) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar autorização
    const usuario = await obterUsuarioDaRequisicao(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId ?? null;

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

    // ISOLAMENTO: Verificar se ensaio pertence ao mesmo tenant
    if (tenantIdFinal !== null && ensaio.tenantId !== tenantIdFinal) {
      return NextResponse.json(
        { error: 'Ensaio não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se usuário tem permissão (admin ou dono do ensaio)
    if (usuario.tipo !== 'admin' && usuario.id !== ensaio.instrutorId) {
      return NextResponse.json(
        { error: 'Você não tem permissão para visualizar este ensaio' },
        { status: 403 }
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
    const id = safeParseInt(params.id);
    if (!id || id <= 0) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
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
      musicos,
    } = body;

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId ?? null;

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

    // ISOLAMENTO: Verificar se ensaio pertence ao mesmo tenant
    if (tenantIdFinal !== null && ensaioExistente.tenantId !== tenantIdFinal) {
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

    const musicosSelecionados = Array.isArray(musicos) ? musicos : [];
    
    // Validar musicos primeiro (antes de deletar)
    let totalMusicos = 0;
    if (musicosSelecionados.length > 0) {
      const ids = musicosSelecionados.map((item: any) => item.musicoId);
      totalMusicos = await prisma.musico.count({
        where: {
          id: { in: ids },
          instrutorId: ensaioExistente.instrutorId,
          ...(tenantIdFinal !== null ? { tenantId: tenantIdFinal } : {}), // ISOLAMENTO quando tenant estiver definido
        },
      });
      if (totalMusicos !== ids.length) {
        return NextResponse.json(
          { error: 'Há músicos inválidos para este instrutor' },
          { status: 400 }
        );
      }
    }

    // Deletar dados antigos em paralelo
    const deletePromises: Promise<any>[] = [
      prisma.ensaioInstrumento.deleteMany({ where: { ensaioId: id } }),
      prisma.ensaioMusico.deleteMany({ where: { ensaioId: id } }),
    ];
    
    if (ensaioExistente.funcoes) {
      deletePromises.push(
        prisma.ensaioFuncoes.delete({ where: { ensaioId: id } })
      );
    }

    await Promise.all(deletePromises);

    // Atualizar o ensaio
    const ensaio = await prisma.ensaio.update({
      where: { id },
      data: {
        data: data ? new Date(data) : undefined,
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
