import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';

/**
 * GET /api/admin/metricas
 * Retorna métricas do sistema (apenas admin)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return authResult.error;
    }

    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get('periodo') || '30'; // dias

    const dias = parseInt(periodo);
    if (isNaN(dias) || dias < 1 || dias > 365) {
      return NextResponse.json(
        { error: 'Período inválido. Use um valor entre 1 e 365 dias.' },
        { status: 400 }
      );
    }

    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    // Buscar métricas em paralelo
    const [
      totalUsuarios,
      totalInstrutores,
      totalAdmins,
      usuariosAprovados,
      usuariosPendentes,
      totalEnsaios,
      ensaiosPeriodo,
      totalMusicos,
      totalContatos,
      totalTenants,
      tenantsAtivos,
      usuariosPeriodo,
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.usuario.count({ where: { tipo: 'instrutor' } }),
      prisma.usuario.count({ where: { tipo: 'admin' } }),
      prisma.usuario.count({ where: { aprovado: true, tipo: 'instrutor' } }),
      prisma.usuario.count({ where: { aprovado: false, tipo: 'instrutor' } }),
      prisma.ensaio.count(),
      prisma.ensaio.count({
        where: {
          data: {
            gte: dataInicio,
          },
        },
      }),
      prisma.musico.count(),
      prisma.contato.count(),
      prisma.tenant.count(),
      prisma.tenant.count({ where: { ativo: true } }),
      prisma.usuario.count({
        where: {
          createdAt: {
            gte: dataInicio,
          },
        },
      }),
    ]);

    // Estatísticas por tenant
    const tenantsStats = await prisma.tenant.findMany({
      select: {
        id: true,
        nome: true,
        slug: true,
        ativo: true,
        _count: {
          select: {
            usuarios: true,
            ensaios: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Ensaios por mês (últimos 6 meses)
    const meses = [];
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const inicioMes = new Date(data.getFullYear(), data.getMonth(), 1);
      const fimMes = new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59);

      const count = await prisma.ensaio.count({
        where: {
          data: {
            gte: inicioMes,
            lte: fimMes,
          },
        },
      });

      meses.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        total: count,
      });
    }

    return NextResponse.json({
      periodo: `${dias} dias`,
      usuarios: {
        total: totalUsuarios,
        instrutores: totalInstrutores,
        admins: totalAdmins,
        aprovados: usuariosAprovados,
        pendentes: usuariosPendentes,
        novosNoPeriodo: usuariosPeriodo,
      },
      ensaios: {
        total: totalEnsaios,
        noPeriodo: ensaiosPeriodo,
        porMes: meses,
      },
      outros: {
        musicos: totalMusicos,
        contatos: totalContatos,
      },
      tenants: {
        total: totalTenants,
        ativos: tenantsAtivos,
        detalhes: tenantsStats,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
