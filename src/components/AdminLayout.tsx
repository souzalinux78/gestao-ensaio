'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { removerSessao, obterSessao } from '@/lib/session';
import { Usuario } from '@/types';
import { useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

interface AdminLayoutProps {
  children: React.ReactNode;
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

  const handleLogout = () => {
    removerSessao();
    router.push('/login');
  };

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/usuarios', label: 'Usuários', icon: '👥' },
    { href: '/admin/tenants', label: 'Tenants', icon: '🏢' },
    { href: '/admin/metricas', label: 'Métricas', icon: '📈' },
    { href: '/admin/logs', label: 'Logs', icon: '📋' },
    { href: '/admin/configuracoes', label: 'Configurações', icon: '⚙️' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-[var(--text-secondary)]">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-secondary)]">
      {/* Header */}
      <header 
        className="text-[var(--pe-white)] p-3 sm:p-4 shadow-lg relative"
        style={{
          background: 'linear-gradient(90deg, #3a2f0f 0%, #d4af37 40%, #1a1a1a 100%)'
        }}
      >
        <div className="container mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="lg:hidden p-2 rounded-lg transition-colors flex-shrink-0"
              style={{ 
                color: 'var(--pe-white)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-soft)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold truncate" style={{ color: 'var(--text-inverse)' }}>Painel Admin</h1>
              <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--pe-gray-muted)' }}>
                {usuario.nome} {usuario.igreja && `- ${usuario.igreja}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ThemeToggle />
            <span className="text-xs sm:text-sm hidden md:inline truncate max-w-[120px] sm:max-w-none" style={{ color: 'var(--pe-gray-muted)' }}>{usuario.email}</span>
            <button
              onClick={handleLogout}
              className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm md:text-base transition-colors whitespace-nowrap"
              style={{
                backgroundColor: 'var(--color-error)',
                color: 'var(--text-inverse)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error)'}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside 
          className="hidden lg:block w-64 shadow-lg min-h-[calc(100vh-80px)] relative"
          style={{
            background: 'linear-gradient(90deg, #0b0b0b 0%, #1a1a1a 50%, #3a2f0f 100%)'
          }}
        >
          {/* Faixa dourada lateral visível */}
          <div className="absolute top-0 bottom-0 left-0 w-1" style={{ backgroundColor: 'var(--pe-gold-main)' }}></div>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
                  style={{
                    color: active ? 'var(--pe-white)' : 'var(--pe-gray-muted)',
                    backgroundColor: active ? 'var(--pe-gold-bg)' : 'transparent',
                    borderLeft: active ? '4px solid var(--pe-gold-main)' : '4px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'var(--pe-gold-bg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span className="text-xl" style={{ color: active ? 'var(--pe-gold-main)' : 'var(--pe-gray-muted)' }}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Sidebar - Mobile (Overlay) */}
        {menuAberto && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMenuAberto(false)}
            />
            <aside 
              className="fixed left-0 top-[80px] w-64 shadow-xl z-50 lg:hidden overflow-y-auto relative"
              style={{
                background: 'linear-gradient(90deg, #0b0b0b 0%, #1a1a1a 50%, #3a2f0f 100%)',
                height: 'calc(100dvh - 80px)',
                minHeight: 'calc(100dvh - 80px)',
                maxHeight: 'calc(100dvh - 80px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)'
              }}
            >
              {/* Faixa dourada lateral visível */}
              <div className="absolute top-0 bottom-0 left-0 w-1" style={{ backgroundColor: 'var(--pe-gold-main)' }}></div>
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuAberto(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
                      style={{
                        color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
                        backgroundColor: active ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                        borderLeft: active ? '4px solid var(--accent-primary)' : '4px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span className="text-xl" style={{ color: active ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </a>
                  );
                })}
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
