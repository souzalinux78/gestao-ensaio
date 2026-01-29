import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { Usuario, TipoUsuario } from '@/types';
import { logger } from './logger';

export async function verificarCredenciais(
  email: string,
  senha: string
): Promise<Usuario | null> {
  // Normalizar email (trim e lowercase)
  const emailNormalizado = email.trim().toLowerCase();
  
  const usuario = await prisma.usuario.findUnique({
    where: { email: emailNormalizado },
    select: {
      id: true,
      nome: true,
      email: true,
      senha: true,
      tipo: true,
      igreja: true,
      aprovado: true,
      tenantId: true,
      telefone: true, // Incluir telefone para verificar se é usuário antigo
      createdAt: true, // Incluir data de criação para verificar se é usuário antigo
    },
  });

  if (!usuario) {
    logger.warn('Usuário não encontrado', { email: emailNormalizado });
    return null;
  }

  logger.debug('Usuário encontrado', { 
    userId: usuario.id, 
    email: emailNormalizado,
    tipo: usuario.tipo,
    aprovado: usuario.aprovado,
    createdAt: usuario.createdAt
  });

  // Verificar se a senha está hasheada (começa com $2a$ ou $2b$)
  const senhaEstaHasheada = usuario.senha.startsWith('$2a$') || usuario.senha.startsWith('$2b$');
  
  if (!senhaEstaHasheada) {
    logger.warn('Senha não hasheada detectada - migrando', { userId: usuario.id });
    // Se a senha não está hasheada, comparar diretamente (para migração)
    if (usuario.senha === senha) {
      // Re-hashear a senha
      const senhaHash = await bcrypt.hash(senha, 10);
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { senha: senhaHash },
      });
      logger.info('Senha migrada com sucesso', { userId: usuario.id });
      // Verificar se o usuário está aprovado (admin sempre aprovado)
      // COMPATIBILIDADE RETROATIVA: 
      // - Se aprovado for null/undefined, tratar como true
      // - Se aprovado for false mas usuário foi criado há mais de 30 dias, tratar como true (usuário antigo)
      // - Se aprovado for false mas usuário não tem telefone (campo novo), tratar como true (usuário antigo)
      let aprovadoFinal = usuario.aprovado ?? true;
      
      // Se aprovado é false, verificar se é usuário antigo
      if (aprovadoFinal === false) {
        const isUsuarioAntigo = 
          // Usuário criado há mais de 30 dias
          (usuario.createdAt && (() => {
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - 30);
            return usuario.createdAt! < dataLimite;
          })()) ||
          // Usuário não tem telefone (campo adicionado recentemente)
          !usuario.telefone;
        
        if (isUsuarioAntigo) {
          // Usuário antigo - tratar como aprovado para compatibilidade retroativa
          logger.info('Usuário antigo detectado - permitindo login', { 
            userId: usuario.id, 
            createdAt: usuario.createdAt,
            temTelefone: !!usuario.telefone,
            diasDesdeCriacao: usuario.createdAt ? Math.floor((Date.now() - usuario.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : null
          });
          aprovadoFinal = true;
        }
      }
      
      if (usuario.tipo !== 'admin' && aprovadoFinal === false) {
        logger.warn('Usuário não aprovado bloqueado', { userId: usuario.id, tipo: usuario.tipo });
        return null;
      }

      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo as TipoUsuario,
        igreja: usuario.igreja,
        aprovado: aprovadoFinal,
        tenantId: usuario.tenantId ?? null, // Incluir tenantId
      };
    }
    return null;
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    logger.warn('Senha inválida', { userId: usuario.id, email: emailNormalizado });
    return null;
  }

  logger.debug('Senha válida', { userId: usuario.id });

  // Verificar se o usuário está aprovado (admin sempre aprovado)
  // COMPATIBILIDADE RETROATIVA: 
  // - Se aprovado for null/undefined, tratar como true
  // - Se aprovado for false mas usuário foi criado há mais de 30 dias, tratar como true (usuário antigo)
  // - Se aprovado for false mas usuário não tem telefone (campo novo), tratar como true (usuário antigo)
  // Isso permite que usuários antigos (criados antes do sistema de aprovação) possam logar
  let aprovadoFinal = usuario.aprovado ?? true;
  
  // Se aprovado é false, verificar se é usuário antigo
  if (aprovadoFinal === false) {
    const isUsuarioAntigo = 
      // Usuário criado há mais de 30 dias
      (usuario.createdAt && (() => {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 30);
        return usuario.createdAt! < dataLimite;
      })()) ||
      // Usuário não tem telefone (campo adicionado recentemente)
      !usuario.telefone;
    
    if (isUsuarioAntigo) {
      // Usuário antigo - tratar como aprovado para compatibilidade retroativa
      logger.info('Usuário antigo detectado - permitindo login', { 
        userId: usuario.id, 
        createdAt: usuario.createdAt,
        temTelefone: !!usuario.telefone,
        diasDesdeCriacao: usuario.createdAt ? Math.floor((Date.now() - usuario.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : null
      });
      aprovadoFinal = true;
    }
  }
  
  if (usuario.tipo !== 'admin' && aprovadoFinal === false) {
    logger.warn('Usuário não aprovado bloqueado', { userId: usuario.id, tipo: usuario.tipo });
    return null;
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo as TipoUsuario,
    igreja: usuario.igreja,
    aprovado: aprovadoFinal,
    tenantId: usuario.tenantId ?? null, // Incluir tenantId
  };
}

export async function criarUsuario(
  nome: string,
  email: string,
  senha: string,
  tipo: TipoUsuario,
  igreja?: string | null,
  tenantId?: number | null
) {
  const senhaHash = await bcrypt.hash(senha, 10);
  // Admin sempre aprovado, instrutor não aprovado por padrão
  const aprovado = tipo === 'admin';
  // Se não fornecido, usar tenant padrão (ID = 1)
  const tenantIdFinal = tenantId || 1;
  return prisma.usuario.create({
    data: { 
      nome, 
      email, 
      senha: senhaHash, 
      tipo, 
      igreja: igreja || null, 
      aprovado,
      tenantId: tenantIdFinal, // ISOLAMENTO: associar ao tenant
    },
  });
}

export async function alterarSenha(usuarioId: number, novaSenha: string) {
  const senhaHash = await bcrypt.hash(novaSenha, 10);
  return prisma.usuario.update({
    where: { id: usuarioId },
    data: { senha: senhaHash },
  });
}
