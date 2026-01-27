import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';

/**
 * GET /api/admin/logs
 * Retorna logs do sistema (apenas admin)
 * Por enquanto, retorna logs de atividades recentes baseado em timestamps
 * Futuramente pode ser expandido com tabela de logs dedicada
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return authResult.error;
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 50;
    const skip = (page - 1) * limit;
    const tipo = searchParams.get('tipo'); // 'login', 'criacao', 'atualizacao', 'todos'

    // Por enquanto, vamos retornar atividades baseadas em timestamps
    // Futuramente, pode ser expandido com uma tabela de logs dedicada

    const logs: any[] = [];

    // Logs de criação de usuários
    if (!tipo || tipo === 'criacao' || tipo === 'todos') {
      const usuariosRecentes = await prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });

      usuariosRecentes.forEach((usuario) => {
        logs.push({
          id: `usuario-${usuario.id}`,
          tipo: 'criacao',
          acao: 'Usuário criado',
          detalhes: `${usuario.nome} (${usuario.email}) - ${usuario.tipo}`,
          timestamp: usuario.createdAt,
          usuarioId: usuario.id,
        });
      });
    }

    // Logs de criação de ensaios
    if (!tipo || tipo === 'criacao' || tipo === 'todos') {
      const ensaiosRecentes = await prisma.ensaio.findMany({
        select: {
          id: true,
          data: true,
          createdAt: true,
          instrutor: {
            select: {
              nome: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });

      ensaiosRecentes.forEach((ensaio) => {
        logs.push({
          id: `ensaio-${ensaio.id}`,
          tipo: 'criacao',
          acao: 'Ensaio criado',
          detalhes: `Ensaio de ${ensaio.instrutor.nome} em ${ensaio.data.toLocaleDateString('pt-BR')}`,
          timestamp: ensaio.createdAt,
          ensaioId: ensaio.id,
        });
      });
    }

    // Ordenar por timestamp (mais recente primeiro)
    logs.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Aplicar paginação
    const total = logs.length;
    const logsPaginados = logs.slice(skip, skip + limit);

    const hasPagination = searchParams.has('page') || searchParams.has('limit');

    if (hasPagination) {
      return NextResponse.json({
        data: logsPaginados,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    return NextResponse.json(logsPaginados);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
