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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary hover:text-primary-dark font-medium"
          >
            ← Voltar
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Cadastro de Músicos</h1>
        </div>

        <p className="text-gray-600 mb-6 bg-white p-4 rounded-lg shadow-sm">
          Cadastre os músicos vinculados ao seu instrutor. Somente você verá e poderá selecionar
          esses músicos no ensaio.
        </p>

        <MusicosManager />
      </div>
    </div>
  );
}
