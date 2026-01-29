'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import RelatorioTable from '@/components/RelatorioTable';
import { Ensaio, Instrumento } from '@/types';
import { gerarPDFEnsaio } from '@/lib/pdf';
import { apiFetch } from '@/lib/api-client';

interface Metricas {
  periodo: string;
  usuarios: {
    total: number;
    instrutores: number;
    admins: number;
    aprovados: number;
    pendentes: number;
    novosNoPeriodo: number;
  };
  ensaios: {
    total: number;
    noPeriodo: number;
    porMes: Array<{ mes: string; total: number }>;
  };
  outros: {
    musicos: number;
    contatos: number;
  };
  tenants: {
    total: number;
    ativos: number;
  };
}

interface Log {
  id: string;
  tipo: string;
  acao: string;
  detalhes: string;
  timestamp: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [ensaios, setEnsaios] = useState<Ensaio[]>([]);
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [igrejaFiltro, setIgrejaFiltro] = useState('');

  useEffect(() => {
    carregarDados();
    carregarMetricas();
    carregarLogs();
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

  async function carregarMetricas() {
    try {
      const res = await apiFetch('/api/admin/metricas?periodo=30');
      if (res.ok) {
        const data = await res.json();
        setMetricas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  }

  async function carregarLogs() {
    try {
      const res = await apiFetch('/api/admin/logs?limit=5');
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  }

  function handleFiltrar() {
    carregarDados();
  }

  async function handleGerarPDF(ensaio: Ensaio) {
    const pdf = gerarPDFEnsaio(ensaio, instrumentos);
    pdf.save(`ensaio-${ensaio.id}.pdf`);

    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ensaioId: ensaio.id }),
      });
      if (res.ok) {
        alert('PDF gerado e dados enviados para o webhook com sucesso!');
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

  function formatarData(data: string) {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Calcular máximo para gráfico
  const maxEnsaios = metricas?.ensaios.porMes.reduce((max, item) => Math.max(max, item.total), 0) || 1;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Visão geral do sistema
          </p>
        </div>

        {/* Cards KPI - Grid */}
        {metricas && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Usuários */}
            <div className="rounded-lg shadow-md p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderLeft: '4px solid var(--accent-primary)' }}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)]">Total de Usuários</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-2">{metricas.usuarios.total}</p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1">
                    +{metricas.usuarios.novosNoPeriodo} no período
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl opacity-20 flex-shrink-0 ml-2">👥</div>
              </div>
            </div>

            {/* Total Ensaios */}
            <div className="rounded-lg shadow-md p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderLeft: '4px solid var(--accent-primary)' }}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)]">Total de Ensaios</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-2">{metricas.ensaios.total}</p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1">
                    {metricas.ensaios.noPeriodo} no período
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl opacity-20 flex-shrink-0 ml-2">📊</div>
              </div>
            </div>

            {/* Usuários Pendentes */}
            <div className="rounded-lg shadow-md p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderLeft: '4px solid var(--accent-primary)' }}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)]">Pendentes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-2">{metricas.usuarios.pendentes}</p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1">
                    Aguardando aprovação
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl opacity-20 flex-shrink-0 ml-2">⏳</div>
              </div>
            </div>

            {/* Tenants Ativos */}
            <div className="rounded-lg shadow-md p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderLeft: '4px solid var(--accent-primary)' }}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)]">Tenants Ativos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-2">
                    {metricas.tenants.ativos}/{metricas.tenants.total}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1">
                    Total de tenants
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl opacity-20 flex-shrink-0 ml-2">🏢</div>
              </div>
            </div>
          </div>
        )}

        {/* Gráficos e Atividades - Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Ensaios por Mês */}
          {metricas && metricas.ensaios.porMes.length > 0 && (
            <div className="rounded-lg shadow-md p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Ensaios por Mês (Últimos 6 meses)
              </h2>
              <div className="space-y-3">
                {metricas.ensaios.porMes.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-4">
                    <span className="w-20 sm:w-24 text-xs sm:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{item.mes}</span>
                    <div className="flex-1 rounded-full h-6 relative overflow-hidden min-w-0" style={{ backgroundColor: 'var(--bg-muted)' }}>
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{
                          width: `${Math.min((item.total / maxEnsaios) * 100, 100)}%`,
                          backgroundColor: 'var(--accent-primary)'
                        }}
                      >
                        {item.total > 0 && (
                          <span className="text-xs font-medium" style={{ color: 'var(--dark-primary)' }}>{item.total}</span>
                        )}
                      </div>
                    </div>
                    <span className="w-10 sm:w-12 text-right font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Últimas Atividades */}
          <div className="rounded-lg shadow-md p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Últimas Atividades
            </h2>
            {logs.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhuma atividade recente</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--bg-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-soft)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{log.acao}</p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">{log.detalhes}</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">
                        {formatarData(log.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas Adicionais - Grid */}
        {metricas && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-lg shadow-md p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Instrutores</p>
              <p className="text-xl sm:text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{metricas.usuarios.instrutores}</p>
            </div>
            <div className="rounded-lg shadow-md p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Músicos</p>
              <p className="text-xl sm:text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{metricas.outros.musicos}</p>
            </div>
            <div className="rounded-lg shadow-md p-4 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Contatos</p>
              <p className="text-xl sm:text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{metricas.outros.contatos}</p>
            </div>
          </div>
        )}

        {/* Relatórios de Ensaios */}
        <div>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Relatórios de Ensaios
            </h2>
          </div>

          <div className="mb-6 p-3 sm:p-4 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
                  Data Início
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-3 py-2 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-3 py-2 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
                  Igreja
                </label>
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
                className="w-full sm:w-auto px-6 py-2 rounded-lg transition-colors font-medium"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--dark-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
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
      </div>
    </AdminLayout>
  );
}
