import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';
import { normalizarChaveInstrumento, normalizarNomeInstrumento } from '@/lib/instrumentos-padrao';
import { safeParseInt, sanitizeString } from '@/lib/validators';

function validarAdmin(usuario: Awaited<ReturnType<typeof obterUsuarioDaRequisicao>>) {
  if (!usuario) {
    return NextResponse.json(
      { error: 'Nao autenticado' },
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
  if (usuario.tenantId === null) return true;
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
        { error: 'ID invalido' },
        { status: 400 }
      );
    }

    const { nome } = await request.json();
    const nomeSanitizado = sanitizeString(nome, 255);
    if (!nomeSanitizado) {
      return NextResponse.json(
        { error: 'Nome do instrumento e obrigatorio' },
        { status: 400 }
      );
    }

    const instrumento = await prisma.instrumento.findUnique({
      where: { id },
      select: { id: true, nome: true, tenantId: true },
    });

    if (!instrumento) {
      return NextResponse.json(
        { error: 'Instrumento nao encontrado' },
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
        { error: 'Instrumento ja existe' },
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
        { error: 'ID invalido' },
        { status: 400 }
      );
    }

    const instrumento = await prisma.instrumento.findUnique({
      where: { id },
      select: { id: true, nome: true, tenantId: true },
    });

    if (!instrumento) {
      return NextResponse.json(
        { error: 'Instrumento nao encontrado' },
        { status: 404 }
      );
    }

    if (!adminPodeGerenciarInstrumento(usuario!, instrumento.tenantId)) {
      return NextResponse.json(
        { error: 'Acesso negado para este instrumento' },
        { status: 403 }
      );
    }

    const chave = normalizarChaveInstrumento(instrumento.nome);
    const instrumentosMesmoEscopo = await prisma.instrumento.findMany({
      where: { tenantId: instrumento.tenantId },
      select: { id: true, nome: true },
    });

    const idsMesmoNomeNormalizado = instrumentosMesmoEscopo
      .filter((item) => normalizarChaveInstrumento(item.nome) === chave)
      .map((item) => item.id);

    const referencias = await prisma.ensaioInstrumento.findMany({
      where: { instrumentoId: { in: idsMesmoNomeNormalizado } },
      select: { instrumentoId: true },
    });

    const contagemPorInstrumento = new Map<number, number>();
    referencias.forEach((referencia) => {
      contagemPorInstrumento.set(
        referencia.instrumentoId,
        (contagemPorInstrumento.get(referencia.instrumentoId) || 0) + 1
      );
    });

    const referenciasDoSolicitado = contagemPorInstrumento.get(id) || 0;
    if (referenciasDoSolicitado > 0) {
      const referenciasDetalhadas = await prisma.ensaioInstrumento.findMany({
        where: { instrumentoId: id },
        select: {
          ensaio: {
            select: {
              id: true,
              data: true,
              instrutor: {
                select: { nome: true },
              },
            },
          },
        },
      });

      const ensaiosRelacionados = referenciasDetalhadas
        .map((item) => {
          const data = item.ensaio.data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
          const instrutor = item.ensaio.instrutor?.nome || 'N/A';
          return `#${item.ensaio.id} (${data} - ${instrutor})`;
        })
        .slice(0, 10);

      const sufixoLista = ensaiosRelacionados.length > 0
        ? ` Ensaios vinculados: ${ensaiosRelacionados.join(', ')}.`
        : '';

      return NextResponse.json(
        {
          error: `Nao e possivel excluir este instrumento porque ele ja foi usado em ${referenciasDoSolicitado} ensaio(s).${sufixoLista}`,
          ensaiosRelacionados,
        },
        { status: 400 }
      );
    }

    const idsReferenciados = new Set(Array.from(contagemPorInstrumento.keys()));
    const idsParaExcluir = idsMesmoNomeNormalizado.filter((itemId) => !idsReferenciados.has(itemId));

    if (idsParaExcluir.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum instrumento elegivel para exclusao (todos possuem historico).' },
        { status: 400 }
      );
    }

    const resultado = await prisma.instrumento.deleteMany({
      where: { id: { in: idsParaExcluir } },
    });

    return NextResponse.json({ success: true, removidos: resultado.count });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Nao foi possivel excluir: instrumento vinculado a ensaios existentes.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao excluir instrumento' },
      { status: 500 }
    );
  }
}
