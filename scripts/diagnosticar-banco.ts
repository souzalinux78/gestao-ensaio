import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticarBanco() {
  try {
    console.log('\n🔍 DIAGNÓSTICO DO BANCO DE DADOS\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão com o banco...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');
    
    // 2. Contar registros em cada tabela
    console.log('2️⃣ Contando registros em cada tabela...\n');
    
    const [usuariosCount, ensaiosCount, instrumentosCount, musicosCount, contatosCount, tenantsCount, configsCount] = await Promise.all([
      prisma.usuario.count().catch(() => 0),
      prisma.ensaio.count().catch(() => 0),
      prisma.instrumento.count().catch(() => 0),
      prisma.musico.count().catch(() => 0),
      prisma.contato.count().catch(() => 0),
      prisma.tenant.count().catch(() => 0),
      prisma.configuracao.count().catch(() => 0),
    ]);
    
    console.log(`   📊 Usuários:        ${usuariosCount}`);
    console.log(`   📊 Ensaios:        ${ensaiosCount}`);
    console.log(`   📊 Instrumentos:   ${instrumentosCount}`);
    console.log(`   📊 Músicos:        ${musicosCount}`);
    console.log(`   📊 Contatos:       ${contatosCount}`);
    console.log(`   📊 Tenants:        ${tenantsCount}`);
    console.log(`   📊 Configurações:  ${configsCount}\n`);
    
    // 3. Verificar estrutura da tabela Usuario
    console.log('3️⃣ Verificando estrutura da tabela Usuario...\n');
    
    try {
      // Tentar buscar qualquer usuário (mesmo que não exista)
      const primeiroUsuario = await prisma.usuario.findFirst({
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          createdAt: true,
        },
      });
      
      if (primeiroUsuario) {
        console.log('✅ Tabela Usuario existe e tem estrutura correta');
        console.log(`   Primeiro usuário encontrado: ${primeiroUsuario.nome} (${primeiroUsuario.email})\n`);
      } else {
        console.log('⚠️  Tabela Usuario existe mas está vazia\n');
      }
    } catch (error: any) {
      console.log(`❌ Erro ao acessar tabela Usuario: ${error.message}\n`);
    }
    
    // 4. Verificar informações do banco
    console.log('4️⃣ Informações do banco de dados...\n');
    
    try {
      // Executar query SQL direto para verificar
      const dbInfo = await prisma.$queryRaw<Array<{ DATABASE(): string }>>`
        SELECT DATABASE() as DATABASE
      `;
      
      if (dbInfo && dbInfo.length > 0) {
        console.log(`   📦 Banco de dados: ${dbInfo[0].DATABASE || 'N/A'}\n`);
      }
    } catch (error: any) {
      console.log(`   ⚠️  Não foi possível obter nome do banco: ${error.message}\n`);
    }
    
    // 5. Listar todos os usuários (se houver)
    if (usuariosCount > 0) {
      console.log('5️⃣ Listando todos os usuários:\n');
      
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
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('ID  | Nome                    | Email                          | Tipo      | Aprovado | Criado em');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      usuarios.forEach((u) => {
        const id = String(u.id).padEnd(3);
        const nome = (u.nome || '').substring(0, 22).padEnd(22);
        const email = (u.email || '').substring(0, 28).padEnd(28);
        const tipo = (u.tipo || '').padEnd(9);
        const aprovado = u.aprovado ? '✅ Sim' : '❌ Não';
        const createdAt = u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : 'N/A';
        console.log(`${id} | ${nome} | ${email} | ${tipo} | ${aprovado.padEnd(8)} | ${createdAt}`);
      });
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('5️⃣ ⚠️  NENHUM USUÁRIO ENCONTRADO NO BANCO!\n');
      console.log('   Isso pode significar:');
      console.log('   - O banco foi resetado/migrado');
      console.log('   - Os dados estão em outro banco/tenant');
      console.log('   - Há um problema de conexão\n');
    }
    
    // 6. Verificar variáveis de ambiente
    console.log('6️⃣ Verificando configuração de conexão...\n');
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      // Mascarar senha na URL
      const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
      console.log(`   DATABASE_URL: ${maskedUrl}\n`);
    } else {
      console.log('   ⚠️  DATABASE_URL não encontrada nas variáveis de ambiente!\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Diagnóstico concluído!\n');
    
  } catch (error: any) {
    console.error('\n❌ ERRO NO DIAGNÓSTICO:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticarBanco();
