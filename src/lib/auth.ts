import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { Usuario, TipoUsuario } from '@/types';

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
    console.log(`[AUTH] Usuário não encontrado para email: ${emailNormalizado}`);
    return null;
  }

  // Verificar se a senha está hasheada (começa com $2a$ ou $2b$)
  const senhaEstaHasheada = usuario.senha.startsWith('$2a$') || usuario.senha.startsWith('$2b$');
  
  if (!senhaEstaHasheada) {
    console.log(`[AUTH] Senha do usuário ${emailNormalizado} não está hasheada!`);
    // Se a senha não está hasheada, comparar diretamente (para migração)
    if (usuario.senha === senha) {
      // Re-hashear a senha
      const senhaHash = await bcrypt.hash(senha, 10);
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { senha: senhaHash },
      });
      // Verificar se o usuário está aprovado (admin sempre aprovado)
      if (usuario.tipo !== 'admin' && !usuario.aprovado) {
        console.log(`[AUTH] Usuário ${emailNormalizado} não está aprovado`);
        return null;
      }

      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo as TipoUsuario,
        igreja: usuario.igreja,
        aprovado: usuario.aprovado,
      };
    }
    return null;
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    console.log(`[AUTH] Senha inválida para usuário: ${emailNormalizado}`);
    return null;
  }

  // Verificar se o usuário está aprovado (admin sempre aprovado)
  if (usuario.tipo !== 'admin' && !usuario.aprovado) {
    console.log(`[AUTH] Usuário ${emailNormalizado} não está aprovado`);
    return null;
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo as TipoUsuario,
    igreja: usuario.igreja,
    aprovado: usuario.aprovado,
  };
}

export async function criarUsuario(
  nome: string,
  email: string,
  senha: string,
  tipo: TipoUsuario,
  igreja?: string | null
) {
  const senhaHash = await bcrypt.hash(senha, 10);
  // Admin sempre aprovado, instrutor não aprovado por padrão
  const aprovado = tipo === 'admin';
  return prisma.usuario.create({
    data: { nome, email, senha: senhaHash, tipo, igreja: igreja || null, aprovado },
  });
}

export async function alterarSenha(usuarioId: number, novaSenha: string) {
  const senhaHash = await bcrypt.hash(novaSenha, 10);
  return prisma.usuario.update({
    where: { id: usuarioId },
    data: { senha: senhaHash },
  });
}
