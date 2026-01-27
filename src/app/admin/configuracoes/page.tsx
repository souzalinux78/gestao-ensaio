'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import WebhookConfig from '@/components/WebhookConfig';
import ContatosManager from '@/components/ContatosManager';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<'webhook' | 'contatos'>('webhook');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-secondary)]">
      <Header />
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary dark:text-[var(--text-primary)]">Configurações</h1>
        </div>

        {/* Abas */}
        <div className="border-b border-gray-200 dark:border-[var(--border-primary)] mb-6 bg-white dark:bg-[var(--bg-primary)] rounded-t-lg">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => setAbaAtiva('webhook')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                abaAtiva === 'webhook'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Webhook
            </button>
            <button
              onClick={() => setAbaAtiva('contatos')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                abaAtiva === 'contatos'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Contatos
            </button>
          </div>
        </div>

        {/* Conteúdo das abas */}
        {abaAtiva === 'webhook' && <WebhookConfig />}
        {abaAtiva === 'contatos' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>Nota:</strong> Os contatos agora são gerenciados individualmente por cada instrutor. 
              Cada instrutor pode gerenciar seus próprios contatos na área do instrutor (menu "Meus Contatos").
              Quando um relatório for gerado, os dados serão enviados apenas para os contatos daquele instrutor específico.
          </p>
                </div>
              )}
            </div>
          </div>
    </AdminLayout>
  );
}
