import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { criarUsuario } from '@/lib/auth';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';
import { validateEmail, validatePassword, sanitizeString } from '@/lib/validators';

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

    const usuarios = await prisma.usuario.findMany({
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
    });
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

    const usuario = await criarUsuario(nomeSanitizado, email.trim().toLowerCase(), senha, tipoFinal, igrejaSanitizada);

    // Atualizar o campo aprovado
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { aprovado: usuarioAprovado },
    });

    return NextResponse.json({
      id: usuarioAtualizado.id,
      nome: usuarioAtualizado.nome,
      email: usuarioAtualizado.email,
      tipo: usuarioAtualizado.tipo,
      igreja: usuarioAtualizado.igreja,
      aprovado: usuarioAtualizado.aprovado,
    });
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
