import { NextRequest, NextResponse } from 'next/server';
import { verificarCredenciais } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Normalizar email
    const emailNormalizado = email.trim().toLowerCase();
    const senhaNormalizada = senha.trim();
    console.info('[AUTH] Tentativa de login', { email: emailNormalizado });

    const usuario = await verificarCredenciais(emailNormalizado, senhaNormalizada);

    if (!usuario) {
      console.warn('[AUTH] Credenciais inválidas', { email: emailNormalizado });
      return NextResponse.json(
        { error: 'Credenciais inválidas. Verifique o email e senha.' },
        { status: 401 }
      );
    }

    // Se o usuário não estiver aprovado (e não for admin), retornar erro
    if (usuario.tipo !== 'admin' && !usuario.aprovado) {
      console.warn('[AUTH] Usuário não aprovado', { email: emailNormalizado });
      return NextResponse.json(
        { error: 'Sua conta ainda não foi aprovada pelo administrador. Aguarde a aprovação.' },
        { status: 403 }
      );
    }

    console.info('[AUTH] Login ok', { email: emailNormalizado, usuarioId: usuario.id });
    return NextResponse.json(usuario);
  } catch (error: any) {
    console.error('[AUTH] Erro no login:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
