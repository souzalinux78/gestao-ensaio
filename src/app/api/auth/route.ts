import { NextRequest, NextResponse } from 'next/server';
import { verificarCredenciais } from '@/lib/auth';
import { validateEmail, validatePassword } from '@/lib/validators';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar entrada
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(senha);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error || 'Senha inválida' },
        { status: 400 }
      );
    }

    // Normalizar email
    const emailNormalizado = email.trim().toLowerCase();
    const senhaNormalizada = senha.trim();
    logger.info('Tentativa de login', { email: emailNormalizado });

    const usuario = await verificarCredenciais(emailNormalizado, senhaNormalizada);

    if (!usuario) {
      logger.warn('Credenciais inválidas', { email: emailNormalizado });
      return NextResponse.json(
        { error: 'Credenciais inválidas. Verifique o email e senha.' },
        { status: 401 }
      );
    }

    // Se o usuário não estiver aprovado (e não for admin), retornar erro
    if (usuario.tipo !== 'admin' && !usuario.aprovado) {
      logger.warn('Usuário não aprovado tentou fazer login', { userId: usuario.id });
      return NextResponse.json(
        { error: 'Sua conta ainda não foi aprovada pelo administrador. Aguarde a aprovação.' },
        { status: 403 }
      );
    }

    logger.info('Login realizado com sucesso', { userId: usuario.id, tipo: usuario.tipo });
    return NextResponse.json(usuario);
  } catch (error: any) {
    logger.error('Erro no login', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login. Tente novamente.' },
      { status: 500 }
    );
  }
}
