'use client';

import { useEffect, useState } from 'react';
import Alert from './Alert';

interface ToastProps {
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
  texto: string;
  onClose: () => void;
  duracao?: number;
}

export default function Toast({ tipo, texto, onClose, duracao = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duracao);

    return () => clearTimeout(timer);
  }, [duracao]);

  function handleClose() {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // Tempo da animação de saída
  }

  if (!isVisible) return null;

  const borderColors = {
    sucesso: 'border-l-green-500',
    erro: 'border-l-red-500',
    aviso: 'border-l-yellow-500',
    info: 'border-l-blue-500',
  };

  const bgColors = {
    sucesso: 'bg-green-50 dark:bg-green-900/20',
    erro: 'bg-red-50 dark:bg-red-900/20',
    aviso: 'bg-yellow-50 dark:bg-yellow-900/20',
    info: 'bg-blue-50 dark:bg-blue-900/20',
  };

  return (
    <div 
      className={`
        max-w-md w-full sm:w-auto
        transform transition-all duration-300 ease-out
        ${isExiting 
          ? 'translate-x-full opacity-0 scale-95' 
          : 'translate-x-0 opacity-100 scale-100'
        }
      `}
    >
      <div 
        className={`
          ${bgColors[tipo]}
          dark:bg-[var(--bg-primary)]
          rounded-xl shadow-strong p-4 border-l-4 ${borderColors[tipo]} 
          backdrop-blur-sm
          hover:shadow-glow
          transition-all duration-200
          cursor-pointer
        `}
        onClick={handleClose}
      >
        <Alert tipo={tipo} texto={texto} onClose={handleClose} />
      </div>
    </div>
  );
}
