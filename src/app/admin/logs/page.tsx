'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { apiFetch } from '@/lib/api-client';

interface Log {
  id: string;
  tipo: string;
  acao: string;
  detalhes: string;
  timestamp: string;
  usuarioId?: number;
  ensaioId?: number;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    carregarLogs();
  }, [filtroTipo, page]);

  async function carregarLogs() {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '50');
      if (filtroTipo !== 'todos') {
        params.append('tipo', filtroTipo);
      }

      const res = await apiFetch(`/api/admin/logs?${params.toString()}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao carregar logs');
      }
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : data.data || []);
      setTotal(data.pagination?.total || data.length || 0);
    } catch (error: any) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setCarregando(false);
    }
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getTipoColor(tipo: string) {
    switch (tipo) {
      case 'criacao':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 'atualizacao':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      case 'login':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-primary dark:text-[var(--text-primary)]">Logs do Sistema</h1>
          <select
            value={filtroTipo}
            onChange={(e) => {
              setFiltroTipo(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto border rounded-lg px-4 py-2 transition-all duration-200"
            style={{
              borderColor: 'var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--pe-gold-strong)';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(47, 111, 235, 0.24)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="todos">Todos os tipos</option>
            <option value="criacao">Criações</option>
            <option value="atualizacao">Atualizações</option>
            <option value="login">Logins</option>
          </select>
        </div>

        {carregando ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-[var(--text-secondary)]">Carregando logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-lg shadow-sm p-8 text-center" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
            Nenhum log encontrado.
          </div>
        ) : (
          <>
            <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              {/* Versão Mobile: Cards */}
              <div className="block sm:hidden divide-y" style={{ borderColor: 'var(--border-default)' }}>
                {logs.map((log) => (
                  <div key={log.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            log.tipo === 'criacao'
                              ? 'bg-blue-500'
                              : log.tipo === 'atualizacao'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTipoColor(
                              log.tipo
                            )}`}
                          >
                            {log.tipo}
                          </span>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {formatarData(log.timestamp)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{log.acao}</p>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{log.detalhes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Versão Desktop: Tabela */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Data/Hora</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Ação</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
                    {logs.map((log, index) => (
                      <tr
                        key={log.id}
                        className="transition-colors"
                        style={{ 
                          backgroundColor: index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-page)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-page)'}
                      >
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {formatarData(log.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTipoColor(
                              log.tipo
                            )}`}
                          >
                            {log.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {log.acao}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{log.detalhes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginação */}
            {total > 50 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                    }
                  }}
                >
                  Anterior
                </button>
                <span style={{ color: 'var(--text-primary)' }}>
                  Página {page} de {Math.ceil(total / 50)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / 50)}
                  className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                    }
                  }}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
