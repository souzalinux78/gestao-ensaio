import { NextRequest, NextResponse } from 'next/server';
import { obterUsuarioDaRequisicao } from './get-user-from-request';
import { Usuario } from '@/types';
import { verifyAccessToken } from './jwt';

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

  // COMPATIBILIDADE RETROATIVA: Se aprovado for null/undefined, tratar como true
  // Isso permite que usuários antigos (criados antes do campo aprovado) possam acessar
  const aprovadoFinal = usuario.aprovado ?? true;
  if (aprovadoFinal === false) {
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

/**
 * Extrai e valida o tenantId da requisição
 * Prioridade:
 * 1. Do JWT (tenantId no payload)
 * 2. Do usuário autenticado (tenantId do banco)
 * 3. Fallback para sistema antigo (null - será tratado como tenant padrão)
 * 
 * @param request Requisição Next.js
 * @returns tenantId ou null se não encontrado
 */
export function getTenantFromRequest(request: NextRequest): number | null {
  try {
    // PRIORIDADE 1: Extrair do JWT
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '').trim();
      const jwtPayload = verifyAccessToken(token);
      
      if (jwtPayload && jwtPayload.tenantId) {
        return jwtPayload.tenantId;
      }
    }
    
    // PRIORIDADE 2: Fallback - será obtido do usuário autenticado
    // (isso será feito nas queries usando obterUsuarioDaRequisicao)
    return null;
  } catch {
    return null;
  }
}

/**
 * Resolve o tenantId da requisição de forma assíncrona
 * Busca o tenantId do usuário autenticado se não estiver no JWT
 * 
 * @param request Requisição Next.js
 * @returns tenantId ou null se não encontrado
 */
export async function resolveTenantFromRequest(request: NextRequest): Promise<number | null> {
  // Tentar obter do JWT primeiro
  const tenantFromJWT = getTenantFromRequest(request);
  if (tenantFromJWT) {
    return tenantFromJWT;
  }
  
  // Se não estiver no JWT, obter do usuário autenticado
  const usuario = await obterUsuarioDaRequisicao(request);
  if (usuario && usuario.tenantId) {
    return usuario.tenantId;
  }
  
  // Fallback: retornar null (será tratado como tenant padrão nas queries)
  return null;
}

/**
 * Valida se o tenantId é válido e existe no banco
 * Útil para garantir que o tenant ainda está ativo
 * 
 * @param tenantId ID do tenant
 * @returns true se válido, false caso contrário
 */
export async function validateTenant(tenantId: number | null): Promise<boolean> {
  if (!tenantId) {
    return false;
  }
  
  try {
    const { prisma } = await import('./db');
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, ativo: true },
    });
    
    return tenant !== null && tenant.ativo === true;
  } catch {
    return false;
  }
}
