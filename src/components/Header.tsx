'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removerSessao, obterSessao } from '@/lib/session';
import { useEffect, useState } from 'react';
import { Usuario } from '@/types';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const sessao = obterSessao();
    setUsuario(sessao);
  }, []);

  const handleLogout = () => {
    removerSessao();
    router.push('/login');
  };

  return (
    <header 
      className="p-3 sm:p-4 shadow-lg relative"
      style={{
        background: 'linear-gradient(90deg, #0b0b0b 0%, #1a1a1a 50%, #3a2f0f 100%)',
        color: 'var(--pe-white)'
      }}
    >
      {/* Faixa dourada visível no topo */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: 'var(--pe-gold-main)' }}></div>
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--pe-white)' }}>Gestão de Ensaio</h1>
          {usuario && (
            <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--pe-gray-muted)' }}>
              {usuario.nome} {usuario.igreja && `- ${usuario.igreja}`}
            </p>
          )}
        </div>
        <nav className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-end sm:items-center w-full sm:w-auto">
          {usuario && (
            <span className="text-xs sm:text-sm hidden sm:inline" style={{ color: 'var(--pe-gray-muted)' }}>{usuario.email}</span>
          )}
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base transition-colors w-full sm:w-auto"
            style={{
              backgroundColor: 'var(--color-error)',
              color: 'var(--text-inverse)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error)'}
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
