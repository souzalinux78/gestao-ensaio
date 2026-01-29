import { NextRequest } from 'next/server';
import { prisma } from './db';
import { Usuario, TipoUsuario } from '@/types';
import { verifyAccessToken } from './jwt';

export async function obterUsuarioDaRequisicao(
  request: NextRequest
): Promise<Usuario | null> {
  try {
    // Tentar obter do header Authorization (para APIs)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '').trim();
      
      // PRIORIDADE 1: Tentar validar como JWT
      const jwtPayload = verifyAccessToken(token);
      if (jwtPayload && jwtPayload.userId) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: jwtPayload.userId },
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            igreja: true,
            aprovado: true,
            tenantId: true, // Incluir tenantId
          },
        });
        if (usuario) {
          // Verificar se dados do token ainda estão corretos
          // (usuário pode ter sido desaprovado, tipo mudado ou tenant mudado)
          if (usuario.tipo !== jwtPayload.tipo || usuario.aprovado !== jwtPayload.aprovado) {
            // Token válido mas dados desatualizados - retornar null para forçar novo login
            return null;
          }
          // Se token tem tenantId mas usuário não tem (ou vice-versa), forçar novo login
          if (jwtPayload.tenantId !== undefined && usuario.tenantId !== jwtPayload.tenantId) {
            return null;
          }
          return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo as TipoUsuario,
            igreja: usuario.igreja,
            aprovado: usuario.aprovado,
            tenantId: usuario.tenantId ?? null, // Incluir tenantId
          };
        }
      }
      
      // PRIORIDADE 2: Fallback para sistema antigo (compatibilidade)
      // Tentar como ID numérico (sistema legado)
      const userId = parseInt(token);
      if (!isNaN(userId) && userId > 0) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: userId },
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            igreja: true,
            aprovado: true,
            tenantId: true, // Incluir tenantId
          },
        });
        if (usuario) {
          return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo as TipoUsuario,
            igreja: usuario.igreja,
            aprovado: usuario.aprovado,
            tenantId: usuario.tenantId ?? null, // Incluir tenantId
          };
        }
      }
    }

    // Tentar obter do cookie ou query param (fallback)
    const userId = request.cookies.get('userId')?.value || 
                   request.nextUrl.searchParams.get('userId');
    if (userId) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(userId) },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          igreja: true,
          aprovado: true,
          tenantId: true, // Incluir tenantId
        },
      });
      if (usuario) {
        return {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo as TipoUsuario,
          igreja: usuario.igreja,
          aprovado: usuario.aprovado,
          tenantId: usuario.tenantId ?? null, // Incluir tenantId
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
