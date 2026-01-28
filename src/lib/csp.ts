/**
 * Content Security Policy (CSP)
 * Define políticas de segurança para recursos carregados pela aplicação
 */

export interface CSPDirectives {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  connectSrc?: string[];
  fontSrc?: string[];
  objectSrc?: string[];
  mediaSrc?: string[];
  frameSrc?: string[];
  workerSrc?: string[];
  manifestSrc?: string[];
  formAction?: string[];
  baseUri?: string[];
  frameAncestors?: string[];
  upgradeInsecureRequests?: boolean;
  blockAllMixedContent?: boolean;
}

/**
 * Gera string CSP a partir das diretivas
 */
export function generateCSP(directives: CSPDirectives): string {
  const parts: string[] = [];

  if (directives.defaultSrc) {
    parts.push(`default-src ${directives.defaultSrc.join(' ')}`);
  }

  if (directives.scriptSrc) {
    parts.push(`script-src ${directives.scriptSrc.join(' ')}`);
  }

  if (directives.styleSrc) {
    parts.push(`style-src ${directives.styleSrc.join(' ')}`);
  }

  if (directives.imgSrc) {
    parts.push(`img-src ${directives.imgSrc.join(' ')}`);
  }

  if (directives.connectSrc) {
    parts.push(`connect-src ${directives.connectSrc.join(' ')}`);
  }

  if (directives.fontSrc) {
    parts.push(`font-src ${directives.fontSrc.join(' ')}`);
  }

  if (directives.objectSrc) {
    parts.push(`object-src ${directives.objectSrc.join(' ')}`);
  }

  if (directives.mediaSrc) {
    parts.push(`media-src ${directives.mediaSrc.join(' ')}`);
  }

  if (directives.frameSrc) {
    parts.push(`frame-src ${directives.frameSrc.join(' ')}`);
  }

  if (directives.workerSrc) {
    parts.push(`worker-src ${directives.workerSrc.join(' ')}`);
  }

  if (directives.manifestSrc) {
    parts.push(`manifest-src ${directives.manifestSrc.join(' ')}`);
  }

  if (directives.formAction) {
    parts.push(`form-action ${directives.formAction.join(' ')}`);
  }

  if (directives.baseUri) {
    parts.push(`base-uri ${directives.baseUri.join(' ')}`);
  }

  if (directives.frameAncestors) {
    parts.push(`frame-ancestors ${directives.frameAncestors.join(' ')}`);
  }

  if (directives.upgradeInsecureRequests) {
    parts.push('upgrade-insecure-requests');
  }

  if (directives.blockAllMixedContent) {
    parts.push('block-all-mixed-content');
  }

  return parts.join('; ');
}

/**
 * CSP padrão para a aplicação
 * Ajuste conforme necessário para suas necessidades
 */
export function getDefaultCSP(): string {
  const isDev = process.env.NODE_ENV === 'development';
  
  const directives: CSPDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      // Permitir inline scripts apenas em desenvolvimento (Next.js precisa)
      ...(isDev ? ["'unsafe-inline'", "'unsafe-eval'"] : ["'unsafe-inline'"]),
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Tailwind e estilos inline
    ],
    imgSrc: [
      "'self'",
      'data:', // Para imagens base64
      'blob:', // Para imagens blob
    ],
    connectSrc: [
      "'self'",
      // Adicione APIs externas aqui se necessário
    ],
    fontSrc: [
      "'self'",
      'data:', // Para fontes base64
    ],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    workerSrc: [
      "'self'",
      'blob:', // Service Workers
    ],
    manifestSrc: ["'self'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production',
  };

  return generateCSP(directives);
}

/**
 * CSP mais restritivo (recomendado para produção)
 */
export function getStrictCSP(): string {
  const directives: CSPDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      // Nonce ou hash devem ser usados em vez de 'unsafe-inline'
      // Por enquanto, permitimos inline para compatibilidade
      "'unsafe-inline'",
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Necessário para Tailwind
    ],
    imgSrc: ["'self'", 'data:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    workerSrc: ["'self'", 'blob:'],
    manifestSrc: ["'self'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: true,
    blockAllMixedContent: true,
  };

  return generateCSP(directives);
}
