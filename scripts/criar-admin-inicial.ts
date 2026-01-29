import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function criarAdminInicial() {
  try {
    console.log('\n🔍 Verificando se já existe usuário admin...\n');
    
    // Verificar se já existe admin
    const adminExistente = await prisma.usuario.findFirst({
      where: { tipo: 'admin' },
    });
    
    if (adminExistente) {
      console.log('✅ Já existe um usuário admin no banco:');
      console.log(`   Nome: ${adminExistente.nome}`);
      console.log(`   Email: ${adminExistente.email}`);
      console.log(`   ID: ${adminExistente.id}\n`);
      return;
    }
    
    console.log('⚠️  Nenhum admin encontrado. Criando usuário admin inicial...\n');
    
    // Verificar se existe tenant padrão
    let tenantId = null;
    const tenantPadrao = await prisma.tenant.findFirst({
      where: { slug: 'default' },
    });
    
    if (tenantPadrao) {
      tenantId = tenantPadrao.id;
      console.log(`✅ Tenant padrão encontrado (ID: ${tenantId})\n`);
    } else {
      console.log('⚠️  Tenant padrão não encontrado. Criando...\n');
      const novoTenant = await prisma.tenant.create({
        data: {
          nome: 'Tenant Padrão',
          slug: 'default',
          ativo: true,
        },
      });
      tenantId = novoTenant.id;
      console.log(`✅ Tenant padrão criado (ID: ${tenantId})\n`);
    }
    
    // Dados do admin inicial
    const emailAdmin = process.argv[2] || 'admin@gestaoensaio.com';
    const senhaAdmin = process.argv[3] || 'Admin123456';
    const nomeAdmin = process.argv[4] || 'Administrador';
    
    console.log('📝 Criando usuário admin com os seguintes dados:');
    console.log(`   Nome: ${nomeAdmin}`);
    console.log(`   Email: ${emailAdmin}`);
    console.log(`   Senha: ${senhaAdmin}`);
    console.log(`   Tenant ID: ${tenantId}\n`);
    
    // Hash da senha
    const senhaHash = await bcrypt.hash(senhaAdmin, 10);
    
    // Criar admin
    const admin = await prisma.usuario.create({
      data: {
        nome: nomeAdmin,
        email: emailAdmin.toLowerCase().trim(),
        senha: senhaHash,
        tipo: 'admin',
        aprovado: true, // Admin sempre aprovado
        tenantId: tenantId,
      },
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ USUÁRIO ADMIN CRIADO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Nome: ${admin.nome}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Tipo: ${admin.tipo}`);
    console.log(`   Aprovado: ${admin.aprovado ? '✅ Sim' : '❌ Não'}`);
    console.log(`   Tenant ID: ${admin.tenantId || 'N/A'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔐 CREDENCIAIS DE ACESSO:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Senha: ${senhaAdmin}\n`);
    console.log('💡 Você pode fazer login com essas credenciais agora!\n');
    
  } catch (error: any) {
    console.error('\n❌ ERRO ao criar admin:', error.message);
    
    if (error.code === 'P2002') {
      console.error('\n⚠️  Erro: Já existe um usuário com este email!\n');
    } else {
      console.error(error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

criarAdminInicial();
