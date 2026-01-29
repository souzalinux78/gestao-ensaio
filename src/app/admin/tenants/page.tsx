'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { apiFetch } from '@/lib/api-client';

interface Tenant {
  id: number;
  nome: string;
  slug: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    usuarios: number;
    ensaios: number;
  };
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    ativo: true,
  });

  useEffect(() => {
    carregarTenants();
  }, []);

  async function carregarTenants() {
    setCarregando(true);
    try {
      const res = await apiFetch('/api/admin/tenants');
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao carregar tenants');
      }
      const data = await res.json();
      setTenants(Array.isArray(data) ? data : data.data || []);
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar tenants' });
    } finally {
      setCarregando(false);
    }
  }

  async function salvarTenant() {
    try {
      const url = editandoId
        ? `/api/admin/tenants/${editandoId}`
        : '/api/admin/tenants';
      const method = editandoId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMensagem({
          tipo: 'sucesso',
          texto: editandoId ? 'Tenant atualizado com sucesso!' : 'Tenant criado com sucesso!',
        });
        setMostrarForm(false);
        setEditandoId(null);
        setFormData({ nome: '', slug: '', ativo: true });
        carregarTenants();
      } else {
        const error = await res.json();
        setMensagem({ tipo: 'erro', texto: error.error || 'Erro ao salvar tenant' });
      }
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar tenant' });
    }
  }

  async function excluirTenant(id: number) {
    if (!confirm('Tem certeza que deseja excluir este tenant? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/tenants/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMensagem({ tipo: 'sucesso', texto: 'Tenant excluído com sucesso!' });
        carregarTenants();
      } else {
        const error = await res.json();
        setMensagem({ tipo: 'erro', texto: error.error || 'Erro ao excluir tenant' });
      }
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao excluir tenant' });
    }
  }

  function iniciarEdicao(tenant: Tenant) {
    setEditandoId(tenant.id);
    setFormData({
      nome: tenant.nome,
      slug: tenant.slug,
      ativo: tenant.ativo,
    });
    setMostrarForm(true);
  }

  function cancelarEdicao() {
    setMostrarForm(false);
    setEditandoId(null);
    setFormData({ nome: '', slug: '', ativo: true });
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary dark:text-[var(--text-primary)]">Gerenciar Tenants</h1>
          {!mostrarForm && (
            <button
              onClick={() => setMostrarForm(true)}
              className="px-4 py-2 rounded-lg transition-colors font-medium"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--dark-primary)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
            >
              + Novo Tenant
            </button>
          )}
        </div>

        {mensagem && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              mensagem.tipo === 'sucesso'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        {mostrarForm && (
          <div className="rounded-lg shadow p-6 mb-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
              {editandoId ? 'Editar Tenant' : 'Novo Tenant'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => {
                    setFormData({ ...formData, nome: e.target.value });
                    // Gerar slug automaticamente se não foi editado manualmente
                    if (!editandoId || formData.slug === '') {
                      const slug = e.target.value
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                      setFormData((prev) => ({ ...prev, slug }));
                    }
                  }}
                  className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-2.5 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
                  Slug (URL amigável)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-2.5 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1">
                  Usado para identificação única do tenant
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
                    Tenant ativo
                  </span>
                </label>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={salvarTenant}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg transition-colors font-medium"
                style={{
                  backgroundColor: 'var(--pe-gold-main)',
                  color: 'var(--pe-black)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-strong)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-main)'}
              >
                Salvar
              </button>
              <button
                onClick={cancelarEdicao}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg transition-colors font-medium"
                style={{
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {carregando ? (
          <div className="text-center py-8 text-gray-500 dark:text-[var(--text-secondary)]">
            Carregando tenants...
          </div>
        ) : tenants.length === 0 ? (
          <div className="rounded-lg shadow-sm p-8 text-center" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
            Nenhum tenant cadastrado.
          </div>
        ) : (
          <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            {/* Versão Mobile: Cards */}
            <div className="block sm:hidden divide-y divide-gray-200 dark:divide-[var(--border-primary)]">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary dark:text-[var(--text-primary)] truncate">
                        {tenant.nome}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">ID: {tenant.id}</p>
                      <p className="text-xs text-[var(--text-tertiary)] truncate">{tenant.slug}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            tenant.ativo
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {tenant.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)]">
                          👥 {tenant._count?.usuarios || 0} | 📊 {tenant._count?.ensaios || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => iniciarEdicao(tenant)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Editar
                    </button>
                    {tenant.id !== 1 && (
                      <button
                        onClick={() => excluirTenant(tenant.id)}
                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Versão Desktop: Tabela */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Nome</th>
                    <th className="px-4 py-3 text-left font-semibold">Slug</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Usuários</th>
                    <th className="px-4 py-3 text-left font-semibold">Ensaios</th>
                    <th className="px-4 py-3 text-center font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
                  {tenants.map((tenant, index) => (
                    <tr
                      key={tenant.id}
                      className="transition-colors"
                      style={{ 
                        backgroundColor: index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-page)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-soft)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-page)'}
                    >
                      <td className="px-4 py-3 text-[var(--text-primary)]">{tenant.id}</td>
                      <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{tenant.nome}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{tenant.slug}</td>
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
                      <td className="px-4 py-3 text-[var(--text-primary)]">
                        {tenant._count?.usuarios || 0}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-primary)]">
                        {tenant._count?.ensaios || 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => iniciarEdicao(tenant)}
                            className="px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                            style={{
                              backgroundColor: 'var(--accent-primary)',
                              color: 'var(--dark-primary)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                          >
                            Editar
                          </button>
                          {tenant.id !== 1 && (
                            <button
                              onClick={() => excluirTenant(tenant.id)}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
