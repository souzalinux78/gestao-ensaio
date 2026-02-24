import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';
import { normalizarChaveInstrumento, normalizarNomeInstrumento } from '@/lib/instrumentos-padrao';
import { safeParseInt, sanitizeString } from '@/lib/validators';

function validarAdmin(usuario: Awaited<ReturnType<typeof obterUsuarioDaRequisicao>>) {
  if (!usuario) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    );
  }

  if (usuario.tipo !== 'admin') {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas admin pode editar ou excluir instrumentos.' },
      { status: 403 }
    );
  }

  return null;
}

function adminPodeGerenciarInstrumento(
  usuario: NonNullable<Awaited<ReturnType<typeof obterUsuarioDaRequisicao>>>,
  tenantIdInstrumento: number | null
) {
  // Admin global (sem tenant) pode gerenciar tudo.
  if (usuario.tenantId === null) return true;
  // Admin de tenant pode gerenciar instrumentos do próprio tenant e globais (legados/compartilhados).
  if (tenantIdInstrumento === null) return true;
  return tenantIdInstrumento === usuario.tenantId;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await obterUsuarioDaRequisicao(request);
    const erroPermissao = validarAdmin(usuario);
    if (erroPermissao) {
      return erroPermissao;
    }

    const id = safeParseInt(params.id);
    if (!id || id <= 0) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const { nome } = await request.json();
    const nomeSanitizado = sanitizeString(nome, 255);
    if (!nomeSanitizado) {
      return NextResponse.json(
        { error: 'Nome do instrumento é obrigatório' },
        { status: 400 }
      );
    }

    const instrumento = await prisma.instrumento.findUnique({
      where: { id },
      select: { id: true, nome: true, tenantId: true },
    });

    if (!instrumento) {
      return NextResponse.json(
        { error: 'Instrumento não encontrado' },
        { status: 404 }
      );
    }

    if (!adminPodeGerenciarInstrumento(usuario!, instrumento.tenantId)) {
      return NextResponse.json(
        { error: 'Acesso negado para este instrumento' },
        { status: 403 }
      );
    }

    const instrumentoAtualizado = await prisma.instrumento.update({
      where: { id },
      data: { nome: normalizarNomeInstrumento(nomeSanitizado) },
    });

    return NextResponse.json(instrumentoAtualizado);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Instrumento já existe' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar instrumento' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await obterUsuarioDaRequisicao(request);
    const erroPermissao = validarAdmin(usuario);
    if (erroPermissao) {
      return erroPermissao;
    }

    const id = safeParseInt(params.id);
    if (!id || id <= 0) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const instrumento = await prisma.instrumento.findUnique({
      where: { id },
      select: { id: true, nome: true, tenantId: true },
    });

    if (!instrumento) {
      return NextResponse.json(
        { error: 'Instrumento não encontrado' },
        { status: 404 }
      );
    }

    if (!adminPodeGerenciarInstrumento(usuario!, instrumento.tenantId)) {
      return NextResponse.json(
        { error: 'Acesso negado para este instrumento' },
        { status: 403 }
      );
    }

    // Remove também variações duplicadas no mesmo escopo (ex.: "Tuba Wagneriana" e "TUBA WAGNERIANA")
    const chave = normalizarChaveInstrumento(instrumento.nome);
    const instrumentosMesmoEscopo = await prisma.instrumento.findMany({
      where: { tenantId: instrumento.tenantId },
      select: { id: true, nome: true },
    });

    const idsParaExcluir = instrumentosMesmoEscopo
      .filter((item) => normalizarChaveInstrumento(item.nome) === chave)
      .map((item) => item.id);

    await prisma.instrumento.deleteMany({
      where: { id: { in: idsParaExcluir } },
    });

    return NextResponse.json({ success: true, removidos: idsParaExcluir.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir instrumento' },
      { status: 500 }
    );
  }
}
