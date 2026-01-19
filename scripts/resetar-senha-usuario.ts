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
