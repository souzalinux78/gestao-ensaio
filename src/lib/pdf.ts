import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ensaio, Instrumento } from '@/types';

type LinhaInstrumento = {
  label: string;
  aliases: string[];
};

function normalizar(valor?: string | null) {
  if (!valor) return '';
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function upperSemAcento(valor?: string | null) {
  if (!valor) return '';
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

function removerPrefixoBairro(valor: string) {
  return valor
    .replace(/^BAIRRO DO\s+/i, '')
    .replace(/^BAIRRO DA\s+/i, '')
    .replace(/^BAIRRO DE\s+/i, '')
    .trim();
}

function extrairCidadeLocalidade(igreja?: string | null) {
  if (!igreja) {
    return { cidade: 'SEM CIDADE', localidade: 'GERAL' };
  }

  const partes = igreja
    .split('-')
    .map((parte) => parte.trim())
    .filter(Boolean);

  if (partes.length >= 2) {
    const localidade = upperSemAcento(removerPrefixoBairro(partes[0]));
    const cidade = upperSemAcento(partes[1]);
    return {
      cidade: cidade || 'SEM CIDADE',
      localidade: localidade || 'GERAL',
    };
  }

  const partesVirgula = igreja
    .split(',')
    .map((parte) => parte.trim())
    .filter(Boolean);

  if (partesVirgula.length >= 2) {
    return {
      cidade: upperSemAcento(partesVirgula[1]) || 'SEM CIDADE',
      localidade: upperSemAcento(removerPrefixoBairro(partesVirgula[0])) || 'GERAL',
    };
  }

  return {
    cidade: 'SEM CIDADE',
    localidade: upperSemAcento(removerPrefixoBairro(igreja)) || 'GERAL',
  };
}

function extrairNomesAtendimento(ensaio: Ensaio) {
  const linhas = (ensaio.regencia || '')
    .split('\n')
    .map((linha) => linha.trim())
    .filter(Boolean);

  const anciao = upperSemAcento(linhas[0]) || 'NAO INFORMADO';
  const local = upperSemAcento(linhas[1]) || upperSemAcento(ensaio.instrutor?.nome) || 'NAO INFORMADO';

  return { anciao, local };
}

type TipoAtendimento =
  | 'ancioes'
  | 'diaconos'
  | 'cooperadorOficio'
  | 'cooperadorJovens'
  | 'encarregadosLocais'
  | 'encarregadosRegionais'
  | 'instrutores'
  | 'examinadora';

type RegenciaLinhaPDF = {
  tipoLabel: string;
  linha: string;
};
type AtendimentoPDF = {
  esquerdaTipo: string;
  esquerdaNome: string;
  direitaTipo: string;
  direitaNomes: string[];
};
function labelTipoAtendimento(tipo?: string | null) {
  switch (tipo) {
    case 'ancioes':
      return 'Ancião';
    case 'diaconos':
      return 'Diácono';
    case 'cooperadorOficio':
      return 'Coop. Ofício';
    case 'cooperadorJovens':
      return 'Coop. Jovens';
    case 'encarregadosLocais':
      return 'Local';
    case 'encarregadosRegionais':
      return 'Regional';
    case 'instrutores':
      return 'Instrutor';
    case 'examinadora':
      return 'Examinadora';
    default:
      return '';
  }
}
function normalizarTipoAtendimentoPorTexto(tipoTexto?: string | null): TipoAtendimento | null {
  const texto = upperSemAcento(tipoTexto);
  if (!texto) return null;
  if (texto.includes('ANCIAO')) return 'ancioes';
  if (texto.includes('DIACONO')) return 'diaconos';
  if (texto.includes('OFICIO')) return 'cooperadorOficio';
  if (texto.includes('JOVENS')) return 'cooperadorJovens';
  if (texto.includes('LOCAL')) return 'encarregadosLocais';
  if (texto.includes('REGIONAL')) return 'encarregadosRegionais';
  if (texto.includes('INSTRUTOR')) return 'instrutores';
  if (texto.includes('EXAMINADORA')) return 'examinadora';
  return null;
}
function parseLinhaRegenciaAtendimento(linhaOriginal: string): RegenciaLinhaPDF | null {
  const linha = linhaOriginal.trim();
  if (!linha) return null;
  const partes = linha
    .split('-')
    .map((parte) => parte.trim())
    .filter(Boolean);
  if (partes.length >= 2 && partes[1]) {
    const tipoNormalizado = normalizarTipoAtendimentoPorTexto(partes[0]);
    const tipoLabel = labelTipoAtendimento(tipoNormalizado) || upperSemAcento(partes[0]) || 'Regência';
    const nome = upperSemAcento(partes[1]);
    const localidade = upperSemAcento(partes.slice(2).join(' - '));
    return {
      tipoLabel,
      linha: [tipoLabel, nome, localidade].filter(Boolean).join(' - '),
    };
  }
  return {
    linha: upperSemAcento(linha.replace(/^\d+\s*[-.]?\s*/i, '')),
    tipoLabel: 'Regência',
  };
}
function montarAtendimentoPDF(ensaio: Ensaio): AtendimentoPDF {
  const { anciao } = extrairNomesAtendimento(ensaio);
  const regentes = (ensaio.regencia || '')
    .split('\n')
    .map((linha) => parseLinhaRegenciaAtendimento(linha))
    .filter((item): item is RegenciaLinhaPDF => Boolean(item && item.linha));
  const esquerdaTipo = labelTipoAtendimento(ensaio.atendimento1Tipo) || 'Ancião';
  const esquerdaNome = upperSemAcento(ensaio.atendimento1Nome) || anciao || 'NAO INFORMADO';
  if (regentes.length === 1) {
    return {
      esquerdaTipo,
      esquerdaNome,
      direitaTipo: 'Regência',
      direitaNomes: [regentes[0].linha || 'NAO INFORMADO'],
    };
  }
  if (regentes.length >= 2) {
    return {
      esquerdaTipo,
      esquerdaNome,
      direitaTipo: 'Regência',
      direitaNomes: regentes.slice(0, 2).map((item) => item.linha || 'NAO INFORMADO'),
    };
  }
  return {
    esquerdaTipo,
    esquerdaNome,
    direitaTipo: labelTipoAtendimento(ensaio.atendimento2Tipo) || 'Local',
    direitaNomes: [upperSemAcento(ensaio.atendimento2Nome) || upperSemAcento(ensaio.instrutor?.nome) || 'NAO INFORMADO'],
  };
}

const CORDAS: LinhaInstrumento[] = [
  { label: 'Violino', aliases: ['VIOLINO'] },
  { label: 'Viola', aliases: ['VIOLA'] },
  { label: 'Violoncello', aliases: ['VIOLONCELO', 'VIOLONCELLO'] },
];

const MADEIRAS: LinhaInstrumento[] = [
  { label: 'Flauta', aliases: ['FLAUTA'] },
  { label: 'Flauta Alto', aliases: ['FLAUTAALTO', 'FLAUTACONTRALTO'] },
  { label: 'Flauta Baixo', aliases: ['FLAUTABAIXO'] },
  { label: 'Oboe', aliases: ['OBOE'] },
  { label: "Oboe D'Amore", aliases: ['OBOEDAMORE'] },
  { label: 'Corne Ingles', aliases: ['CORNEINGLES', 'CORNOINGLES'] },
  { label: 'Fagote', aliases: ['FAGOTE'] },
  { label: 'Contra-Fagote', aliases: ['CONTRAFAGOTE', 'FAGOTECONTRABAIXO'] },
  { label: 'Clarinete', aliases: ['CLARINETE'] },
  { label: 'Clarinete Alto', aliases: ['CLARINETEALTO'] },
  { label: 'Clarinete Contra-Alto', aliases: ['CLARINETECONTRAALTO'] },
  { label: 'Clarinete Baixo', aliases: ['CLARINETEBAIXO'] },
  { label: 'Clarinete Contra-Baixo', aliases: ['CLARINETECONTRABAIXO'] },
  { label: 'Saxofone Soprano Cur', aliases: ['SAXOFONESOPRANOCUR', 'SAXOFONESOPRANOCURVO'] },
  { label: 'Saxofone Soprano Ret', aliases: ['SAXOFONESOPRANORET', 'SAXOFONESOPRANORETO', 'SAXOFONESOPRANO'] },
  { label: 'Saxofone Alto', aliases: ['SAXOFONEALTO'] },
  { label: 'Saxofone Tenor', aliases: ['SAXOFONETENOR'] },
  { label: 'Saxofone Baritono', aliases: ['SAXOFONEBARITONO'] },
  { label: 'Saxofone Baixo', aliases: ['SAXOFONEBAIXO'] },
  { label: 'Acordeon', aliases: ['ACORDEON'] },
];

const METAIS: LinhaInstrumento[] = [
  { label: 'Trompete', aliases: ['TROMPETE'] },
  { label: 'Cornet', aliases: ['CORNET'] },
  { label: 'Pocket', aliases: ['POCKET'] },
  { label: 'Flugel Horn', aliases: ['FLUGELHORN'] },
  { label: 'Trompa', aliases: ['TROMPA'] },
  { label: 'Trombonito', aliases: ['TROMBONITO'] },
  { label: 'Trombone', aliases: ['TROMBONE'] },
  { label: 'Baritono De Pisto', aliases: ['BARITONODEPISTO'] },
  { label: 'Sax Horn / Genes', aliases: ['SAXHORN', 'GENES'] },
  { label: 'Bombardino / Euphonio', aliases: ['BOMBARDINO', 'EUPHONIUM'] },
  { label: 'Tuba', aliases: ['TUBA'] },
];

const ALIASES_ORGANISTA = ['ORGANISTA', 'ORGAO'];

async function carregarLogoPDFDataUrl() {
  if (typeof window === 'undefined') return null;
  try {
    const resposta = await fetch('/logo-pdf.png', { cache: 'no-store' });
    if (!resposta.ok) return null;
    const blob = await resposta.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return dataUrl;
  } catch {
    return null;
  }
}

export async function gerarPDFEnsaio(ensaio: Ensaio, instrumentos: Instrumento[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const mapaNomeInstrumento = new Map<number, string>();
  instrumentos.forEach((instrumento) => {
    mapaNomeInstrumento.set(instrumento.id, instrumento.nome);
  });

  const contagem = new Map<string, number>();
  for (const item of ensaio.instrumentos || []) {
    const nome = item.instrumento?.nome || mapaNomeInstrumento.get(item.instrumentoId);
    const chave = normalizar(nome);
    if (!chave) continue;
    contagem.set(chave, (contagem.get(chave) || 0) + (item.quantidade || 0));
  }

  const somaAliases = (aliases: string[]) => {
    const aliasesUnicos = Array.from(
      new Set(aliases.map((alias) => normalizar(alias)).filter(Boolean))
    );
    return aliasesUnicos.reduce((total, aliasNormalizado) => total + (contagem.get(aliasNormalizado) || 0), 0);
  };

  const linhasCordas = CORDAS.map((linha) => ({ ...linha, qtd: somaAliases(linha.aliases) }));
  const linhasMadeiras = MADEIRAS.map((linha) => ({ ...linha, qtd: somaAliases(linha.aliases) }));
  const linhasMetais = METAIS.map((linha) => ({ ...linha, qtd: somaAliases(linha.aliases) }));

  const totalCordas = linhasCordas.reduce((total, item) => total + item.qtd, 0);
  const totalMadeiras = linhasMadeiras.reduce((total, item) => total + item.qtd, 0);
  const totalMetais = linhasMetais.reduce((total, item) => total + item.qtd, 0);
  const totalMusicos = totalCordas + totalMadeiras + totalMetais;
  const totalOrganistas = somaAliases(ALIASES_ORGANISTA);
  const totalHinosEnsaiados = (ensaio.hinosEnsaidos || '')
    .split(/[,\n;]+/)
    .map((hino) => hino.trim())
    .filter(Boolean).length;
  const totalGeral = totalMusicos + totalOrganistas;

  const percentual = (valor: number) => {
    if (totalMusicos <= 0) return '0%';
    return `${Math.round((valor / totalMusicos) * 100)}%`;
  };

  const { cidade, localidade } = extrairCidadeLocalidade(ensaio.instrutor?.igreja);
  const cidadeLocalidadeTexto = `${cidade} - ${localidade}`;
  const atendimento = montarAtendimentoPDF(ensaio);
  const dataCurta = format(new Date(ensaio.data), 'dd/MM/yy', { locale: ptBR });

  const drawCentered = (text: string, y: number, size: number, bold = true) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.text(text, 297.64, y, { align: 'center' });
  };

  const drawCount = (valor: number, x: number, y: number, size = 9) => {
    if (valor <= 0) return;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    doc.text(String(valor), x, y);
  };

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);

  const logoDataUrl = await carregarLogoPDFDataUrl();
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 55.56, 42.5, 78.89, 40);
    } catch {
      // Ignorar falhas de imagem para nao quebrar geracao do PDF
    }
  }

  // Bloco cabecalho
  doc.rect(50, 40, 500, 45);
  doc.line(140, 40, 140, 85);
  doc.line(140, 55, 550, 55);
  doc.line(400, 55, 400, 85);
  drawCentered('SECRETARIA DA M\u00daSICA - ATIBAIA', 51.18, 10, true);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(cidadeLocalidadeTexto, 145, 71.62);
  doc.setFontSize(11);
  doc.text(dataCurta, 453.59, 70.9);

  // Atendimento
  doc.rect(50, 95, 500, 36);
  doc.line(50, 105, 550, 105);
  drawCentered('ATENDIMENTO', 102.03, 7, true);
  doc.line(95, 105, 95, 131);
  doc.line(330, 105, 330, 131);
  doc.line(380, 105, 380, 131);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(atendimento.esquerdaTipo, 52, 115.0);
  doc.text(atendimento.esquerdaNome, 100, 115.0);
  doc.text(atendimento.direitaTipo, 335, 114.0);
  doc.text(atendimento.direitaNomes[0] || 'NAO INFORMADO', 385, 114.0);
  if (atendimento.direitaNomes[1]) {
    doc.text(atendimento.direitaNomes[1], 385, 124.0);
  }

  // Participacao ministerio
  doc.rect(50, 141, 500, 65);
  doc.line(50, 151, 550, 151);
  drawCentered('PARTICIPA\u00c7\u00c3O MINIST\u00c9RIO', 148.03, 7, true);
  doc.line(300, 151, 300, 206);

  const ministerioEsquerda = [
    { label: 'Anci\u00e3o', valor: ensaio.funcoes?.ancioes ?? 0 },
    { label: 'Di\u00e1cono', valor: ensaio.funcoes?.diaconos ?? 0 },
    { label: 'Coop. Of\u00edcio Ministerial', valor: ensaio.funcoes?.cooperadorOficio ?? 0 },
    { label: 'Coop. Jovens e Menores', valor: ensaio.funcoes?.cooperadorJovens ?? 0 },
  ];
  const ministerioDireita = [
    { label: 'Encarregado Regional', valor: ensaio.funcoes?.encarregadosRegionais ?? 0 },
    { label: 'Examinadora', valor: ensaio.funcoes?.examinadora ?? 0 },
    { label: 'Encarregado Local', valor: ensaio.funcoes?.encarregadosLocais ?? 0 },
    { label: 'Instrutor', valor: ensaio.funcoes?.instrutores ?? 0 },
  ];

  for (let i = 0; i < 4; i += 1) {
    const y = 151 + i * 13.5;
    doc.rect(50, y, 35, 13.5);
    doc.rect(300, y, 35, 13.5);

    drawCount(ministerioEsquerda[i].valor, 64.998, 160.462 + i * 13.5);
    drawCount(ministerioDireita[i].valor, 314.998, 160.462 + i * 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(ministerioEsquerda[i].label, 90, 159.744 + i * 13.5);
    doc.text(ministerioDireita[i].label, 340, 159.744 + i * 13.5);
  }

  // Participacao musicos
  const linhasTabela = [...linhasCordas, ...linhasMadeiras, ...linhasMetais];
  const yTabelaTopo = 216;
  const yTabelaCabecalho = 226;
  const alturaLinhaTabela = 12.7;
  const yTabelaBase = 658.7;

  doc.rect(50, yTabelaTopo, 500, yTabelaBase - yTabelaTopo);
  doc.line(50, yTabelaCabecalho, 550, yTabelaCabecalho);
  drawCentered('PARTICIPA\u00c7\u00c3O M\u00daSICOS', 223.03, 7, true);
  doc.line(85, yTabelaCabecalho, 85, yTabelaBase);
  doc.line(330, yTabelaCabecalho, 330, yTabelaBase);
  doc.line(390, yTabelaCabecalho, 390, yTabelaBase);

  linhasTabela.forEach((linha, index) => {
    const y = yTabelaCabecalho + index * alturaLinhaTabela;
    doc.rect(50, y, 35, alturaLinhaTabela);
    doc.rect(85, y, 245, alturaLinhaTabela);
    drawCount(linha.qtd, 64.998, 234.462 + index * alturaLinhaTabela);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(linha.label, 90, 234.103 + index * alturaLinhaTabela);
  });

  const grupos = [
    { label: 'CORDAS', total: totalCordas, inicio: 0, quantidade: linhasCordas.length },
    { label: 'MADEIRAS', total: totalMadeiras, inicio: linhasCordas.length, quantidade: linhasMadeiras.length },
    { label: 'METAIS', total: totalMetais, inicio: linhasCordas.length + linhasMadeiras.length, quantidade: linhasMetais.length },
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  grupos.forEach((grupo) => {
    if (grupo.quantidade <= 0) return;
    const yCentro = yTabelaCabecalho + ((grupo.inicio + (grupo.quantidade - 1) / 2) * alturaLinhaTabela) + 8.1;
    doc.text(percentual(grupo.total), 349.995, yCentro);
    doc.text(grupo.label, 420, yCentro);
  });

  // Totais
  const yTotaisTopo = yTabelaBase + 10.3;
  const yTotaisCabecalho = yTotaisTopo + 10;
  doc.rect(50, yTotaisTopo, 500, 57);
  doc.line(50, yTotaisCabecalho, 550, yTotaisCabecalho);
  drawCentered('TOTAIS DE M\u00daSICOS, ORGANISTAS E HINOS ENSAIADOS', yTotaisTopo + 7.03, 7, true);
  doc.line(125, yTotaisCabecalho, 125, yTotaisTopo + 57);

  doc.rect(50, yTotaisCabecalho, 75, 11.6);
  doc.rect(50, yTotaisCabecalho + 11.6, 75, 11.6);
  doc.rect(50, yTotaisCabecalho + 23.2, 75, 11.6);
  doc.rect(50, yTotaisCabecalho + 34.8, 75, 12.2);

  doc.setTextColor(204, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(String(totalOrganistas), 84.72, yTotaisCabecalho + 8.68);
  doc.text(String(totalMusicos), 84.72, yTotaisCabecalho + 20.28);
  doc.text(String(totalHinosEnsaiados), 84.72, yTotaisCabecalho + 31.88);
  doc.setFontSize(11);
  doc.text(String(totalGeral), 84.442, yTotaisCabecalho + 44.598);
  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Organista', 130, yTotaisCabecalho + 8.68);
  doc.text('M\u00fasico', 130, yTotaisCabecalho + 20.28);
  doc.text('Hinos Ensaiados', 130, yTotaisCabecalho + 31.88);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL GERAL', 130, yTotaisCabecalho + 44.598);

  return doc;
}

