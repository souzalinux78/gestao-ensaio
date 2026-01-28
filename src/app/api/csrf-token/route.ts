/**
 * API para obter token CSRF
 * Frontend deve chamar esta rota para obter o token antes de fazer requisições POST/PUT/DELETE
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken, setCSRFTokenCookie } from '@/lib/csrf';

export async function GET(request: NextRequest) {
  try {
    // Gerar novo token CSRF
    const token = generateCSRFToken();

    // Criar resposta
    const response = NextResponse.json({
      token,
      message: 'Token CSRF gerado com sucesso',
    });

    // Adicionar token ao cookie
    return setCSRFTokenCookie(response, token);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Erro ao gerar token CSRF',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
