import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';
import { safeParseInt, sanitizeString } from '@/lib/validators';

/**
 * GET /api/admin/tenants/[id]
 * Busca um tenant específico (apenas admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return authResult.error;
    }

    const id = safeParseInt(params.id);
    if (!id || id <= 0) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usuarios: true,
            ensaios: true,
            musicos: true,
            contatos: true,
            instrumentos: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(tenant);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/tenants/[id]
 * Atualiza um tenant (apenas admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return authResult.error;
    }

    const id = safeParseInt(params.id);
    if (!id || id <= 0) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const { nome, slug, ativo } = await request.json();

    const updateData: any = {};

    if (nome !== undefined) {
      const nomeSanitizado = sanitizeString(nome, 255);
      if (!nomeSanitizado) {
        return NextResponse.json(
          { error: 'Nome inválido' },
          { status: 400 }
        );
      }
      updateData.nome = nomeSanitizado;
    }

    if (slug !== undefined) {
      const slugSanitizado = sanitizeString(slug, 100);
      if (!slugSanitizado) {
        return NextResponse.json(
          { error: 'Slug inválido' },
          { status: 400 }
        );
      }
      updateData.slug = slugSanitizado;
    }

    if (ativo !== undefined) {
      updateData.ativo = Boolean(ativo);
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            usuarios: true,
            ensaios: true,
          },
        },
      },
    });

    return NextResponse.json(tenant);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Tenant não encontrado' },
        { status: 404 }
      );
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug já existe. Escolha outro.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tenants/[id]
 * Deleta um tenant (apenas admin)
 * NOTA: Não permite deletar tenant com dados associados
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return authResult.error;
    }

    const id = safeParseInt(params.id);
    if (!id || id <= 0) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usuarios: true,
            ensaios: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant não encontrado' },
        { status: 404 }
      );
    }

    // Não permitir deletar tenant padrão (ID = 1)
    if (id === 1) {
      return NextResponse.json(
        { error: 'Não é possível deletar o tenant padrão do sistema' },
        { status: 403 }
      );
    }

    // Verificar se há dados associados
    if (tenant._count.usuarios > 0 || tenant._count.ensaios > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível deletar tenant com dados associados. Desative o tenant ao invés de deletá-lo.',
          usuarios: tenant._count.usuarios,
          ensaios: tenant._count.ensaios,
        },
        { status: 403 }
      );
    }

    await prisma.tenant.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Tenant não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
