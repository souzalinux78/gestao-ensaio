/**
 * Security Headers (Helmet-like)
 * Adiciona headers de segurança HTTP para proteção contra vulnerabilidades comuns
 */

import { NextResponse } from 'next/server';
import { getDefaultCSP } from './csp';

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | boolean;
  crossOriginEmbedderPolicy?: boolean;
  crossOriginOpenerPolicy?: boolean;
  crossOriginResourcePolicy?: boolean;
  dnsPrefetchControl?: boolean;
  frameguard?: { action?: 'deny' | 'sameorigin' };
  hidePoweredBy?: boolean;
  hsts?: {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  ieNoOpen?: boolean;
  noSniff?: boolean;
  originAgentCluster?: boolean;
  permittedCrossDomainPolicies?: boolean;
  referrerPolicy?: string;
  xssFilter?: boolean;
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  contentSecurityPolicy: false, // Será configurado separadamente
  crossOriginEmbedderPolicy: false, // Pode quebrar algumas funcionalidades
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: false,
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: false,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: 'strict-origin-when-cross-origin',
  xssFilter: true,
};

/**
 * Aplica headers de segurança a uma resposta
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = DEFAULT_CONFIG
): NextResponse {
  // X-Frame-Options (Frameguard)
  if (config.frameguard !== false) {
    const action = config.frameguard?.action || 'deny';
    response.headers.set('X-Frame-Options', action === 'deny' ? 'DENY' : 'SAMEORIGIN');
  }

  // X-Content-Type-Options (noSniff)
  if (config.noSniff !== false) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }

  // X-XSS-Protection (xssFilter)
  if (config.xssFilter !== false) {
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }

  // X-DNS-Prefetch-Control
  if (config.dnsPrefetchControl !== false) {
    response.headers.set('X-DNS-Prefetch-Control', 'off');
  }

  // X-Download-Options (IE)
  if (config.ieNoOpen !== false) {
    response.headers.set('X-Download-Options', 'noopen');
  }

  // Referrer-Policy
  if (config.referrerPolicy) {
    response.headers.set('Referrer-Policy', config.referrerPolicy);
  }

  // Cross-Origin-Opener-Policy
  if (config.crossOriginOpenerPolicy !== false) {
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  }

  // Cross-Origin-Embedder-Policy
  if (config.crossOriginEmbedderPolicy === true) {
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  }

  // Cross-Origin-Resource-Policy
  if (config.crossOriginResourcePolicy === true) {
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  }

  // Origin-Agent-Cluster
  if (config.originAgentCluster !== false) {
    response.headers.set('Origin-Agent-Cluster', '?1');
  }

  // Permissions-Policy (anteriormente Feature-Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Strict-Transport-Security (HSTS) - apenas em produção com HTTPS
  if (config.hsts !== false && process.env.NODE_ENV === 'production') {
    const hstsConfig = config.hsts || DEFAULT_CONFIG.hsts!;
    let hstsValue = `max-age=${hstsConfig.maxAge || 31536000}`;
    
    if (hstsConfig.includeSubDomains) {
      hstsValue += '; includeSubDomains';
    }
    
    if (hstsConfig.preload) {
      hstsValue += '; preload';
    }
    
    response.headers.set('Strict-Transport-Security', hstsValue);
  }

  // Remover X-Powered-By (hidePoweredBy)
  if (config.hidePoweredBy !== false) {
    response.headers.delete('X-Powered-By');
  }

  // Content-Security-Policy
  if (config.contentSecurityPolicy !== false) {
    const csp = typeof config.contentSecurityPolicy === 'string' 
      ? config.contentSecurityPolicy 
      : getDefaultCSP();
    response.headers.set('Content-Security-Policy', csp);
  }

  return response;
}

/**
 * Wrapper para aplicar headers de segurança automaticamente
 */
export function withSecurityHeaders(
  handler: () => Promise<NextResponse> | NextResponse,
  config?: SecurityHeadersConfig
): () => Promise<NextResponse> {
  return async () => {
    const response = await handler();
    return applySecurityHeaders(response, config);
  };
}
