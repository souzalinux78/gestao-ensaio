'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    // Esconder loading após 2 segundos ou quando página carregar
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);

    // Se página já carregou, esconder imediatamente
    if (document.readyState === 'complete') {
      setShow(false);
      clearTimeout(timer);
    }

    const handleLoad = () => {
      setShow(false);
      clearTimeout(timer);
    };

    window.addEventListener('load', handleLoad);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-primary">
      <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in">
        {/* Logo ou Ícone */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
          {!logoError ? (
            <img
              src="/logo.png"
              alt="Gestão de Ensaio"
              className="w-full h-full object-contain animate-pulse"
              onError={() => setLogoError(true)}
            />
          ) : (
            <svg className="w-24 h-24 text-accent animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          )}
        </div>

        {/* Nome do App */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Gestão de Ensaio
          </h1>
          <p className="text-white/80 text-sm sm:text-base">
            Carregando...
          </p>
        </div>

        {/* Spinner */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
