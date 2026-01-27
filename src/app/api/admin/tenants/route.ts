import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';
import { sanitizeString } from '@/lib/validators';

/**
 * GET /api/admin/tenants
 * Lista todos os tenants (apenas admin)
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

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              usuarios: true,
              ensaios: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.tenant.count(),
    ]);

    const hasPagination = searchParams.has('page') || searchParams.has('limit');

    if (hasPagination) {
      return NextResponse.json({
        data: tenants,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    return NextResponse.json(tenants);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tenants
 * Cria um novo tenant (apenas admin)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return authResult.error;
    }

    const { nome, slug, ativo } = await request.json();

    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Gerar slug se não fornecido
    let slugFinal = slug;
    if (!slugFinal || !slugFinal.trim()) {
      slugFinal = nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const nomeSanitizado = sanitizeString(nome, 255);
    const slugSanitizado = sanitizeString(slugFinal, 100);

    if (!nomeSanitizado || !slugSanitizado) {
      return NextResponse.json(
        { error: 'Nome ou slug inválido' },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.create({
      data: {
        nome: nomeSanitizado,
        slug: slugSanitizado,
        ativo: ativo !== undefined ? ativo : true,
      },
      include: {
        _count: {
          select: {
            usuarios: true,
            ensaios: true,
          },
        },
      },
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug já existe. Escolha outro nome.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
