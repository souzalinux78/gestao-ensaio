export const INSTRUMENTOS_PADRAO = [
  // Cordas
  'VIOLINO',
  'VIOLINO CONTRALTO',
  'VIOLA',
  'VIOLONCELO',
  // Madeiras
  'FLAUTA',
  'FLAUTA CONTRALTO',
  'FLAUTA BAIXO',
  'CLARINETE',
  'CLARINETE ALTO',
  'CLARINETE BAIXO',
  'CLARINETE CONTRA BAIXO',
  'OBOÉ',
  "OBOÉ D'AMORE",
  'CORNE INGLÊS',
  'FAGOTE',
  'SAXOFONE SOPRANINO C',
  'SAXOFONE SOPRANINO R',
  'SAXOFONE SOPRANO CUR',
  'SAXOFONE SOPRANO RET',
  'SAXOFONE ALTO',
  'SAXOFONE TENOR',
  'SAXOFONE BARÍTONO',
  'SAXOFONE BAIXO',
  // Metais
  'POCKET',
  'CORNET',
  'TROMPETE',
  'FLUGELHORN',
  'TROMPA',
  'TROMBONITO',
  'BARÍTONO DE PISTO',
  'MELOFONE',
  'TROMBONE',
  'SAX HORN',
  'TUBA WAGNERIANA',
  'EUPHONIUM',
  'TUBA',
  // Teclas
  'ACORDEON',
  'ORGANISTA',
] as const;

export function normalizarNomeInstrumento(nome: string): string {
  return nome.trim().replace(/\s+/g, ' ').toUpperCase();
}

export function normalizarChaveInstrumento(nome: string): string {
  const base = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

  if (base === 'ORGAO') {
    return 'ORGANISTA';
  }
  if (base === 'SAXOFONE SOPRANIRO C') {
    return 'SAXOFONE SOPRANINO C';
  }
  if (base === 'SAXOFONE SOPRANIRO R') {
    return 'SAXOFONE SOPRANINO R';
  }

  return base;
}
