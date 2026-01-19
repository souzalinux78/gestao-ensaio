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

    const usuario = await verificarCredenciais(emailNormalizado, senhaNormalizada);

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciais inválidas. Verifique o email e senha.' },
        { status: 401 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error: any) {
    console.error('[AUTH] Erro no login:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
