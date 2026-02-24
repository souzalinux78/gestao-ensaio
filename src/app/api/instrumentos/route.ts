import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';
import { resolveTenantFromRequest } from '@/lib/middleware';
import { sanitizeString } from '@/lib/validators';
import {
  INSTRUMENTOS_PADRAO,
  normalizarChaveInstrumento,
  normalizarNomeInstrumento,
} from '@/lib/instrumentos-padrao';

const TIPOS_QUE_PODEM_ADICIONAR = new Set(['admin', 'instrutor', 'encarregado']);

function deduplicarPorNomeComPreferenciaTenant<T extends { nome: string; tenantId: number | null }>(
  instrumentos: T[],
  tenantId: number | null
) {
  const nomesPadrao = new Set(INSTRUMENTOS_PADRAO.map((nome) => normalizarNomeInstrumento(nome)));
  const porNome = new Map<string, T>();

  const ordenadosPorPrioridade = [...instrumentos].sort((a, b) => {
    const prioridade = (item: T) => {
      if (tenantId !== null && item.tenantId === tenantId) return 0;
      if (nomesPadrao.has(normalizarNomeInstrumento(item.nome))) return 1;
      return 2;
    };

    const pa = prioridade(a);
    const pb = prioridade(b);
    if (pa !== pb) return pa - pb;
    return a.nome.localeCompare(b.nome, 'pt-BR');
  });

  for (const instrumento of ordenadosPorPrioridade) {
    const chave = normalizarChaveInstrumento(instrumento.nome);
    const atual = porNome.get(chave);

    if (!atual) {
      porNome.set(chave, instrumento);
      continue;
    }

    // Se houver instrumento específico do tenant, ele tem prioridade sobre o global.
    if (tenantId !== null && instrumento.tenantId === tenantId && atual.tenantId !== tenantId) {
      porNome.set(chave, instrumento);
    }
  }

  return Array.from(porNome.values()).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export async function GET(request: NextRequest) {
  const tenantId = await resolveTenantFromRequest(request);
  const where = tenantId === null
    ? { tenantId: null as number | null }
    : { OR: [{ tenantId }, { tenantId: null as number | null }] };

  const instrumentos = await prisma.instrumento.findMany({
    where,
    orderBy: {
      nome: 'asc',
    },
  });

  return NextResponse.json(deduplicarPorNomeComPreferenciaTenant(instrumentos, tenantId));
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

    if (!TIPOS_QUE_PODEM_ADICIONAR.has(usuario.tipo)) {
      return NextResponse.json(
        { error: 'Acesso negado. Você não tem permissão para adicionar instrumentos.' },
        { status: 403 }
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

    const nomeFinal = normalizarNomeInstrumento(nomeSanitizado);
    const tenantIdFinal = usuario.tenantId ?? null;

    const instrumentosMesmoEscopo = await prisma.instrumento.findMany({
      where: tenantIdFinal === null
        ? { tenantId: null }
        : {
            OR: [
              { tenantId: tenantIdFinal },
              { tenantId: null },
            ],
          },
      select: { id: true, nome: true },
    });

    const chaveNovoNome = normalizarChaveInstrumento(nomeFinal);
    const existente = instrumentosMesmoEscopo.find(
      (item) => normalizarChaveInstrumento(item.nome) === chaveNovoNome
    );

    if (existente) {
      return NextResponse.json(
        { error: 'Instrumento já existe' },
        { status: 400 }
      );
    }

    const instrumento = await prisma.instrumento.create({
      data: {
        nome: nomeFinal,
        tenantId: tenantIdFinal,
      },
    });

    return NextResponse.json(instrumento);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Instrumento já existe' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
