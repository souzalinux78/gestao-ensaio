import { getConfig } from './config-cache';
import { logger } from './logger';

/**
 * Envia notificação de novo cadastro para o administrador via webhook
 */
export async function notificarNovoCadastro(
  usuario: {
    nome: string;
    email: string;
    telefone?: string | null;
    tipo: string;
  },
  tenantId: number | null = 1
): Promise<void> {
  try {
    const config = await getConfig(tenantId);
    
    if (!config || !config.webhook) {
      logger.info('Webhook não configurado, pulando notificação de novo cadastro');
      return;
    }

    const dados = {
      tipo: 'novo_cadastro',
      timestamp: new Date().toISOString(),
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone || null,
        tipo: usuario.tipo,
      },
      mensagem: `Novo cadastro realizado: ${usuario.nome} (${usuario.email}) - ${usuario.tipo}`,
    };

    const response = await fetch(config.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      throw new Error(`Webhook retornou status ${response.status}`);
    }

    logger.info('Notificação de novo cadastro enviada com sucesso', { email: usuario.email });
  } catch (error: any) {
    // Não bloquear o cadastro se o webhook falhar
    logger.error('Erro ao enviar notificação de novo cadastro', error);
  }
}

/**
 * Envia notificação de aprovação para o usuário via webhook
 */
export async function notificarAprovacao(
  usuario: {
    nome: string;
    email: string;
    telefone?: string | null;
  },
  tenantId: number | null = 1
): Promise<void> {
  try {
    const config = await getConfig(tenantId);
    
    if (!config || !config.webhook) {
      logger.info('Webhook não configurado, pulando notificação de aprovação');
      return;
    }

    const dados = {
      tipo: 'aprovacao_cadastro',
      timestamp: new Date().toISOString(),
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone || null,
      },
      mensagem: `Seu cadastro foi aprovado! Você já pode acessar o sistema Gestão de Ensaio.`,
    };

    const response = await fetch(config.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      throw new Error(`Webhook retornou status ${response.status}`);
    }

    logger.info('Notificação de aprovação enviada com sucesso', { email: usuario.email });
  } catch (error: any) {
    // Não bloquear a aprovação se o webhook falhar
    logger.error('Erro ao enviar notificação de aprovação', error);
  }
}
