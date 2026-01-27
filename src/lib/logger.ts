/**
 * Sistema de logging estruturado com Winston
 * Logs formatados em JSON para fácil análise
 */

import winston from 'winston';

// Interface para contexto de log com Request ID
export interface LogContext {
  requestId?: string;
  userId?: number;
  tenantId?: number;
  [key: string]: any;
}

// Criar diretório de logs se não existir
const logDir = process.env.LOG_DIR || 'logs';

// Formato personalizado para logs estruturados
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, requestId, userId, tenantId, ...meta } = info;
    
    // Estrutura de log padronizada
    const logEntry: any = {
      timestamp,
      level: level.toUpperCase(),
      message,
    };

    // Adicionar Request ID se disponível
    if (requestId) {
      logEntry.requestId = requestId;
    }

    // Adicionar contexto do usuário se disponível
    if (userId) {
      logEntry.userId = userId;
    }

    if (tenantId) {
      logEntry.tenantId = tenantId;
    }

    // Adicionar metadados adicionais
    if (Object.keys(meta).length > 0) {
      logEntry.meta = sanitizeContext(meta);
    }

    return JSON.stringify(logEntry);
  })
);

// Formato para console (desenvolvimento)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, requestId, userId, tenantId, ...meta } = info;
    let log = `${timestamp} [${level}] ${message}`;
    
    if (requestId) log += ` [RequestID: ${requestId}]`;
    if (userId) log += ` [UserID: ${userId}]`;
    if (tenantId) log += ` [TenantID: ${tenantId}]`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(sanitizeContext(meta), null, 2)}`;
    }
    
    return log;
  })
);

/**
 * Remove dados sensíveis do contexto de log
 */
function sanitizeContext(context: Record<string, any>): Record<string, any> {
  const sanitized = { ...context };
  const sensitiveKeys = ['senha', 'password', 'token', 'accessToken', 'refreshToken', 'authorization'];
  
  sensitiveKeys.forEach(key => {
    if (sanitized[key]) {
      sanitized[key] = '[REDACTED]';
    }
  });

  // Mascarar email
  if (sanitized.email && typeof sanitized.email === 'string') {
    const [local, domain] = sanitized.email.split('@');
    if (domain) {
      const maskedLocal = local.length > 2 
        ? `${local.substring(0, 2)}***` 
        : '***';
      sanitized.email = `${maskedLocal}@${domain}`;
    }
  }

  return sanitized;
}

// Configurar transportes
const transports: winston.transport[] = [
  // Console (sempre ativo)
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' 
      ? structuredFormat 
      : consoleFormat,
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  }),
];

// Adicionar transporte de arquivo em produção
if (process.env.NODE_ENV === 'production') {
  // Logs de erro
  transports.push(
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: 'error',
      format: structuredFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Logs combinados
  transports.push(
    new winston.transports.File({
      filename: `${logDir}/combined.log`,
      format: structuredFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Criar instância do logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: structuredFormat,
  transports,
  // Não sair do processo em caso de erro
  exitOnError: false,
});

/**
 * Classe helper para facilitar uso do logger com Request ID
 */
class LoggerWithContext {
  private requestId?: string;
  private userId?: number;
  private tenantId?: number;

  /**
   * Define o contexto da requisição
   */
  setContext(context: { requestId?: string; userId?: number; tenantId?: number }) {
    this.requestId = context.requestId;
    this.userId = context.userId;
    this.tenantId = context.tenantId;
  }

  /**
   * Limpa o contexto
   */
  clearContext() {
    this.requestId = undefined;
    this.userId = undefined;
    this.tenantId = undefined;
  }

  /**
   * Log de informação
   */
  info(message: string, context?: LogContext) {
    logger.info(message, {
      requestId: this.requestId,
      userId: this.userId,
      tenantId: this.tenantId,
      ...context,
    });
  }

  /**
   * Log de aviso
   */
  warn(message: string, context?: LogContext) {
    logger.warn(message, {
      requestId: this.requestId,
      userId: this.userId,
      tenantId: this.tenantId,
      ...context,
    });
  }

  /**
   * Log de erro
   */
  error(message: string, error?: Error | any, context?: LogContext) {
    const errorContext: LogContext = {
      requestId: this.requestId,
      userId: this.userId,
      tenantId: this.tenantId,
      ...context,
    };

    if (error instanceof Error) {
      errorContext.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    } else if (error) {
      errorContext.error = String(error);
    }

    logger.error(message, errorContext);
  }

  /**
   * Log de debug
   */
  debug(message: string, context?: LogContext) {
    logger.debug(message, {
      requestId: this.requestId,
      userId: this.userId,
      tenantId: this.tenantId,
      ...context,
    });
  }
}

// Exportar instância global com contexto
export const loggerWithContext = new LoggerWithContext();

// Exportar também o logger direto do Winston para compatibilidade
export default logger;
