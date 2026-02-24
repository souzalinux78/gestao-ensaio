'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import RelatorioTable from '@/components/RelatorioTable';
import { Ensaio, Instrumento, Usuario } from '@/types';
import { gerarPDFEnsaio } from '@/lib/pdf';
import { obterSessao } from '@/lib/session';

export default function InstrutorPage() {
  const router = useRouter();
  const [ensaios, setEnsaios] = useState<Ensaio[]>([]);
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const sessao = obterSessao();
    if (!sessao) {
      router.push('/login');
      return;
    }
    setUsuario(sessao);
    carregarDados(sessao.id);
  }, [router]);

  async function carregarDados(instrutorId: number) {
    const [resEnsaios, resInstrumentos] = await Promise.all([
      fetch(`/api/ensaios?instrutorId=${instrutorId}`),
      fetch('/api/instrumentos'),
    ]);
    setEnsaios(await resEnsaios.json());
    setInstrumentos(await resInstrumentos.json());
  }

  async function handleGerarPDF(ensaio: Ensaio) {
    // Gerar e baixar o PDF
    const pdf = await gerarPDFEnsaio(ensaio, instrumentos);
    pdf.save(`ensaio-${ensaio.id}.pdf`);

    // Enviar dados para o webhook
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ensaioId: ensaio.id }),
      });

      if (res.ok) {
        // Silencioso - não mostrar alerta para instrutor
      } else {
        console.error('Erro ao enviar webhook');
      }
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
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
    <div className="portal-shell">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Meus Ensaios</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => router.push('/instrutor/contatos')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors font-medium"
            >
              Meus Contatos
            </button>
            <button
              onClick={() => router.push('/instrutor/musicos')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors font-medium"
            >
              Cadastro de Musicos
            </button>
            <button
              onClick={() => router.push('/instrutor/novo-ensaio')}
              className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Novo Ensaio
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
    </div>
  );
}
