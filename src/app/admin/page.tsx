'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import RelatorioTable from '@/components/RelatorioTable';
import { Ensaio, Instrumento } from '@/types';
import { gerarPDFEnsaio } from '@/lib/pdf';

export default function AdminPage() {
  const router = useRouter();
  const [ensaios, setEnsaios] = useState<Ensaio[]>([]);
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [igrejaFiltro, setIgrejaFiltro] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    if (igrejaFiltro && igrejaFiltro.trim() !== '') {
      params.append('igreja', igrejaFiltro.trim());
    }

    const [resEnsaios, resInstrumentos] = await Promise.all([
      fetch(`/api/ensaios?${params.toString()}`),
      fetch('/api/instrumentos'),
    ]);
    setEnsaios(await resEnsaios.json());
    setInstrumentos(await resInstrumentos.json());
  }

  function handleFiltrar() {
    carregarDados();
  }

  async function handleGerarPDF(ensaio: Ensaio) {
    // Gerar e baixar o PDF
    const pdf = gerarPDFEnsaio(ensaio, instrumentos);
    pdf.save(`ensaio-${ensaio.id}.pdf`);

    // Enviar dados para o webhook
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ensaioId: ensaio.id }),
      });

      if (res.ok) {
        alert('PDF gerado e dados enviados para o webhook com sucesso!');
      } else {
        const error = await res.json();
        console.error('Erro ao enviar webhook:', error);
        // Não mostrar erro para o usuário se o webhook falhar, apenas logar
      }
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      // Não mostrar erro para o usuário se o webhook falhar, apenas logar
    }
  }

  async function handleEnviarWebhook(ensaio: Ensaio) {
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ensaioId: ensaio.id }),
      });

      if (res.ok) {
        alert('Relatório enviado com sucesso!');
      } else {
        const error = await res.json();
        alert(`Erro ao enviar: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      alert('Erro ao enviar relatório. Tente novamente.');
    }
  }

  function handleEditar(ensaio: Ensaio) {
    router.push(`/instrutor/novo-ensaio?id=${ensaio.id}`);
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary dark:text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-gray-600 dark:text-[var(--text-secondary)] mt-1">
            Visão geral dos relatórios de ensaios
          </p>
        </div>

        <div className="mb-6 bg-white dark:bg-[var(--bg-primary)] p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-3 py-2 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-3 py-2 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">Igreja</label>
              <input
                type="text"
                value={igrejaFiltro}
                onChange={(e) => setIgrejaFiltro(e.target.value)}
                placeholder="Digite o nome da igreja"
                className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-3 py-2 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              />
            </div>
            <button
              onClick={handleFiltrar}
              className="w-full sm:w-auto bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Filtrar
            </button>
          </div>
        </div>

        <RelatorioTable
          ensaios={ensaios}
          instrumentos={instrumentos}
          onGerarPDF={handleGerarPDF}
          onEnviarWebhook={handleEnviarWebhook}
          onEditar={handleEditar}
        />
      </div>
    </AdminLayout>
  );
}
