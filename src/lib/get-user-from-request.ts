import { NextRequest } from 'next/server';
import { prisma } from './db';
import { Usuario } from '@/types';

export async function obterUsuarioDaRequisicao(
  request: NextRequest
): Promise<Usuario | null> {
  try {
    // Tentar obter do header Authorization (para APIs)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const userId = parseInt(authHeader.replace('Bearer ', ''));
      if (userId) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: userId },
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            igreja: true,
          },
        });
        if (usuario) {
          return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo as 'admin' | 'instrutor',
            igreja: usuario.igreja,
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
        },
      });
      if (usuario) {
        return {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo as 'admin' | 'instrutor',
          igreja: usuario.igreja,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
