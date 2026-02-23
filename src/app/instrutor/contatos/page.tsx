'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ContatosManager from '@/components/ContatosManager';
import { obterSessao } from '@/lib/session';
import { Usuario } from '@/types';

export default function ContatosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const sessao = obterSessao();
    if (!sessao) {
      router.push('/login');
      return;
    }
    setUsuario(sessao);
  }, [router]);

  return (
    <div className="portal-shell">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary hover:text-primary-dark font-medium"
          >
            ← Voltar
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Meus Contatos</h1>
        </div>

        <p className="mb-6 bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] p-4 rounded-xl shadow-sm">
          Gerencie seus contatos. Quando você gerar um relatório de ensaio, os dados serão enviados apenas para estes contatos.
        </p>

        <ContatosManager />
      </div>
    </div>
  );
}
