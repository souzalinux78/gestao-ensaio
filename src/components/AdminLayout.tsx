'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { removerSessao, obterSessao } from '@/lib/session';
import { Usuario } from '@/types';
import ThemeToggle from './ThemeToggle';

interface AdminLayoutProps {
  children: React.ReactNode;
}

type MenuIcon = 'home' | 'users' | 'building' | 'chart' | 'logs' | 'settings';

function SidebarIcon({ icon }: { icon: MenuIcon }) {
  const baseClass = 'w-5 h-5';

  switch (icon) {
    case 'home':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5L12 4l9 7.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 10.5V20h13V10.5" />
        </svg>
      );
    case 'users':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-1.3a3.2 3.2 0 00-3.2-3.2H7.2A3.2 3.2 0 004 19.7V21" />
          <circle cx="10" cy="8.3" r="3.3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 8.8a3 3 0 010 5.9M23 21v-1.1a3 3 0 00-2.2-2.9" />
        </svg>
      );
    case 'building':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16M6 21V7l6-3 6 3v14M9 10h2m-2 4h2m4-4h2m-2 4h2" />
        </svg>
      );
    case 'chart':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M7 16V9m5 7V5m5 11v-6" />
        </svg>
      );
    case 'logs':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );
    case 'settings':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.4 3.6a1 1 0 011.2-.7l1.3.3a1 1 0 01.8.9l.1 1.2a7.6 7.6 0 011.4.8l1-.6a1 1 0 011.2.2l.9 1a1 1 0 01.1 1.2l-.6 1a7.8 7.8 0 01.5 1.5l1.2.2a1 1 0 01.8 1v1.3a1 1 0 01-.8 1l-1.2.2a8 8 0 01-.5 1.4l.6 1a1 1 0 01-.1 1.2l-.9 1a1 1 0 01-1.2.2l-1-.6a8.6 8.6 0 01-1.4.8l-.1 1.2a1 1 0 01-.8.9l-1.3.3a1 1 0 01-1.2-.7l-.4-1.1a8.5 8.5 0 01-1.6 0l-.4 1.1a1 1 0 01-1.2.7l-1.3-.3a1 1 0 01-.8-.9l-.1-1.2a8.6 8.6 0 01-1.4-.8l-1 .6a1 1 0 01-1.2-.2l-.9-1a1 1 0 01-.1-1.2l.6-1A8 8 0 013 13.8l-1.2-.2a1 1 0 01-.8-1v-1.3a1 1 0 01.8-1l1.2-.2A7.8 7.8 0 013.5 8l-.6-1a1 1 0 01.1-1.2l.9-1a1 1 0 011.2-.2l1 .6a7.6 7.6 0 011.4-.8l.1-1.2a1 1 0 01.8-.9l1.3-.3a1 1 0 011.2.7l.4 1.1a8.5 8.5 0 011.6 0l.4-1.1z" />
          <circle cx="12" cy="12" r="3.1" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const sessao = obterSessao();
    if (!sessao) {
      router.push('/login');
      return;
    }
    if (sessao.tipo !== 'admin') {
      router.push('/instrutor');
      return;
    }
    setUsuario(sessao);
  }, [router]);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuAberto]);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  const menuItems = useMemo(
    () => [
      { href: '/admin', label: 'Inicio', icon: 'home' as const },
      { href: '/admin/usuarios', label: 'Usuarios', icon: 'users' as const },
      { href: '/admin/tenants', label: 'Tenants', icon: 'building' as const },
      { href: '/admin/metricas', label: 'Metricas', icon: 'chart' as const },
      { href: '/admin/logs', label: 'Logs', icon: 'logs' as const },
      { href: '/admin/configuracoes', label: 'Ajustes', icon: 'settings' as const },
    ],
    []
  );

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = () => {
    removerSessao();
    router.push('/login');
  };

  if (!usuario) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Carregando...</p>
        </div>
      </div>
    );
  }

  const primeiroNome = usuario.nome.split(' ')[0] || 'Usuario';
  const inicial = (usuario.nome.trim().charAt(0) || 'U').toUpperCase();

  return (
    <div className="portal-shell lg:flex">
      {menuAberto && (
        <button
          className="fixed inset-0 bg-black/45 z-40 lg:hidden"
          onClick={() => setMenuAberto(false)}
          aria-label="Fechar menu lateral"
        />
      )}

      <aside
        className={`portal-sidebar fixed lg:sticky top-0 left-0 bottom-0 z-50 lg:z-20 flex flex-col transition-transform duration-300 ${
          menuAberto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="portal-brand p-6">
          <div className="flex items-center gap-3">
            <div className="portal-brand-icon flex items-center justify-center text-2xl font-semibold">♪</div>
            <div>
              <p className="text-[28px] leading-none font-semibold text-[var(--text-primary)]">GESTAO</p>
              <p className="text-[11px] tracking-[0.34em] font-semibold text-[var(--accent-primary)]">ENSAIO</p>
            </div>
          </div>
        </div>

        <nav className="px-4 py-5 space-y-1.5">
          <p className="px-2 pb-2 text-[11px] uppercase tracking-[0.28em] text-[var(--text-tertiary)] font-semibold">
            Menu Principal
          </p>
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className={`portal-nav-item ${active ? 'is-active' : ''}`}>
                <span className="text-inherit">
                  <SidebarIcon icon={item.icon} />
                </span>
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[var(--border-default)] p-4">
          <div className="portal-user-card rounded-2xl px-3 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[var(--accent-soft)] text-[var(--accent-primary)] font-bold flex items-center justify-center">
              {inicial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{usuario.nome}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--accent-primary)] font-semibold truncate">
                Admin Sistema
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-xl border border-[#f0c7cc] bg-[#fff3f5] hover:bg-[#ffe9ed] text-[#d14758] font-semibold text-sm px-3 py-2 transition-colors"
          >
            Sair do Sistema
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="portal-topbar rounded-2xl px-4 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMenuAberto((value) => !value)}
                className="lg:hidden h-10 w-10 rounded-xl border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)]"
                aria-label="Abrir menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">Ola, {primeiroNome}!</h1>
                <p className="text-[11px] sm:text-xs tracking-[0.3em] uppercase text-[var(--text-tertiary)] truncate">
                  Portal de Gestao de Ensaio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <div className="hidden sm:flex h-11 w-11 rounded-full bg-[var(--accent-soft)] text-[var(--accent-primary)] items-center justify-center border border-[var(--border-default)] font-semibold">
                {inicial}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 py-4 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
