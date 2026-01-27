import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';
import { resolveTenantFromRequest } from '@/lib/middleware';
import { validateEmail, validatePassword, sanitizeString } from '@/lib/validators';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    // Verificar se é admin
    const usuario = await obterUsuarioDaRequisicao(request);
    if (!usuario || usuario.tipo !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem visualizar usuários.' },
        { status: 403 }
      );
    }

    // Paginação
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 50; // Max 100, default 50
    const skip = (page - 1) * limit;

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão

    // Buscar usuários e total em paralelo
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where: {
          tenantId: tenantIdFinal, // ISOLAMENTO: admin vê apenas usuários do seu tenant
        },
        orderBy: {
          nome: 'asc',
        },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          igreja: true,
          aprovado: true,
          createdAt: true,
        },
        skip,
        take: limit,
      }),
      prisma.usuario.count({
        where: {
          tenantId: tenantIdFinal, // ISOLAMENTO: contar apenas usuários do tenant
        },
      }),
    ]);

  // Se não há parâmetros de paginação, retornar formato antigo (compatibilidade)
  const hasPagination = searchParams.has('page') || searchParams.has('limit');
  
  if (hasPagination) {
    return NextResponse.json({
      data: usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
  
  // Formato antigo (compatibilidade)
  return NextResponse.json(usuarios);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha, tipo, igreja, aprovado } = await request.json();

    // Validar entrada
    if (!nome || !email || !senha || !tipo) {
      return NextResponse.json(
        { error: 'Nome, email, senha e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar senha
    const passwordValidation = validatePassword(senha);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error || 'Senha inválida' },
        { status: 400 }
      );
    }

    // Validar tipo
    if (tipo !== 'admin' && tipo !== 'instrutor') {
      return NextResponse.json(
        { error: 'Tipo deve ser "admin" ou "instrutor"' },
        { status: 400 }
      );
    }

    // Sanitizar strings
    const nomeSanitizado = sanitizeString(nome, 255);
    const igrejaSanitizada = igreja ? sanitizeString(igreja, 255) : null;

    if (!nomeSanitizado) {
      return NextResponse.json(
        { error: 'Nome inválido' },
        { status: 400 }
      );
    }

    // Garantir que cadastros públicos sejam sempre instrutores
    const tipoFinal = tipo === 'admin' ? tipo : 'instrutor';
    
    // Se for cadastro público (sem aprovado definido), criar como não aprovado
    // Se for admin criando, usar o valor de aprovado fornecido (ou true para admin)
    const usuarioAprovado = aprovado !== undefined ? aprovado : (tipoFinal === 'admin' ? true : false);

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão

    // Criar usuário diretamente com aprovado (evita query duplicada)
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: {
        nome: nomeSanitizado,
        email: email.trim().toLowerCase(),
        senha: senhaHash,
        tipo: tipoFinal,
        igreja: igrejaSanitizada,
        aprovado: usuarioAprovado,
        tenantId: tenantIdFinal, // ISOLAMENTO: associar ao tenant
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        igreja: true,
        aprovado: true,
      },
    });

    return NextResponse.json(usuario);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
