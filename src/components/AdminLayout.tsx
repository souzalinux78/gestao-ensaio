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
    { href: '/admin', label: '📊 Dashboard', icon: '📊' },
    { href: '/admin/usuarios', label: '👥 Usuários', icon: '👥' },
    { href: '/admin/tenants', label: '🏢 Tenants', icon: '🏢' },
    { href: '/admin/metricas', label: '📈 Métricas', icon: '📈' },
    { href: '/admin/logs', label: '📋 Logs', icon: '📋' },
    { href: '/admin/configuracoes', label: '⚙️ Configurações', icon: '⚙️' },
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
      <header className="bg-primary text-white p-3 sm:p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="lg:hidden p-2 hover:bg-primary-dark rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Painel Admin</h1>
              <p className="text-xs sm:text-sm text-white/80 truncate">
                {usuario.nome} {usuario.igreja && `- ${usuario.igreja}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs sm:text-sm text-white/80 hidden sm:inline">{usuario.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-red-600 text-sm sm:text-base transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-[var(--bg-primary)] shadow-lg min-h-[calc(100vh-80px)]">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)]'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Sidebar - Mobile (Overlay) */}
        {menuAberto && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMenuAberto(false)}
            />
            <aside className="fixed left-0 top-[80px] w-64 bg-white dark:bg-[var(--bg-primary)] shadow-xl h-[calc(100vh-80px)] z-50 lg:hidden overflow-y-auto">
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuAberto(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </a>
                ))}
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
