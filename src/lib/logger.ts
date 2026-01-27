/**
 * Sistema de logging centralizado
 * Remove dados sensíveis e padroniza logs
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (process.env.NODE_ENV === 'production') {
      // Em produção, apenas erros e warnings
      return level === 'error' || level === 'warn';
    }
    return true;
  }

  private sanitizeContext(context: LogContext): LogContext {
    const sanitized = { ...context };
    // Remover dados sensíveis
    if (sanitized.email) {
      sanitized.email = this.maskEmail(sanitized.email);
    }
    if (sanitized.senha || sanitized.password) {
      sanitized.senha = '[REDACTED]';
      sanitized.password = '[REDACTED]';
    }
    return sanitized;
  }

  private maskEmail(email: string): string {
    if (!email || typeof email !== 'string') return '[INVALID]';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.length > 2 
      ? `${local.substring(0, 2)}***` 
      : '***';
    return `${maskedLocal}@${domain}`;
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog('info')) return;
    const sanitized = context ? this.sanitizeContext(context) : undefined;
    console.info(`[INFO] ${message}`, sanitized || '');
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog('warn')) return;
    const sanitized = context ? this.sanitizeContext(context) : undefined;
    console.warn(`[WARN] ${message}`, sanitized || '');
  }

  error(message: string, error?: Error | any, context?: LogContext) {
    if (!this.shouldLog('error')) return;
    const sanitized = context ? this.sanitizeContext(context) : undefined;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] ${message}`, {
      error: errorMessage,
      ...sanitized,
    });
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development' && this.shouldLog('debug')) {
      const sanitized = context ? this.sanitizeContext(context) : undefined;
      console.debug(`[DEBUG] ${message}`, sanitized || '');
    }
  }
}

export const logger = new Logger();
