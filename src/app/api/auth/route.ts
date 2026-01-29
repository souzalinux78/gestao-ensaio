import { NextRequest, NextResponse } from 'next/server';
import { verificarCredenciais } from '@/lib/auth';
import { validateEmail, validatePassword } from '@/lib/validators';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 tentativas por IP a cada 15 minutos
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const rateLimit = checkRateLimit(`auth:${ip}`, 5, 15 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      logger.warn('Tentativa de login bloqueada por rate limit', { ip });
      return NextResponse.json(
        { 
          error: 'Muitas tentativas de login. Aguarde 15 minutos antes de tentar novamente.',
          resetTime: rateLimit.resetTime,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '900', // 15 minutos em segundos
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar entrada básica
    if (!validateEmail(email)) {
      logger.warn('Email inválido no login', { email });
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validação básica de senha (não vazia)
    // Não bloquear por critérios de complexidade - pode ser senha antiga
    // A validação completa será feita em verificarCredenciais
    if (!senha || senha.trim().length === 0) {
      logger.warn('Senha vazia no login', { email: email.trim().toLowerCase() });
      return NextResponse.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      );
    }

    // Normalizar email
    const emailNormalizado = email.trim().toLowerCase();
    const senhaNormalizada = senha.trim();
    logger.info('Tentativa de login', { email: emailNormalizado });

    const usuario = await verificarCredenciais(emailNormalizado, senhaNormalizada);

    if (!usuario) {
      logger.warn('Credenciais inválidas', { email: emailNormalizado });
      return NextResponse.json(
        { error: 'Credenciais inválidas. Verifique o email e senha.' },
        { 
          status: 401,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    // A validação de aprovação já foi feita em verificarCredenciais
    // Admin sempre aprovado, usuários antigos são tratados como aprovados
    // Se chegou aqui, o usuário está aprovado ou é admin
    logger.debug('Validação de aprovação passou', { 
      userId: usuario.id, 
      tipo: usuario.tipo, 
      aprovado: usuario.aprovado 
    });

    logger.info('Login realizado com sucesso', { userId: usuario.id, tipo: usuario.tipo });
    
    // Gerar tokens JWT
    const accessToken = generateAccessToken(usuario);
    
    // Criar refresh token no banco
    const tokenId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias
    
    const refreshTokenValue = generateRefreshToken(usuario.id, tokenId);
    
    // Salvar refresh token no banco
    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        token: refreshTokenValue,
        userId: usuario.id,
        expiresAt,
      },
    });
    
    // Criar resposta com tokens e dados do usuário
    const response = NextResponse.json(
      {
        // Dados do usuário (compatibilidade com sistema antigo)
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        igreja: usuario.igreja,
        aprovado: usuario.aprovado ?? true, // Compatibilidade retroativa
        // Tokens JWT (novo sistema)
        accessToken,
        refreshToken: refreshTokenValue, // Também no body para compatibilidade
      },
      {
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        },
      }
    );
    
    // Adicionar refresh token em cookie httpOnly (mais seguro)
    response.cookies.set('refreshToken', refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 dias em segundos
      path: '/',
    });
    
    return response;
  } catch (error: any) {
    logger.error('Erro no login', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login. Tente novamente.' },
      { status: 500 }
    );
  }
}
