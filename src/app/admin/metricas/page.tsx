'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
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
    detalhes: Array<{
      id: number;
      nome: string;
      slug: string;
      ativo: boolean;
      _count: {
        usuarios: number;
        ensaios: number;
      };
    }>;
  };
}

export default function MetricasPage() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [periodo, setPeriodo] = useState('30');

  useEffect(() => {
    carregarMetricas();
  }, [periodo]);

  async function carregarMetricas() {
    setCarregando(true);
    try {
      const res = await apiFetch(`/api/admin/metricas?periodo=${periodo}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao carregar métricas');
      }
      const data = await res.json();
      setMetricas(data);
    } catch (error: any) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--pe-gold-main)', borderTopColor: 'transparent' }}></div>
          <p className="text-gray-600 dark:text-[var(--text-secondary)]">Carregando métricas...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!metricas) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-gray-500 dark:text-[var(--text-secondary)]">
          Erro ao carregar métricas
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--pe-gold-main)' }}>Métricas do Sistema</h1>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
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
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg shadow p-6 relative overflow-hidden" style={{ backgroundColor: 'var(--pe-white)', border: '1px solid var(--border-default)' }}>
            {/* Header dourado */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: 'var(--pe-gold-main)' }}></div>
            <h3 className="text-sm font-medium mb-2 mt-2" style={{ color: 'var(--pe-gray-muted)' }}>
              Total de Usuários
            </h3>
            <p className="text-3xl font-bold" style={{ color: 'var(--pe-gold-main)' }}>{metricas.usuarios.total}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--pe-gray-muted)' }}>
              {metricas.usuarios.novosNoPeriodo} novos no período
            </p>
          </div>

          <div className="rounded-lg shadow p-6 relative overflow-hidden" style={{ backgroundColor: 'var(--pe-white)', border: '1px solid var(--border-default)' }}>
            {/* Header dourado */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: 'var(--pe-gold-main)' }}></div>
            <h3 className="text-sm font-medium mb-2 mt-2" style={{ color: 'var(--pe-gray-muted)' }}>
              Total de Ensaios
            </h3>
            <p className="text-3xl font-bold" style={{ color: 'var(--pe-gold-main)' }}>{metricas.ensaios.total}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--pe-gray-muted)' }}>
              {metricas.ensaios.noPeriodo} no período
            </p>
          </div>

          <div className="rounded-lg shadow p-6 relative overflow-hidden" style={{ backgroundColor: 'var(--pe-white)', border: '1px solid var(--border-default)' }}>
            {/* Header dourado */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: 'var(--pe-gold-main)' }}></div>
            <h3 className="text-sm font-medium mb-2 mt-2" style={{ color: 'var(--pe-gray-muted)' }}>
              Usuários Pendentes
            </h3>
            <p className="text-3xl font-bold" style={{ color: 'var(--pe-gold-main)' }}>{metricas.usuarios.pendentes}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--pe-gray-muted)' }}>
              Aguardando aprovação
            </p>
          </div>

          <div className="rounded-lg shadow p-6 relative overflow-hidden" style={{ backgroundColor: 'var(--pe-white)', border: '1px solid var(--border-default)' }}>
            {/* Header dourado */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: 'var(--pe-gold-main)' }}></div>
            <h3 className="text-sm font-medium mb-2 mt-2" style={{ color: 'var(--pe-gray-muted)' }}>
              Tenants Ativos
            </h3>
            <p className="text-3xl font-bold" style={{ color: 'var(--pe-gold-main)' }}>
              {metricas.tenants.ativos} / {metricas.tenants.total}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--pe-gray-muted)' }}>
              Total de tenants
            </p>
          </div>
        </div>

        {/* Detalhamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usuários */}
          <div className="rounded-lg shadow p-6 relative overflow-hidden" style={{ backgroundColor: 'var(--pe-white)', border: '1px solid var(--border-default)' }}>
            {/* Header dourado */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: 'var(--pe-gold-main)' }}></div>
            <h2 className="text-lg font-semibold mb-4 mt-2" style={{ color: 'var(--pe-gold-main)' }}>Usuários</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--pe-gray-muted)' }}>Instrutores:</span>
                <span className="font-medium" style={{ color: 'var(--pe-gold-main)' }}>{metricas.usuarios.instrutores}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--pe-gray-muted)' }}>Administradores:</span>
                <span className="font-medium" style={{ color: 'var(--pe-gold-main)' }}>{metricas.usuarios.admins}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--pe-gray-muted)' }}>Aprovados:</span>
                <span className="font-medium" style={{ color: 'var(--pe-gold-main)' }}>{metricas.usuarios.aprovados}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--pe-gray-muted)' }}>Pendentes:</span>
                <span className="font-medium" style={{ color: 'var(--pe-gold-main)' }}>{metricas.usuarios.pendentes}</span>
              </div>
            </div>
          </div>

          {/* Outros */}
          <div className="rounded-lg shadow p-4 sm:p-6 relative overflow-hidden" style={{ backgroundColor: 'var(--pe-white)', border: '1px solid var(--border-default)' }}>
            {/* Header dourado */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: 'var(--pe-gold-main)' }}></div>
            <h2 className="text-base sm:text-lg font-semibold mb-4 mt-2" style={{ color: 'var(--pe-gold-main)' }}>Outros</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--pe-gray-muted)' }}>Músicos:</span>
                <span className="font-medium" style={{ color: 'var(--pe-gold-main)' }}>{metricas.outros.musicos}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--pe-gray-muted)' }}>Contatos:</span>
                <span className="font-medium" style={{ color: 'var(--pe-gold-main)' }}>{metricas.outros.contatos}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ensaios por Mês */}
          <div className="rounded-lg shadow p-4 sm:p-6 mt-6 relative overflow-hidden" style={{ backgroundColor: 'var(--pe-white)', border: '1px solid var(--border-default)' }}>
          {/* Header dourado */}
          <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: 'var(--pe-gold-main)' }}></div>
          <h2 className="text-base sm:text-lg font-semibold mb-4 mt-2" style={{ color: 'var(--pe-gold-main)' }}>Ensaios por Mês (Últimos 6 meses)</h2>
          <div className="space-y-2">
            {metricas.ensaios.porMes.map((item, index) => {
              const maxTotal = Math.max(...metricas.ensaios.porMes.map((m) => m.total), 1);
              return (
                <div key={index} className="flex items-center gap-2 sm:gap-4">
                  <span className="w-20 sm:w-32 text-xs sm:text-sm truncate" style={{ color: 'var(--pe-gray-muted)' }}>{item.mes}</span>
                  <div className="flex-1 rounded-full h-6 relative overflow-hidden min-w-0" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.min((item.total / maxTotal) * 100, 100)}%`,
                        backgroundColor: 'var(--pe-gold-main)'
                      }}
                    >
                      {item.total > 0 && (
                        <span className="text-xs font-medium" style={{ color: 'var(--pe-black)' }}>{item.total}</span>
                      )}
                    </div>
                  </div>
                  <span className="w-10 sm:w-12 text-right font-medium text-sm" style={{ color: 'var(--pe-gold-main)' }}>{item.total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tenants */}
        <div className="rounded-lg shadow p-4 sm:p-6 mt-6 relative overflow-hidden" style={{ backgroundColor: 'var(--pe-white)', border: '1px solid var(--border-default)' }}>
          {/* Header dourado */}
          <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: 'var(--pe-gold-main)' }}></div>
          <h2 className="text-base sm:text-lg font-semibold mb-4 mt-2" style={{ color: 'var(--pe-gold-main)' }}>Tenants</h2>
          {/* Versão Mobile: Cards */}
          <div className="block sm:hidden space-y-3">
            {metricas.tenants.detalhes.map((tenant) => (
              <div
                key={tenant.id}
                className="p-4 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-[var(--text-primary)] truncate flex-1">{tenant.nome}</p>
                  <span
                    className={`ml-2 inline-block px-2 py-1 rounded text-xs font-medium ${
                      tenant.ativo
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tenant.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] truncate mb-2">{tenant.slug}</p>
                <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
                  <span>👥 {tenant._count.usuarios}</span>
                  <span>📊 {tenant._count.ensaios}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Versão Desktop: Tabela */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: 'var(--pe-gold-bg)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--pe-gold-main)' }}>Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--pe-gold-main)' }}>Slug</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--pe-gold-main)' }}>Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--pe-gold-main)' }}>Usuários</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--pe-gold-main)' }}>Ensaios</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
                {metricas.tenants.detalhes.map((tenant, index) => (
                  <tr
                    key={tenant.id}
                    className="transition-colors"
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'var(--pe-white)' : 'var(--pe-gray-light)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--pe-white)' : 'var(--pe-gray-light)'}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--pe-gold-main)' }}>{tenant.nome}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--pe-gray-muted)' }}>{tenant.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          tenant.ativo
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {tenant.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--pe-gold-main)' }}>{tenant._count.usuarios}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--pe-gold-main)' }}>{tenant._count.ensaios}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
