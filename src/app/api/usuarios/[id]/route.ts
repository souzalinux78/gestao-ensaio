import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { alterarSenha } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nome, email, tipo, igreja, senha } = body;

    const updateData: any = {};
    if (nome) updateData.nome = nome.trim();
    if (email) {
      // Normalizar email (trim e lowercase)
      updateData.email = email.trim().toLowerCase();
    }
    if (tipo) {
      updateData.tipo = tipo;
      // Se mudar para admin, automaticamente aprovar
      if (tipo === 'admin') {
        updateData.aprovado = true;
      }
    }
    if (igreja !== undefined) updateData.igreja = igreja ? igreja.trim() : null;
    if (senha) {
      // Garantir que a senha seja hasheada corretamente
      const senhaTrimmed = senha.trim();
      if (senhaTrimmed.length > 0) {
        updateData.senha = await bcrypt.hash(senhaTrimmed, 10);
        console.log(`[USUARIOS] Senha atualizada para usuário ID: ${id}`);
      }
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
    const id = parseInt(params.id);

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
