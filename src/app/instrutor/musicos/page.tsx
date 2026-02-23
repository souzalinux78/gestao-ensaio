'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import MusicosManager from '@/components/MusicosManager';
import { obterSessao } from '@/lib/session';

export default function MusicosPage() {
  const router = useRouter();
  useEffect(() => {
    const sessao = obterSessao();
    if (!sessao) {
      router.push('/login');
      return;
    }
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
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Cadastro de Músicos</h1>
        </div>

        <p className="mb-6 bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] p-4 rounded-xl shadow-sm">
          Cadastre os músicos vinculados ao seu instrutor. Somente você verá e poderá selecionar
          esses músicos no ensaio.
        </p>

        <MusicosManager />
      </div>
    </div>
  );
}
