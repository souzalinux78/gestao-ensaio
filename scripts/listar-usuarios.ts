import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listarUsuarios() {
  try {
    console.log('\n🔍 Buscando todos os usuários no banco...\n');
    
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        aprovado: true,
        createdAt: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (usuarios.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco!\n');
      return;
    }

    console.log(`✅ Total de usuários encontrados: ${usuarios.length}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ID  | Nome                    | Email                          | Tipo      | Aprovado');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    usuarios.forEach((u) => {
      const id = String(u.id).padEnd(3);
      const nome = (u.nome || '').substring(0, 22).padEnd(22);
      const email = (u.email || '').substring(0, 28).padEnd(28);
      const tipo = (u.tipo || '').padEnd(9);
      const aprovado = u.aprovado ? '✅ Sim' : '❌ Não';
      console.log(`${id} | ${nome} | ${email} | ${tipo} | ${aprovado}`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Mostrar emails exatos para facilitar cópia
    console.log('📧 Emails exatos no banco:');
    usuarios.forEach((u) => {
      console.log(`   - "${u.email}" (${u.nome || 'Sem nome'})`);
    });
    console.log('');
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

listarUsuarios();
