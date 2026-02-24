import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { alterarSenha } from '@/lib/auth';
import { resolveTenantFromRequest } from '@/lib/middleware';
import bcrypt from 'bcryptjs';
import { safeParseInt, sanitizeString, validateEmail, validatePassword } from '@/lib/validators';
import { construirIgreja, parseIgreja, ufEhValida } from '@/lib/igreja';

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
    const { nome, email, tipo, igreja, localidade, cidade, uf, senha, aprovado } = body;

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
      const tiposValidos = ['admin', 'instrutor', 'encarregado', 'secretario'];
      if (!tiposValidos.includes(tipo)) {
        return NextResponse.json(
          { error: `Tipo deve ser um dos seguintes: ${tiposValidos.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.tipo = tipo;
      // Se mudar para admin, automaticamente aprovar
      if (tipo === 'admin') {
        updateData.aprovado = true;
      }
    }
    const localidadeSanitizada = sanitizeString(localidade, 120);
    const cidadeSanitizada = sanitizeString(cidade, 120);
    const ufSanitizadaBruta = sanitizeString(uf, 2);
    const ufSanitizada = ufSanitizadaBruta ? ufSanitizadaBruta.toUpperCase() : null;
    const recebeuCamposPadrao = localidade !== undefined || cidade !== undefined || uf !== undefined;
    const possuiAlgumCampoPadrao = Boolean(localidadeSanitizada || cidadeSanitizada || ufSanitizada);

    if (!ufEhValida(ufSanitizada)) {
      return NextResponse.json(
        { error: 'UF inválida. Use apenas 2 letras (ex: SP).' },
        { status: 400 }
      );
    }

    if (recebeuCamposPadrao && possuiAlgumCampoPadrao && (!localidadeSanitizada || !cidadeSanitizada || !ufSanitizada)) {
      return NextResponse.json(
        { error: 'Preencha Localidade, Cidade e UF para salvar a igreja padronizada.' },
        { status: 400 }
      );
    }

    if (recebeuCamposPadrao) {
      updateData.igreja = construirIgreja(localidadeSanitizada, cidadeSanitizada, ufSanitizada);
    } else if (igreja !== undefined) {
      const igrejaSanitizada = igreja ? sanitizeString(igreja, 255) : null;
      if (igrejaSanitizada) {
        const partes = parseIgreja(igrejaSanitizada);
        updateData.igreja = construirIgreja(partes.localidade, partes.cidade, partes.uf) || igrejaSanitizada;
      } else {
        updateData.igreja = null;
      }
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

    // Verificar se usuário existe e pertence ao mesmo tenant
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, tenantId: true, tipo: true },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // ISOLAMENTO: quando houver tenant do solicitante, restringir ao mesmo tenant
    if (tenantId !== null && usuarioExistente.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (updateData.igreja !== undefined) {
      const tipoFinalUsuario = updateData.tipo || usuarioExistente.tipo;
      if (tipoFinalUsuario !== 'admin') {
        const partes = parseIgreja(updateData.igreja);
        if (!partes.localidade || !partes.cidade || !partes.uf) {
          return NextResponse.json(
            { error: 'Localidade, cidade e UF são obrigatórios para este tipo de usuário.' },
            { status: 400 }
          );
        }
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
    const id = safeParseInt(params.id);
    if (!id || id <= 0) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Obter tenantId para isolamento
    const tenantId = await resolveTenantFromRequest(request);

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

    // ISOLAMENTO: quando houver tenant do solicitante, restringir ao mesmo tenant
    if (tenantId !== null && usuario.tenantId !== tenantId) {
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
