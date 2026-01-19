import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ensaio, Instrumento } from '@/types';

export function gerarPDFEnsaio(ensaio: Ensaio, instrumentos: Instrumento[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  doc.setFontSize(18);
  doc.text('Relatório de Ensaio', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(12);
  const dataFormatada = format(new Date(ensaio.data), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
  doc.text(`Data: ${dataFormatada}`, margin, yPos);
  yPos += 15;

  // Separar instrumentos: Órgão vs outros
  const orgaoItem = ensaio.instrumentos.find(
    (item) => instrumentos.find((i) => i.id === item.instrumentoId)?.nome === 'Órgão'
  );
  const outrosInstrumentos = ensaio.instrumentos.filter(
    (item) => instrumentos.find((i) => i.id === item.instrumentoId)?.nome !== 'Órgão'
  );

  // Organistas (ANTES de Músicos)
  if (orgaoItem) {
    doc.setFontSize(14);
    doc.text('Organistas:', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.text(`Organistas: ${orgaoItem.quantidade}`, margin + 10, yPos);
    yPos += 7;

    yPos += 5;
    doc.setFontSize(12);
    doc.text(`Total de Organistas: ${orgaoItem.quantidade}`, margin, yPos);
    yPos += 15;
  }

  // Músicos
  doc.setFontSize(14);
  doc.text('Músicos:', margin, yPos);
  yPos += 8;

  doc.setFontSize(11);
  let totalMusicos = 0;
  outrosInstrumentos.forEach((item) => {
    const instrumento = instrumentos.find((i) => i.id === item.instrumentoId);
    if (instrumento) {
      doc.text(`${instrumento.nome}: ${item.quantidade}`, margin + 10, yPos);
      totalMusicos += item.quantidade;
      yPos += 7;
    }
  });

  // Adicionar instrutores, encarregados locais e regionais (não contam no total)
  if (ensaio.funcoes) {
    if (ensaio.funcoes.instrutores > 0) {
      doc.text(`Instrutores: ${ensaio.funcoes.instrutores}`, margin + 10, yPos);
      yPos += 7;
    }
    if (ensaio.funcoes.encarregadosLocais > 0) {
      doc.text(`Encarregados Locais: ${ensaio.funcoes.encarregadosLocais}`, margin + 10, yPos);
      yPos += 7;
    }
    if (ensaio.funcoes.encarregadosRegionais > 0) {
      doc.text(`Encarregados Regionais: ${ensaio.funcoes.encarregadosRegionais}`, margin + 10, yPos);
      yPos += 7;
    }
  }

  yPos += 5;
  doc.setFontSize(12);
  doc.text(`Total de Músicos: ${totalMusicos}`, margin, yPos);
  yPos += 15;

  if (ensaio.funcoes) {
    const totalMinisterio = 
      ensaio.funcoes.ancioes +
      ensaio.funcoes.diaconos +
      ensaio.funcoes.cooperadorOficio +
      ensaio.funcoes.cooperadorJovens;

    if (totalMinisterio > 0) {
      doc.setFontSize(14);
      doc.text('Ministério:', margin, yPos);
      yPos += 8;

      doc.setFontSize(11);
      const ministerio = [
        { label: 'Anciões', valor: ensaio.funcoes.ancioes },
        { label: 'Diáconos', valor: ensaio.funcoes.diaconos },
        { label: 'Cooperador de Ofício', valor: ensaio.funcoes.cooperadorOficio },
        { label: 'Cooperador de Jovens', valor: ensaio.funcoes.cooperadorJovens },
      ];

      ministerio.forEach((item) => {
        if (item.valor > 0) {
          doc.text(`${item.label}: ${item.valor}`, margin + 10, yPos);
          yPos += 7;
        }
      });

      yPos += 5;
      doc.setFontSize(12);
      doc.text(`Total de Ministério: ${totalMinisterio}`, margin, yPos);
      yPos += 10;
    }
  }

  // Hinos Ensaiados
  if (ensaio.hinosEnsaidos) {
    const hinosArray = ensaio.hinosEnsaidos
      .split(',')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);
    const totalHinos = hinosArray.length;

    if (totalHinos > 0) {
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Hinos Ensaiados:', margin, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.text(hinosArray.join(', '), margin + 10, yPos);
      yPos += 7;

      yPos += 5;
      doc.setFontSize(12);
      doc.text(`Total de Hinos: ${totalHinos}`, margin, yPos);
      yPos += 10;
    }
  }

  // Regência
  if (ensaio.regencia) {
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Regência:', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    const regenciaLinhas = ensaio.regencia.split('\n').filter((l) => l.trim().length > 0);
    regenciaLinhas.forEach((linha) => {
      doc.text(linha.trim(), margin + 10, yPos);
      yPos += 7;
    });
    yPos += 5;
  }

  // Total geral = Músicos + Organistas (sem ministério)
  const totalOrganistas = orgaoItem ? orgaoItem.quantidade : 0;
  const totalGeral = totalMusicos + totalOrganistas;

  yPos += 10;
  doc.setFontSize(14);
  doc.text(`Total Geral: ${totalGeral}`, margin, yPos, {
    align: 'left',
  });

  return doc;
}
