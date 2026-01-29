import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { TipoUsuario } from '@/types';

/**
 * Endpoint para renovar Access Token usando Refresh Token
 * POST /api/auth/refresh
 * 
 * Body: { refreshToken: string }
 * OU
 * Cookie: refreshToken (httpOnly)
 */
export async function POST(request: NextRequest) {
  try {
    // Tentar obter refresh token do body ou cookie
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refreshToken || request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token não fornecido' },
        { status: 401 }
      );
    }

    // Validar refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Refresh token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Verificar se o token existe no banco e não foi revogado
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { usuario: true },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Refresh token não encontrado ou revogado' },
        { status: 401 }
      );
    }

    // Verificar se não expirou
    if (tokenRecord.expiresAt < new Date()) {
      // Remover token expirado
      await prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
      return NextResponse.json(
        { error: 'Refresh token expirado' },
        { status: 401 }
      );
    }

    // Verificar se usuário ainda existe e está aprovado
    const usuario = tokenRecord.usuario;
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Se for instrutor, verificar se ainda está aprovado
    // COMPATIBILIDADE RETROATIVA: Se aprovado for null/undefined, tratar como true
    const aprovadoFinal = usuario.aprovado ?? true;
    if (usuario.tipo !== 'admin' && aprovadoFinal === false) {
      return NextResponse.json(
        { error: 'Usuário não aprovado' },
        { status: 403 }
      );
    }

    // Gerar novo access token (incluindo tenantId)
    const accessToken = generateAccessToken({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo as TipoUsuario,
      igreja: usuario.igreja,
      aprovado: usuario.aprovado,
      tenantId: usuario.tenantId ?? null, // ISOLAMENTO: incluir tenantId
    });

    logger.info('Access token renovado', { userId: usuario.id });

    return NextResponse.json({
      accessToken,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        igreja: usuario.igreja,
        aprovado: usuario.aprovado,
      },
    });
  } catch (error: any) {
    logger.error('Erro ao renovar token', error);
    return NextResponse.json(
      { error: 'Erro ao renovar token' },
      { status: 500 }
    );
  }
}
