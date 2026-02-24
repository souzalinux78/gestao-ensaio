import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INSTRUMENTOS_PADRAO = [
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
  'OBOÉ D\'AMORE',
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
];

async function popularInstrumentos() {
  console.log('Populando instrumentos padrão...');
  
  // Tentar obter tenant padrão (sistema-padrao)
  let tenantId: number | null = null;
  
  try {
    const tenantPadrao = await prisma.tenant.findUnique({
      where: { slug: 'sistema-padrao' },
    });
    
    if (tenantPadrao) {
      tenantId = tenantPadrao.id;
      console.log(`Usando tenant: ${tenantPadrao.nome} (ID: ${tenantPadrao.id})`);
    } else {
      // Tentar usar tenant ID 1 como fallback
      const tenant1 = await prisma.tenant.findUnique({
        where: { id: 1 },
      });
      if (tenant1) {
        tenantId = tenant1.id;
        console.log(`Usando tenant ID 1: ${tenant1.nome}`);
      } else {
        console.log('⚠️  Nenhum tenant encontrado. Criando instrumentos sem tenant (null)...');
      }
    }
  } catch (error) {
    console.log('⚠️  Erro ao buscar tenant. Criando instrumentos sem tenant (null)...');
  }
  
  let criados = 0;
  let jaExistem = 0;
  let erros = 0;
  
  for (const nome of INSTRUMENTOS_PADRAO) {
    try {
      if (tenantId !== null) {
        // Com tenant: usar upsert
        await prisma.instrumento.upsert({
          where: {
            tenantId_nome: {
              tenantId: tenantId,
              nome: nome,
            },
          },
          update: {
            nome: nome, // Atualizar nome caso já exista
          },
          create: {
            nome,
            tenantId: tenantId,
          },
        });
        console.log(`✓ ${nome}`);
        criados++;
      } else {
        // Sem tenant: tentar criar diretamente
        try {
          await prisma.instrumento.create({
            data: {
              nome,
              tenantId: null,
            },
          });
          console.log(`✓ ${nome}`);
          criados++;
        } catch (err: any) {
          if (err.code === 'P2002') {
            console.log(`→ ${nome} (já existe)`);
            jaExistem++;
          } else {
            throw err;
          }
        }
      }
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`→ ${nome} (já existe)`);
        jaExistem++;
      } else {
        console.error(`✗ ${nome}: ${error.message}`);
        erros++;
      }
    }
  }
  
  console.log(`\n✅ Instrumentos processados:`);
  console.log(`   Criados: ${criados}`);
  console.log(`   Já existiam: ${jaExistem}`);
  if (erros > 0) {
    console.log(`   Erros: ${erros}`);
  }
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
