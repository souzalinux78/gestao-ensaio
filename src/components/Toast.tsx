'use client';

import { useEffect } from 'react';
import Alert from './Alert';

interface ToastProps {
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
  texto: string;
  onClose: () => void;
  duracao?: number;
}

export default function Toast({ tipo, texto, onClose, duracao = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duracao);

    return () => clearTimeout(timer);
  }, [onClose, duracao]);

  const borderColors = {
    sucesso: 'border-l-green-500',
    erro: 'border-l-red-500',
    aviso: 'border-l-yellow-500',
    info: 'border-l-blue-500',
  };

  return (
    <div className="animate-slide-in-right max-w-md w-full sm:w-auto">
      <div className={`bg-white rounded-xl shadow-strong p-4 border-l-4 ${borderColors[tipo]} backdrop-blur-sm`}>
        <Alert tipo={tipo} texto={texto} onClose={onClose} />
      </div>
    </div>
  );
}
