import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';
import { safeParseInt, validatePassword } from '@/lib/validators';
import bcrypt from 'bcryptjs';

/**
 * POST /api/admin/usuarios/reset-senha
 * Reset de senha de usuário (apenas admin)
 * Body: { usuarioId: number, novaSenha: string }
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return authResult.error;
    }

    const { usuarioId, novaSenha } = await request.json();

    if (!usuarioId || !novaSenha) {
      return NextResponse.json(
        { error: 'ID do usuário e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    const id = safeParseInt(String(usuarioId));
    if (!id || id <= 0) {
      return NextResponse.json(
        { error: 'ID do usuário inválido' },
        { status: 400 }
      );
    }

    // Validar senha
    const passwordValidation = validatePassword(novaSenha);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error || 'Senha inválida' },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha.trim(), 10);

    // Atualizar senha
    await prisma.usuario.update({
      where: { id },
      data: { senha: senhaHash },
    });

    return NextResponse.json({
      success: true,
      message: `Senha do usuário ${usuario.nome} (${usuario.email}) foi resetada com sucesso.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
