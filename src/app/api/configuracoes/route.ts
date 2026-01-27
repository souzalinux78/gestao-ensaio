import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { obterUsuarioDaRequisicao } from '@/lib/get-user-from-request';
import { getConfig, clearConfigCache } from '@/lib/config-cache';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const usuario = await obterUsuarioDaRequisicao(request);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se o modelo existe
    if (!prisma.configuracoes) {
      return NextResponse.json(
        { error: 'Prisma Client não foi regenerado. Execute: npm run db:generate' },
        { status: 500 }
      );
    }

    // Buscar configuração com cache
    const config = await getConfig();

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Erro na API de configurações:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao carregar configurações',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se é admin
    const usuario = await obterUsuarioDaRequisicao(request);
    if (!usuario || usuario.tipo !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem configurar webhooks.' },
        { status: 403 }
      );
    }

    const { webhook } = await request.json();

    // Validar URL do webhook (proteção SSRF)
    if (webhook && typeof webhook === 'string') {
      let url: URL;
      try {
        url = new URL(webhook);
      } catch {
        return NextResponse.json(
          { error: 'URL do webhook inválida' },
          { status: 400 }
        );
      }

      // Apenas HTTPS permitido
      if (url.protocol !== 'https:') {
        return NextResponse.json(
          { error: 'Webhook deve usar HTTPS' },
          { status: 400 }
        );
      }

      // Bloquear localhost e IPs privados (proteção SSRF)
      const hostname = url.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('172.17.') ||
        hostname.startsWith('172.18.') ||
        hostname.startsWith('172.19.') ||
        hostname.startsWith('172.20.') ||
        hostname.startsWith('172.21.') ||
        hostname.startsWith('172.22.') ||
        hostname.startsWith('172.23.') ||
        hostname.startsWith('172.24.') ||
        hostname.startsWith('172.25.') ||
        hostname.startsWith('172.26.') ||
        hostname.startsWith('172.27.') ||
        hostname.startsWith('172.28.') ||
        hostname.startsWith('172.29.') ||
        hostname.startsWith('172.30.') ||
        hostname.startsWith('172.31.')
      ) {
        return NextResponse.json(
          { error: 'Webhook não pode apontar para localhost ou IPs privados' },
          { status: 400 }
        );
      }
    }

    // Buscar configuração existente ou criar nova
    let config = await prisma.configuracoes.findFirst();

    if (config) {
      // Atualizar configuração existente
      config = await prisma.configuracoes.update({
        where: { id: config.id },
        data: {
          webhook: webhook || null,
        },
      });
    } else {
      // Criar nova configuração
      config = await prisma.configuracoes.create({
        data: {
          webhook: webhook || null,
        },
      });
    }

    // Limpar cache após atualização
    clearConfigCache();

    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
