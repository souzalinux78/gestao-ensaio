import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { resolveTenantFromRequest } from '@/lib/middleware';
import { safeParseInt } from '@/lib/validators';
import { notificarAprovacao } from '@/lib/webhook-notifications';

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

    const { aprovado } = await request.json();

    if (typeof aprovado !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo aprovado deve ser um booleano' },
        { status: 400 }
      );
    }

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão

    // Verificar se usuário existe e pertence ao mesmo tenant
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
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

    // Buscar dados completos antes de atualizar para notificação
    const usuarioAntes = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        igreja: true,
        aprovado: true,
        tenantId: true,
      },
    });

    if (!usuarioAntes) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { aprovado },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        igreja: true,
        aprovado: true,
      },
    });

    // Enviar notificação ao usuário se foi aprovado (mudou de false para true)
    if (aprovado && !usuarioAntes.aprovado) {
      await notificarAprovacao(
        {
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
        },
        usuarioAntes.tenantId
      );
    }

    return NextResponse.json(usuario);
  } catch (error: any) {
    console.error('[USUARIOS] Erro ao aprovar/reprovar:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
