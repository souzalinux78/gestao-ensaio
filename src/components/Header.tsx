'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { removerSessao, obterSessao } from '@/lib/session';
import { Usuario } from '@/types';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const sessao = obterSessao();
    setUsuario(sessao);
  }, []);

  const navItems = useMemo(
    () => [
      { href: '/instrutor', label: 'Inicio' },
      { href: '/instrutor/novo-ensaio', label: 'Novo Ensaio' },
      { href: '/instrutor/musicos', label: 'Musicos' },
      { href: '/instrutor/contatos', label: 'Contatos' },
    ],
    []
  );

  const handleLogout = () => {
    removerSessao();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/instrutor') {
      return pathname === '/instrutor';
    }
    return pathname?.startsWith(href);
  };

  const inicial = (usuario?.nome?.trim().charAt(0) || 'U').toUpperCase();

  return (
    <header className="px-4 sm:px-6 pt-4 sm:pt-6">
      <div className="portal-topbar rounded-2xl px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="portal-brand-icon flex items-center justify-center text-xl font-semibold">♪</div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">GESTAO DE ENSAIO</h1>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-tertiary)] truncate">
                Portal de Gestao de Ensaio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {usuario?.email && (
              <span className="hidden md:inline text-xs text-[var(--text-secondary)] max-w-[220px] truncate">{usuario.email}</span>
            )}
            <ThemeToggle />
            <div className="h-10 w-10 rounded-full bg-[var(--accent-soft)] border border-[var(--border-default)] text-[var(--accent-primary)] font-semibold flex items-center justify-center">
              {inicial}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-[#f0c7cc] bg-[#fff3f5] hover:bg-[#ffe9ed] text-[#d14758] px-3 py-2 text-sm font-semibold transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        <nav className="mt-3 pt-3 border-t border-[var(--border-default)] flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold border transition-colors ${
                  active
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--accent-primary)]'
                    : 'border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
