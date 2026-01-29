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
  });

  if (!usuario) {
    logger.debug('Usuário não encontrado', { email: emailNormalizado });
    return null;
  }

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
      // COMPATIBILIDADE RETROATIVA: Se aprovado for null/undefined, tratar como true
      const aprovadoFinal = usuario.aprovado ?? true;
      if (usuario.tipo !== 'admin' && aprovadoFinal === false) {
        logger.debug('Usuário não aprovado', { userId: usuario.id });
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
    logger.debug('Senha inválida', { userId: usuario.id });
    return null;
  }

  // Verificar se o usuário está aprovado (admin sempre aprovado)
  // COMPATIBILIDADE RETROATIVA: Se aprovado for null/undefined, tratar como true
  // Isso permite que usuários antigos (criados antes do campo aprovado) possam logar
  const aprovadoFinal = usuario.aprovado ?? true;
  if (usuario.tipo !== 'admin' && aprovadoFinal === false) {
    logger.debug('Usuário não aprovado', { userId: usuario.id });
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
