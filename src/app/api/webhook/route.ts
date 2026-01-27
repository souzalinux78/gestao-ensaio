import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Ensaio, Instrumento } from '@/types';
import { safeParseInt } from '@/lib/validators';
import { getConfig } from '@/lib/config-cache';

export async function POST(request: NextRequest) {
  try {
    const { ensaioId } = await request.json();

    if (!ensaioId) {
      return NextResponse.json(
        { error: 'ID do ensaio é obrigatório' },
        { status: 400 }
      );
    }

    const ensaioIdNum = safeParseInt(ensaioId);
    if (!ensaioIdNum || ensaioIdNum <= 0) {
      return NextResponse.json(
        { error: 'ID do ensaio inválido' },
        { status: 400 }
      );
    }

    // Buscar configurações e dados do ensaio em paralelo
    const [config, ensaio] = await Promise.all([
      getConfig(),
      prisma.ensaio.findUnique({
        where: { id: ensaioIdNum },
        include: {
          instrumentos: {
            include: {
              instrumento: true,
            },
          },
          funcoes: true,
          instrutor: {
            select: {
              nome: true,
            },
          },
        },
      }),
    ]);

    if (!config || !config.webhook) {
      return NextResponse.json(
        { error: 'Webhook não configurado' },
        { status: 400 }
      );
    }

    if (!ensaio) {
      return NextResponse.json(
        { error: 'Ensaio não encontrado' },
        { status: 404 }
      );
    }

    // Buscar contatos apenas do instrutor do ensaio
    const contatos = await prisma.contato.findMany({
      where: {
        usuarioId: ensaio.instrutorId,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    // Separar instrumentos: Órgão vs outros
    const orgaoItem = ensaio.instrumentos.find((item) => item.instrumento.nome === 'Órgão');
    const outrosInstrumentos = ensaio.instrumentos.filter(
      (item) => item.instrumento.nome !== 'Órgão'
    );

    // Calcular totais
    const totalMusicos = outrosInstrumentos.reduce(
      (sum, item) => sum + item.quantidade,
      0
    );
    const totalOrganistas = orgaoItem ? orgaoItem.quantidade : 0;

    // Instrutores, encarregados locais e regionais (aparecem na lista mas NÃO contam nos totais)
    const instrutoresCount = ensaio.funcoes?.instrutores || 0;
    const encarregadosLocaisCount = ensaio.funcoes?.encarregadosLocais || 0;
    const encarregadosRegionaisCount = ensaio.funcoes?.encarregadosRegionais || 0;

    // Calcular apenas ministério (sem instrutores, encarregados locais e regionais)
    const totalMinisterio = ensaio.funcoes
      ? ensaio.funcoes.ancioes +
        ensaio.funcoes.diaconos +
        ensaio.funcoes.cooperadorOficio +
        ensaio.funcoes.cooperadorJovens
      : 0;

    // Total geral = Músicos + Organistas (SEM ministério)
    const totalGeralCalculado = totalMusicos + totalOrganistas;

    // Formatar data
    const dataFormatada = new Date(ensaio.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const dataFormatadaCompleta = new Date(ensaio.data).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    // Formatação para WhatsApp - Músicos (sem Órgão)
    // WhatsApp usa *texto* para negrito (não **texto**)
    const musicosWhatsApp = [
      ...outrosInstrumentos.map((item) => `*${item.instrumento.nome}*: ${item.quantidade}`),
      instrutoresCount > 0 && `*Instrutores*: ${instrutoresCount}`,
      encarregadosLocaisCount > 0 && `*Encarregados Locais*: ${encarregadosLocaisCount}`,
      encarregadosRegionaisCount > 0 && `*Encarregados Regionais*: ${encarregadosRegionaisCount}`,
    ]
      .filter(Boolean)
      .join('\n');

    // Formatação para WhatsApp - Organistas
    const organistasWhatsApp = orgaoItem
      ? `*Organistas*: ${orgaoItem.quantidade}`
      : '';

    const ministerioWhatsApp = ensaio.funcoes
      ? [
          ensaio.funcoes.ancioes > 0 && `*Anciões*: ${ensaio.funcoes.ancioes}`,
          ensaio.funcoes.diaconos > 0 && `*Diáconos*: ${ensaio.funcoes.diaconos}`,
          ensaio.funcoes.cooperadorOficio > 0 &&
            `*Cooperador de Ofício*: ${ensaio.funcoes.cooperadorOficio}`,
          ensaio.funcoes.cooperadorJovens > 0 &&
            `*Cooperador de Jovens*: ${ensaio.funcoes.cooperadorJovens}`,
        ]
          .filter(Boolean)
          .join('\n')
      : '';

    // Processar hinos ensaiados
    const hinosEnsaidos = ensaio.hinosEnsaidos || '';
    const hinosArray = hinosEnsaidos
      .split(',')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);
    const totalHinos = hinosArray.length;
    const hinosFormatados = hinosArray.join(', ');

    // Processar regência
    const regencia = ensaio.regencia || '';
    const regenciaFormatada = regencia
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join('\n');

    // Formatar lista de músicos com bullet points
    const musicosLista = [
      ...outrosInstrumentos.map((item) => `• ${item.instrumento.nome}: ${item.quantidade}`),
      ...(instrutoresCount > 0 ? [`• Instrutores: ${instrutoresCount}`] : []),
      ...(encarregadosLocaisCount > 0 ? [`• Encarregados Locais: ${encarregadosLocaisCount}`] : []),
      ...(encarregadosRegionaisCount > 0 ? [`• Encarregados Regionais: ${encarregadosRegionaisCount}`] : [])
    ].join('\n');

    // Formatar lista de ministério com bullet points
    const ministerioLista = ensaio.funcoes
      ? [
          ensaio.funcoes.ancioes > 0 && `• Anciões: ${ensaio.funcoes.ancioes}`,
          ensaio.funcoes.diaconos > 0 && `• Diáconos: ${ensaio.funcoes.diaconos}`,
          ensaio.funcoes.cooperadorOficio > 0 && `• Cooperador de Ofício: ${ensaio.funcoes.cooperadorOficio}`,
          ensaio.funcoes.cooperadorJovens > 0 && `• Cooperador de Jovens: ${ensaio.funcoes.cooperadorJovens}`,
        ]
          .filter(Boolean)
          .join('\n')
      : '';

    // Formatar hinos com separador
    const hinosFormatadosLista = hinosArray.length > 0
      ? `• ${hinosArray.join(' | ')}`
      : '';

    // Formatar regência com bullet points
    const regenciaLista = regenciaFormatada
      .split('\n')
      .filter((l) => l.trim().length > 0)
      .map((l) => `• ${l.trim()}`)
      .join('\n');

    // Mensagem completa formatada para WhatsApp no formato solicitado
    let mensagemWhatsApp = `🎵 RELATÓRIO DE ENSAIO

📅 Data: ${dataFormatadaCompleta}
👤 Instrutor: ${ensaio.instrutor.nome}

━━━━━━━━━━━━━━━━━━

`;

    // Organistas
    if (totalOrganistas > 0) {
      mensagemWhatsApp += `🎹 ORGANISTAS
• Quantidade: ${totalOrganistas}

━━━━━━━━━━━━━━━━━━

`;
    }

    // Músicos
    mensagemWhatsApp += `🎼 MÚSICOS
${musicosLista}

📊 Total de Músicos: ${totalMusicos}

━━━━━━━━━━━━━━━━━━

`;

    // Ministério
    if (totalMinisterio > 0) {
      mensagemWhatsApp += `👥 MINISTÉRIO
${ministerioLista}

📊 Total do Ministério: ${totalMinisterio}

━━━━━━━━━━━━━━━━━━

`;
    }

    // Hinos Ensaiados
    if (hinosArray.length > 0) {
      mensagemWhatsApp += `🎵 HINOS ENSAIADOS
${hinosFormatadosLista}

📊 Total de Hinos: ${totalHinos}

━━━━━━━━━━━━━━━━━━

`;
    }

    // Regência
    if (regenciaLista) {
      mensagemWhatsApp += `🎼 REGÊNCIA
${regenciaLista}

━━━━━━━━━━━━━━━━━━

`;
    }

    // Total Geral
    mensagemWhatsApp += `📈 TOTAL GERAL DE PARTICIPANTES: ${totalGeralCalculado}

━━━━━━━━━━━━━━━━━━`;

    // Preparar dados formatados para enviar no webhook
    const dadosWebhook = {
      contatos: contatos.map((contato) => ({
        nome: contato.nome,
        telefone: contato.telefone,
      })),
      ensaio: {
        id: ensaio.id,
        data: {
          original: ensaio.data,
          formatada: dataFormatada,
          formatadaCompleta: dataFormatadaCompleta,
        },
        instrutor: ensaio.instrutor.nome,
        musicos: {
          lista: [
            ...outrosInstrumentos.map((item) => ({
              nome: item.instrumento.nome,
              quantidade: item.quantidade,
            })),
            instrutoresCount > 0 && {
              nome: 'Instrutores',
              quantidade: instrutoresCount,
            },
            encarregadosLocaisCount > 0 && {
              nome: 'Encarregados Locais',
              quantidade: encarregadosLocaisCount,
            },
            encarregadosRegionaisCount > 0 && {
              nome: 'Encarregados Regionais',
              quantidade: encarregadosRegionaisCount,
            },
          ].filter(Boolean),
          total: totalMusicos,
          resumo: [
            ...outrosInstrumentos.map((item) => `${item.instrumento.nome}: ${item.quantidade}`),
            instrutoresCount > 0 && `Instrutores: ${instrutoresCount}`,
            encarregadosLocaisCount > 0 && `Encarregados Locais: ${encarregadosLocaisCount}`,
            encarregadosRegionaisCount > 0 && `Encarregados Regionais: ${encarregadosRegionaisCount}`,
          ]
            .filter(Boolean)
            .join(', '),
          whatsapp: musicosWhatsApp,
        },
        organistas: orgaoItem
          ? {
              lista: [
                {
                  nome: 'Organistas',
                  quantidade: orgaoItem.quantidade,
                },
              ],
              total: totalOrganistas,
              resumo: `Organistas: ${orgaoItem.quantidade}`,
              whatsapp: organistasWhatsApp,
            }
          : null,
        ministerio: ensaio.funcoes
          ? {
              lista: {
                ancioes: ensaio.funcoes.ancioes,
                diaconos: ensaio.funcoes.diaconos,
                cooperadorOficio: ensaio.funcoes.cooperadorOficio,
                cooperadorJovens: ensaio.funcoes.cooperadorJovens,
              },
              total: totalMinisterio,
              resumo: [
                ensaio.funcoes.ancioes > 0 && `Anciões: ${ensaio.funcoes.ancioes}`,
                ensaio.funcoes.diaconos > 0 && `Diáconos: ${ensaio.funcoes.diaconos}`,
                ensaio.funcoes.cooperadorOficio > 0 &&
                  `Cooperador de Ofício: ${ensaio.funcoes.cooperadorOficio}`,
                ensaio.funcoes.cooperadorJovens > 0 &&
                  `Cooperador de Jovens: ${ensaio.funcoes.cooperadorJovens}`,
              ]
                .filter(Boolean)
                .join(', '),
              whatsapp: ministerioWhatsApp,
            }
          : null,
        hinosEnsaidos: hinosEnsaidos
          ? {
              lista: hinosArray,
              formatado: hinosFormatados,
              total: totalHinos,
            }
          : null,
        regencia: regencia
          ? {
              texto: regenciaFormatada,
              linhas: regenciaFormatada.split('\n'),
            }
          : null,
        totais: {
          musicos: totalMusicos,
          organistas: totalOrganistas,
          ministerio: totalMinisterio,
          hinos: totalHinos,
          geral: totalGeralCalculado,
        },
        mensagemWhatsApp: mensagemWhatsApp,
      },
      timestamp: new Date().toISOString(),
      dataEnvio: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Enviar para o webhook
    const response = await fetch(config.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosWebhook),
    });

    if (!response.ok) {
      throw new Error(`Webhook retornou status ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Dados enviados para o webhook com sucesso',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar webhook' },
      { status: 500 }
    );
  }
}
