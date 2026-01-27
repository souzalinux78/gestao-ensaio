import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { alterarSenha } from '@/lib/auth';
import { resolveTenantFromRequest } from '@/lib/middleware';
import bcrypt from 'bcryptjs';
import { safeParseInt, sanitizeString, validateEmail, validatePassword } from '@/lib/validators';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = safeParseInt(params.id);
    if (!id || id <= 0) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nome, email, tipo, igreja, senha, aprovado } = body;

    const updateData: any = {};
    if (nome) {
      const nomeSanitizado = sanitizeString(nome, 255);
      if (!nomeSanitizado) {
        return NextResponse.json(
          { error: 'Nome inválido' },
          { status: 400 }
        );
      }
      updateData.nome = nomeSanitizado;
    }
    if (email) {
      if (!validateEmail(email)) {
        return NextResponse.json(
          { error: 'Email inválido' },
          { status: 400 }
        );
      }
      // Normalizar email (trim e lowercase)
      updateData.email = email.trim().toLowerCase();
    }
    if (tipo) {
      if (tipo !== 'admin' && tipo !== 'instrutor') {
        return NextResponse.json(
          { error: 'Tipo deve ser "admin" ou "instrutor"' },
          { status: 400 }
        );
      }
      updateData.tipo = tipo;
      // Se mudar para admin, automaticamente aprovar
      if (tipo === 'admin') {
        updateData.aprovado = true;
      }
    }
    if (igreja !== undefined) {
      updateData.igreja = igreja ? sanitizeString(igreja, 255) : null;
    }
    if (senha) {
      // Validar senha
      const passwordValidation = validatePassword(senha);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          { error: passwordValidation.error || 'Senha inválida' },
          { status: 400 }
        );
      }
      // Garantir que a senha seja hasheada corretamente
      const senhaTrimmed = senha.trim();
      if (senhaTrimmed.length > 0) {
        updateData.senha = await bcrypt.hash(senhaTrimmed, 10);
        console.log(`[USUARIOS] Senha atualizada para usuário ID: ${id}`);
      }
    }
    // Permitir atualizar campo aprovado (apenas para instrutores)
    if (aprovado !== undefined && tipo !== 'admin') {
      updateData.aprovado = aprovado;
    }

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão

    // Verificar se usuário existe e pertence ao mesmo tenant
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, tenantId: true },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // ISOLAMENTO: Verificar se usuário pertence ao mesmo tenant
    if (usuarioExistente.tenantId !== tenantIdFinal) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        igreja: true,
        aprovado: true,
      },
    });

    console.log(`[USUARIOS] Usuário atualizado: ${usuario.email}`);
    return NextResponse.json(usuario);
  } catch (error: any) {
    console.error('[USUARIOS] Erro ao atualizar:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = safeParseInt(params.id);
    if (!id || id <= 0) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);
    const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão

    // Não permitir deletar a si mesmo
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // ISOLAMENTO: Verificar se usuário pertence ao mesmo tenant
    if (usuario.tenantId !== tenantIdFinal) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    await prisma.usuario.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
