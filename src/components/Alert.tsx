'use client';

interface AlertProps {
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
  texto: string;
  onClose?: () => void;
  className?: string;
}

export default function Alert({ tipo, texto, onClose, className = '' }: AlertProps) {
  const tipoClasses = {
    sucesso: 'alert-success',
    erro: 'alert-error',
    aviso: 'alert-warning',
    info: 'alert-info',
  };

  const icons = {
    sucesso: '✓',
    erro: '✕',
    aviso: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`alert ${tipoClasses[tipo]} ${className} flex items-start gap-3`}>
      <span className="text-lg font-semibold flex-shrink-0">{icons[tipo]}</span>
      <p className="flex-1 text-sm sm:text-base">{texto}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Fechar"
        >
          ✕
        </button>
      )}
    </div>
  );
}
