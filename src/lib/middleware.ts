import { NextRequest, NextResponse } from 'next/server';
import { obterUsuarioDaRequisicao } from './get-user-from-request';
import { Usuario } from '@/types';

/**
 * Middleware para verificar autenticação
 * Retorna o usuário autenticado ou null
 */
export async function requireAuth(request: NextRequest): Promise<{ usuario: Usuario; error: null } | { usuario: null; error: NextResponse }> {
  const usuario = await obterUsuarioDaRequisicao(request);
  
  if (!usuario) {
    return {
      usuario: null,
      error: NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      ),
    };
  }

  return { usuario, error: null };
}

/**
 * Middleware para verificar se o usuário é admin
 */
export async function requireAdmin(request: NextRequest): Promise<{ usuario: Usuario; error: null } | { usuario: null; error: NextResponse }> {
  const authResult = await requireAuth(request);
  
  if (authResult.error) {
    return authResult;
  }

  if (authResult.usuario.tipo !== 'admin') {
    return {
      usuario: null,
      error: NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem realizar esta ação.' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Middleware para verificar se o usuário está aprovado
 */
export async function requireApproved(request: NextRequest): Promise<{ usuario: Usuario; error: null } | { usuario: null; error: NextResponse }> {
  const authResult = await requireAuth(request);
  
  if (authResult.error) {
    return authResult;
  }

  const { usuario } = authResult;
  
  // Admin sempre aprovado
  if (usuario.tipo === 'admin') {
    return authResult;
  }

  if (!usuario.aprovado) {
    return {
      usuario: null,
      error: NextResponse.json(
        { error: 'Sua conta ainda não foi aprovada pelo administrador.' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}
