import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const INSTRUMENTOS_PADRAO = [
  'Acordeon',
  'Barítono de Pisto',
  'Clarinete',
  'Clarinete Alto',
  'Clarinete Baixo',
  'Clarinete Contra Baixo',
  'Corne Inglês',
  'Cornet',
  'Euphonium',
  'Fagote',
  'Flauta',
  'Flauta Baixo',
  'Flauta Contralto',
  'Flugelhorn',
  'Melofone',
  'Oboé',
  'Oboé D\'amore',
  'Pocket',
  'Sax Horn',
  'Saxofone Alto',
  'Saxofone Baixo',
  'Saxofone Barítono',
  'Saxofone Sopraniro C',
  'Saxofone Sopraniro R',
  'Saxofone Soprano Cur',
  'Saxofone Soprano Ret',
  'Saxofone Tenor',
  'Trombone',
  'Trombonito',
  'Trompa',
  'Trompete',
  'Tuba',
  'Tuba Helicon',
  'Tuba Wagneriana',
  'Viola',
  'Violino',
  'Violino Contralto',
  'Violoncelo',
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

async function criarUsuariosIniciais() {
  console.log('\nCriando usuários iniciais...');
  
  const senhaAdmin = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@congregacao.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@congregacao.com',
      senha: senhaAdmin,
      tipo: 'admin',
      igreja: null,
    },
  });
  console.log('✓ Usuário admin criado (email: admin@congregacao.com, senha: admin123)');
  
  const senhaInstrutor = await bcrypt.hash('instrutor123', 10);
  await prisma.usuario.upsert({
    where: { email: 'instrutor@congregacao.com' },
    update: {},
    create: {
      nome: 'Instrutor',
      email: 'instrutor@congregacao.com',
      senha: senhaInstrutor,
      tipo: 'instrutor',
      igreja: null,
    },
  });
  console.log('✓ Usuário instrutor criado (email: instrutor@congregacao.com, senha: instrutor123)');
}

async function main() {
  try {
    await popularInstrumentos();
    await criarUsuariosIniciais();
    console.log('\n✅ Inicialização concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
