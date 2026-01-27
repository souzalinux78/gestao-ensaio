import jwt, { SignOptions } from 'jsonwebtoken';
import { Usuario } from '@/types';

// Configurações JWT
const JWT_SECRET: string = process.env.JWT_SECRET || 'change-me-in-production-minimum-32-characters';
const ACCESS_TOKEN_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as string;
const REFRESH_TOKEN_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string;

// Tipos para payload dos tokens
export interface AccessTokenPayload {
  userId: number;
  tipo: 'admin' | 'instrutor';
  aprovado: boolean;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: number;
  tokenId: string; // UUID do refresh token no banco
  iat?: number;
  exp?: number;
}

/**
 * Gera um Access Token JWT
 * Expira em 15 minutos por padrão
 */
export function generateAccessToken(usuario: Usuario): string {
  const payload: AccessTokenPayload = {
    userId: usuario.id,
    tipo: usuario.tipo,
    aprovado: usuario.aprovado ?? false, // Garantir que seja boolean
  };

  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as string | number,
    issuer: 'gestao-ensaio',
    audience: 'gestao-ensaio-app',
  };
  
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Gera um Refresh Token JWT
 * Expira em 7 dias por padrão
 * tokenId deve ser o UUID do registro no banco
 */
export function generateRefreshToken(userId: number, tokenId: string): string {
  const payload: RefreshTokenPayload = {
    userId,
    tokenId,
  };

  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as string | number,
    issuer: 'gestao-ensaio',
    audience: 'gestao-ensaio-refresh',
  };
  
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Valida e decodifica um Access Token
 * Retorna o payload se válido, null se inválido
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'gestao-ensaio',
      audience: 'gestao-ensaio-app',
    }) as AccessTokenPayload;

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Valida e decodifica um Refresh Token
 * Retorna o payload se válido, null se inválido
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'gestao-ensaio',
      audience: 'gestao-ensaio-refresh',
    }) as RefreshTokenPayload;

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Decodifica token sem validar (apenas para debug/logs)
 * NÃO usar para autenticação!
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}
