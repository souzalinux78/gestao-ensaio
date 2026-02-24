import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';
import { resolveTenantFromRequest } from '@/lib/middleware';
import { validateEmail, validatePassword, sanitizeString } from '@/lib/validators';
import { construirIgreja, parseIgreja, ufEhValida } from '@/lib/igreja';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    // Verificar se é admin
    const usuario = await obterUsuarioDaRequisicao(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (usuario.tipo !== 'admin') {
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
    // Se tenantId for null, usar visão global (dados legados sem tenant definido)
    const tenantId = await resolveTenantFromRequest(request);
    const tenantWhere = tenantId !== null ? { tenantId } : {};

    // Buscar usuários e total em paralelo
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where: tenantWhere,
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
        where: tenantWhere,
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
    const { nome, email, telefone, senha, tipo, igreja, localidade, cidade, uf, aprovado } = await request.json();
    const usuarioSolicitante = await obterUsuarioDaRequisicao(request);
    const solicitanteEhAdmin = usuarioSolicitante?.tipo === 'admin';

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
    const tiposValidos = ['admin', 'instrutor', 'encarregado', 'secretario'];
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo deve ser um dos seguintes: ${tiposValidos.join(', ')}` },
        { status: 400 }
      );
    }

    // Sanitizar strings
    const nomeSanitizado = sanitizeString(nome, 255);
    const telefoneSanitizado = sanitizeString(telefone, 20);
    const localidadeSanitizada = sanitizeString(localidade, 120);
    const cidadeSanitizada = sanitizeString(cidade, 120);
    const ufSanitizadaBruta = sanitizeString(uf, 2);
    const ufSanitizada = ufSanitizadaBruta ? ufSanitizadaBruta.toUpperCase() : null;

    if (!ufEhValida(ufSanitizada)) {
      return NextResponse.json(
        { error: 'UF inválida. Use apenas 2 letras (ex: SP).' },
        { status: 400 }
      );
    }

    const recebeuCamposPadrao = localidade !== undefined || cidade !== undefined || uf !== undefined;
    const possuiAlgumCampoPadrao = Boolean(localidadeSanitizada || cidadeSanitizada || ufSanitizada);

    if (recebeuCamposPadrao && possuiAlgumCampoPadrao && (!localidadeSanitizada || !cidadeSanitizada || !ufSanitizada)) {
      return NextResponse.json(
        { error: 'Preencha Localidade, Cidade e UF para salvar a igreja padronizada.' },
        { status: 400 }
      );
    }

    let igrejaSanitizada = recebeuCamposPadrao
      ? construirIgreja(localidadeSanitizada, cidadeSanitizada, ufSanitizada)
      : (igreja ? sanitizeString(igreja, 255) : null);

    if (!nomeSanitizado) {
      return NextResponse.json(
        { error: 'Nome inválido' },
        { status: 400 }
      );
    }

    if (telefone !== undefined && telefone !== null && String(telefone).trim() !== '' && !telefoneSanitizado) {
      return NextResponse.json(
        { error: 'Telefone inválido' },
        { status: 400 }
      );
    }

    // Garantir que cadastros públicos não sejam admin
    // Admin só pode ser criado por outro admin autenticado
    const tipoFinal = !solicitanteEhAdmin && tipo === 'admin' ? 'instrutor' : tipo;

    if (igrejaSanitizada) {
      const igrejaPartes = parseIgreja(igrejaSanitizada);
      igrejaSanitizada = construirIgreja(igrejaPartes.localidade, igrejaPartes.cidade, igrejaPartes.uf) || igrejaSanitizada;
    }

    if (tipoFinal !== 'admin') {
      const igrejaPartes = parseIgreja(igrejaSanitizada);
      if (!igrejaPartes.localidade || !igrejaPartes.cidade || !igrejaPartes.uf) {
        return NextResponse.json(
          { error: 'Localidade, cidade e UF são obrigatórios para este tipo de usuário.' },
          { status: 400 }
        );
      }
    }
    
    // Se for cadastro público (sem aprovado definido), criar como não aprovado
    // Se for admin criando, usar o valor de aprovado fornecido (ou true para admin)
    const usuarioAprovado = aprovado !== undefined ? aprovado : (tipoFinal === 'admin' ? true : false);

    // Obter tenantId para isolamento
    // Para dados legados, manter null em vez de forçar tenant 1
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId ?? null;

    // Criar usuário diretamente com aprovado (evita query duplicada)
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: {
        nome: nomeSanitizado,
        email: email.trim().toLowerCase(),
        telefone: telefoneSanitizado,
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
        telefone: true,
        tipo: true,
        igreja: true,
        aprovado: true,
      },
    });

    // Enviar notificação ao admin se for cadastro público (não aprovado)
    if (!usuarioAprovado) {
      const { notificarNovoCadastro } = await import('@/lib/webhook-notifications');
      await notificarNovoCadastro(
        {
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
          tipo: usuario.tipo,
        },
        tenantIdFinal
      );
    }

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
