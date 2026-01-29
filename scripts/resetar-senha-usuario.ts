import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetarSenha() {
  try {
    const email = process.argv[2];
    const novaSenha = process.argv[3];

    if (!email || !novaSenha) {
      console.log('\n❌ Uso: npm run db:resetar-senha <email> <nova-senha>\n');
      console.log('Exemplo: npm run db:resetar-senha eliabe@cruzeiro.com minhasenha123\n');
      return;
    }

    console.log(`\n🔍 Buscando usuário: ${email}\n`);
    
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado!');
      console.log('\n📋 Listando todos os usuários cadastrados:\n');
      
      const todosUsuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          aprovado: true,
        },
        orderBy: {
          id: 'asc',
        },
      });
      
      if (todosUsuarios.length === 0) {
        console.log('⚠️  Nenhum usuário encontrado no banco de dados!\n');
        return;
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('ID  | Nome                    | Email                          | Tipo      | Aprovado');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      todosUsuarios.forEach((u) => {
        const id = String(u.id).padEnd(3);
        const nome = (u.nome || '').substring(0, 22).padEnd(22);
        const email = (u.email || '').substring(0, 28).padEnd(28);
        const tipo = (u.tipo || '').padEnd(9);
        const aprovado = u.aprovado ? '✅ Sim' : '❌ Não';
        console.log(`${id} | ${nome} | ${email} | ${tipo} | ${aprovado}`);
      });
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('💡 Dica: Use o email exato mostrado acima para resetar a senha.\n');
      return;
    }

    console.log(`✅ Usuário encontrado: ${usuario.nome} (${usuario.email})`);
    console.log(`\n🔐 Resetando senha...\n`);

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: senhaHash },
    });

    console.log('✅ Senha resetada com sucesso!');
    console.log(`\n📝 Credenciais atualizadas:`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Nova senha: ${novaSenha}\n`);
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetarSenha();
