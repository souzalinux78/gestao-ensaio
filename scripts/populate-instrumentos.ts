import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INSTRUMENTOS_PADRAO = [
  'Violino',
  'Violino Contralto',
  'Viola',
  'Violoncelo',
  'Flauta',
  'Flauta Contralto',
  'Flauta Baixo',
  'Clarinete',
  'Clarinete Alto',
  'Clarinete Baixo',
  'Clarinete Contra Baixo',
  'Oboé',
  'Oboé d’Amore',
  'Corne Inglês',
  'Fagote',
  'Saxofone Sopranino C',
  'Saxofone Sopranino R',
  'Saxofone Soprano Curvo',
  'Saxofone Soprano Reto',
  'Saxofone Alto',
  'Saxofone Tenor',
  'Saxofone Barítono',
  'Saxofone Baixo',
  'Pocket',
  'Cornet',
  'Trompete',
  'Flugelhorn',
  'Trompa',
  'Trombonito',
  'Barítono de Pisto',
  'Melofone',
  'Trombone',
  'Sax Horn',
  'Tuba Wagneriana',
  'Euphonium',
  'Tuba',
  'Tuba Helicon',
  'Acordeon',
  'Órgão',
];

async function popularInstrumentos() {
  console.log('Populando instrumentos padrão...');
  
  for (const nome of INSTRUMENTOS_PADRAO) {
    await prisma.instrumento.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
    console.log(`✓ ${nome}`);
  }
  
  console.log('\nInstrumentos populados com sucesso!');
}

async function main() {
  try {
    await popularInstrumentos();
    console.log('\n✅ Inicialização concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
