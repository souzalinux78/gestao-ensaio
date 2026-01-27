import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';
import { resolveTenantFromRequest } from '@/lib/middleware';
import { safeParseInt, sanitizeString } from '@/lib/validators';

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

    const { nome, telefone } = await request.json();

    // Validar e sanitizar entrada
    const nomeSanitizado = sanitizeString(nome, 255);
    const telefoneSanitizado = sanitizeString(telefone, 20);

    if (!nomeSanitizado || !telefoneSanitizado) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios e devem ser válidos' },
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

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão

    // ISOLAMENTO: Verificar se contato pertence ao mesmo tenant
    if (contatoExistente.tenantId !== tenantIdFinal) {
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
        nome: nomeSanitizado,
        telefone: telefoneSanitizado,
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
    const id = safeParseInt(params.id);
    if (!id || id <= 0) {
      return NextResponse.json(
        { error: 'ID inválido' },
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

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão

    // ISOLAMENTO: Verificar se contato pertence ao mesmo tenant
    if (contatoExistente.tenantId !== tenantIdFinal) {
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
