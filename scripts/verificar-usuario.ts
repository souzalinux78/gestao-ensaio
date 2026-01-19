import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verificarUsuario() {
  try {
    const email = process.argv[2] || 'eliabe@cruzeiro.com';
    
    console.log(`\n🔍 Buscando usuário com email: ${email}\n`);
    
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado!');
      console.log('\n📋 Listando todos os usuários:\n');
      const todosUsuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          igreja: true,
        },
      });
      todosUsuarios.forEach(u => {
        console.log(`  - ${u.nome} (${u.email}) - ${u.tipo}`);
      });
      return;
    }

    console.log('✅ Usuário encontrado:');
    console.log(`   ID: ${usuario.id}`);
    console.log(`   Nome: ${usuario.nome}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Tipo: ${usuario.tipo}`);
    console.log(`   Igreja: ${usuario.igreja || 'N/A'}`);
    console.log(`   Senha hasheada: ${usuario.senha.startsWith('$2a$') || usuario.senha.startsWith('$2b$') ? '✅ Sim' : '❌ Não'}`);
    console.log(`   Tamanho do hash: ${usuario.senha.length} caracteres`);
    
    // Testar senha
    if (process.argv[3]) {
      const senhaTeste = process.argv[3];
      console.log(`\n🔐 Testando senha: "${senhaTeste}"`);
      const senhaValida = await bcrypt.compare(senhaTeste, usuario.senha);
      if (senhaValida) {
        console.log('✅ Senha válida!');
      } else {
        console.log('❌ Senha inválida!');
      }
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verificarUsuario();
