import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';
import { resolveTenantFromRequest } from '@/lib/middleware';
import { safeParseInt, sanitizeString } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    // Obter usuário da sessão (via query param ou header)
    const usuarioIdParam = request.nextUrl.searchParams.get('usuarioId');
    let usuarioId: number | null = null;

    if (usuarioIdParam) {
      usuarioId = safeParseInt(usuarioIdParam);
      if (!usuarioId || usuarioId <= 0) {
        return NextResponse.json(
          { error: 'ID do usuário inválido' },
          { status: 400 }
        );
      }
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

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão

    const contatos = await prisma.contato.findMany({
      where: {
        usuarioId: usuarioId,
        tenantId: tenantIdFinal, // ISOLAMENTO: filtrar por tenant
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

    // Validar e sanitizar entrada
    const nomeSanitizado = sanitizeString(nome, 255);
    const telefoneSanitizado = sanitizeString(telefone, 20);

    if (!nomeSanitizado || !telefoneSanitizado) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios e devem ser válidos' },
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

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão

    // Validar se usuário pertence ao mesmo tenant
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: usuarioIdFinal },
      select: { id: true, tenantId: true },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // ISOLAMENTO: Verificar se usuário pertence ao mesmo tenant
    if (usuarioExistente.tenantId !== tenantIdFinal) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const contato = await prisma.contato.create({
      data: {
        nome: nomeSanitizado,
        telefone: telefoneSanitizado,
        usuarioId: usuarioIdFinal,
        tenantId: tenantIdFinal, // ISOLAMENTO: associar ao tenant
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
