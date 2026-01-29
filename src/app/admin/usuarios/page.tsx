'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { Usuario } from '@/types';
import { apiFetch } from '@/lib/api-client';

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarAlterarSenha, setMostrarAlterarSenha] = useState<number | null>(null);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'aprovados' | 'pendentes'>('todos');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'instrutor' as 'admin' | 'instrutor',
    igreja: '',
    aprovado: false, // Por padrão, não aprovar - admin decide se aprova na hora
  });
  const [senhaForm, setSenhaForm] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    setCarregando(true);
    try {
      const res = await apiFetch('/api/usuarios');
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao carregar usuários');
      }
      const data = await res.json();
      setUsuarios(data);
      // Aplicar filtros com os dados carregados e os filtros atuais
      aplicarFiltros(data, filtroNome, filtroStatus);
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar usuários' });
    } finally {
      setCarregando(false);
    }
  }

  function aplicarFiltros(lista: Usuario[], nome: string, status: 'todos' | 'aprovados' | 'pendentes') {
    let filtrados = [...lista];

    // Filtro por nome
    if (nome.trim()) {
      const nomeLower = nome.trim().toLowerCase();
      filtrados = filtrados.filter(
        (u) =>
          u.nome.toLowerCase().includes(nomeLower) ||
          u.email.toLowerCase().includes(nomeLower) ||
          (u.igreja && u.igreja.toLowerCase().includes(nomeLower))
      );
    }

    // Filtro por status de aprovação
    if (status !== 'todos') {
      filtrados = filtrados.filter((u) => {
        if (u.tipo === 'admin') return false; // Admins não aparecem no filtro de status
        return status === 'aprovados' ? u.aprovado === true : u.aprovado === false;
      });
    }

    setUsuariosFiltrados(filtrados);
  }

  // Aplicar filtros quando mudarem
  useEffect(() => {
    if (usuarios.length > 0 || filtroNome || filtroStatus !== 'todos') {
      aplicarFiltros(usuarios, filtroNome, filtroStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroNome, filtroStatus, usuarios]);

  function iniciarEdicao(usuario: Usuario) {
    setEditandoId(usuario.id);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      tipo: usuario.tipo,
      igreja: usuario.igreja || '',
      aprovado: usuario.aprovado ?? true,
    });
    setMostrarForm(true);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      tipo: 'instrutor',
      igreja: '',
      aprovado: true, // Por padrão, quando admin cria, aprovar automaticamente
    });
    setMostrarForm(false);
    setMostrarAlterarSenha(null);
  }

  async function salvarUsuario() {
    if (!formData.nome || !formData.email) {
      setMensagem({ tipo: 'erro', texto: 'Nome e email são obrigatórios' });
      return;
    }

    if (!editandoId && !formData.senha) {
      setMensagem({ tipo: 'erro', texto: 'Senha é obrigatória para novos usuários' });
      return;
    }

    setCarregando(true);
    setMensagem(null);

    try {
      const url = editandoId ? `/api/usuarios/${editandoId}` : '/api/usuarios';
      const method = editandoId ? 'PUT' : 'POST';

      const body: any = {
        nome: formData.nome,
        email: formData.email,
        tipo: formData.tipo,
        igreja: formData.igreja || null,
      };

      if (formData.senha) {
        body.senha = formData.senha;
      }

      // Se for criação de novo usuário, incluir campo aprovado
      // Se for admin, sempre aprovar automaticamente
      // Se for instrutor, usar o valor da checkbox
      if (!editandoId) {
        body.aprovado = formData.tipo === 'admin' ? true : (formData.aprovado ?? false);
      }

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await carregarUsuarios();
        cancelarEdicao();
        setMensagem({ tipo: 'sucesso', texto: editandoId ? 'Usuário atualizado!' : 'Usuário criado!' });
      } else {
        const error = await res.json();
        setMensagem({ tipo: 'erro', texto: error.error || 'Erro ao salvar usuário' });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar usuário' });
    } finally {
      setCarregando(false);
    }
  }

  async function alterarSenha(usuarioId: number) {
    if (!senhaForm.senhaAtual || !senhaForm.novaSenha) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos' });
      return;
    }

    if (senhaForm.novaSenha !== senhaForm.confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'As senhas não coincidem' });
      return;
    }

    setCarregando(true);
    setMensagem(null);

    try {
      const res = await apiFetch('/api/usuarios/alterar-senha', {
        method: 'POST',
        body: JSON.stringify({
          usuarioId,
          senhaAtual: senhaForm.senhaAtual,
          novaSenha: senhaForm.novaSenha,
        }),
      });

      if (res.ok) {
        setMostrarAlterarSenha(null);
        setSenhaForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
        setMensagem({ tipo: 'sucesso', texto: 'Senha alterada com sucesso!' });
      } else {
        const error = await res.json();
        setMensagem({ tipo: 'erro', texto: error.error || 'Erro ao alterar senha' });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao alterar senha' });
    } finally {
      setCarregando(false);
    }
  }

  async function aprovarUsuario(id: number, aprovado: boolean) {
    try {
      const res = await apiFetch(`/api/usuarios/${id}/aprovar`, {
        method: 'PUT',
        body: JSON.stringify({ aprovado }),
      });

      if (res.ok) {
        await carregarUsuarios();
        setMensagem({ 
          tipo: 'sucesso', 
          texto: aprovado ? 'Usuário aprovado!' : 'Usuário reprovado!' 
        });
      } else {
        const error = await res.json();
        setMensagem({ tipo: 'erro', texto: error.error || 'Erro ao alterar status de aprovação' });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao alterar status de aprovação' });
    }
  }

  async function excluirUsuario(id: number) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const res = await apiFetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await carregarUsuarios();
        setMensagem({ tipo: 'sucesso', texto: 'Usuário excluído!' });
      } else {
        const error = await res.json();
        setMensagem({ tipo: 'erro', texto: error.error || 'Erro ao excluir usuário' });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao excluir usuário' });
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary dark:text-[var(--text-primary)]">Gerenciar Usuários</h1>
        </div>

        {mensagem && (
          <div
            className={`mb-4 p-4 rounded ${
              mensagem.tipo === 'sucesso'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        {/* Filtros - Sempre visíveis quando não estiver editando */}
        {!mostrarForm && (
          <div className="mb-6 bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow-md border border-gray-200 dark:border-[var(--border-primary)] p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-primary dark:text-[var(--text-primary)] mb-1">🔍 Filtros de Busca</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                Pesquise por nome, email, igreja ou filtre por status de aprovação
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-[var(--text-primary)]">
                  Pesquisar por nome, email ou igreja
                </label>
                <input
                  type="text"
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  placeholder="Ex: João, email@exemplo.com, CCB..."
                  className="w-full border-2 border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-3 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-base"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-[var(--text-primary)]">
                  Filtrar por status de aprovação
                </label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value as 'todos' | 'aprovados' | 'pendentes')}
                  className="w-full border-2 border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-3 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-base"
                >
                  <option value="todos">📋 Todos os usuários</option>
                  <option value="aprovados">✅ Aprovados</option>
                  <option value="pendentes">⏳ Pendentes de aprovação</option>
                </select>
              </div>
            </div>
            {(filtroNome || filtroStatus !== 'todos') && (
              <div className="mt-4 pt-4 border-t-2 border-gray-300 dark:border-[var(--border-primary)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
                  📊 Mostrando <strong className="text-primary">{usuariosFiltrados.length}</strong> de <strong className="text-primary">{usuarios.length}</strong> usuário(s)
                </span>
                <button
                  onClick={() => {
                    setFiltroNome('');
                    setFiltroStatus('todos');
                  }}
                  className="text-sm text-white bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  🗑️ Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-gray-600 dark:text-[var(--text-secondary)] text-sm sm:text-base flex-1">
              Gerencie usuários do sistema. Aprove novos cadastros para permitir acesso. Cada instrutor terá acesso apenas aos seus próprios ensaios.
            </p>
            {!mostrarForm && (
              <button
                onClick={() => {
                  setMostrarForm(true);
                  setEditandoId(null);
                  setFormData({
                    nome: '',
                    email: '',
                    senha: '',
                    tipo: 'instrutor',
                    igreja: '',
                    aprovado: false, // Por padrão, não aprovar - admin decide se aprova na hora
                  });
                }}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 whitespace-nowrap font-medium shadow-sm transition-colors"
              >
                + Novo Usuário
              </button>
            )}
          </div>
        </div>

        {mostrarForm && (
          <div className="bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
              {editandoId ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-2.5 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-2.5 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'admin' | 'instrutor' })}
                  className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-2.5 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                >
                  <option value="instrutor">Instrutor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">Igreja/Congregação</label>
                <input
                  type="text"
                  value={formData.igreja}
                  onChange={(e) => setFormData({ ...formData, igreja: e.target.value })}
                  placeholder="Nome da igreja"
                  className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-2.5 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                />
              </div>
              {!editandoId && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">Senha</label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-2.5 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                    required={!editandoId}
                  />
                </div>
              )}
              {editandoId && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">Nova Senha (opcional)</label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    placeholder="Deixe em branco para manter a atual"
                    className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-2.5 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                  />
                </div>
              )}
              {!editandoId && formData.tipo === 'instrutor' && (
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.aprovado}
                      onChange={(e) => setFormData({ ...formData, aprovado: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-accent"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
                      Aprovar usuário automaticamente (permitir login imediato)
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1 ml-6">
                    Se desmarcado, o usuário precisará ser aprovado manualmente antes de poder fazer login.
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={salvarUsuario}
                disabled={carregando}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--dark-primary)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--accent-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                  }
                }}
              >
                {carregando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={cancelarEdicao}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg transition-colors font-medium"
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

        {carregando && !mostrarForm ? (
          <div className="text-center py-8 text-gray-500 dark:text-[var(--text-secondary)]">Carregando usuários...</div>
        ) : usuarios.length === 0 ? (
          <div className="bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow-sm p-8 text-center text-gray-500 dark:text-[var(--text-secondary)]">
            Nenhum usuário cadastrado.
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow-sm p-8 text-center text-gray-500 dark:text-[var(--text-secondary)]">
            Nenhum usuário encontrado com os filtros aplicados.
          </div>
        ) : (
          <div className="bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow-sm overflow-hidden">
            {/* Versão mobile: cards */}
            <div className="block sm:hidden divide-y divide-gray-200 dark:divide-[var(--border-primary)]">
              {usuariosFiltrados.map((usuario) => (
                <div key={usuario.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary dark:text-[var(--text-primary)] truncate">{usuario.nome}</p>
                      <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] truncate">{usuario.email}</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                        usuario.tipo === 'admin' ? 'bg-accent/20 text-accent-dark' : 'bg-primary/20 text-primary'
                      }`}>
                        {usuario.tipo === 'admin' ? 'Admin' : 'Instrutor'}
                      </span>
                      {usuario.igreja && (
                        <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1">{usuario.igreja}</p>
                      )}
                      {usuario.tipo !== 'admin' && (
                        <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                          usuario.aprovado 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {usuario.aprovado ? '✓ Aprovado' : '⏳ Aguardando'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {usuario.tipo !== 'admin' && (
                      <button
                        onClick={() => aprovarUsuario(usuario.id, !usuario.aprovado)}
                        className={`flex-1 text-white px-3 py-2 rounded-lg text-xs transition-colors font-medium ${
                          usuario.aprovado
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {usuario.aprovado ? 'Reprovar' : 'Aprovar'}
                      </button>
                    )}
                    <button
                      onClick={() => iniciarEdicao(usuario)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs transition-colors font-medium"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--dark-primary)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => router.push(`/admin/usuarios/reset-senha?usuarioId=${usuario.id}`)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-blue-700 transition-colors font-medium"
                    >
                      Reset Senha
                    </button>
                    <button
                      onClick={() => excluirUsuario(usuario.id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition-colors font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Versão desktop: tabela */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full table-fixed">
                <thead style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold w-[20%]">Nome</th>
                    <th className="px-4 py-3 text-left font-semibold w-[25%]">Email</th>
                    <th className="px-4 py-3 text-left font-semibold w-[10%]">Tipo</th>
                    <th className="px-4 py-3 text-left font-semibold w-[20%]">Igreja</th>
                    <th className="px-4 py-3 text-left font-semibold w-[10%]">Status</th>
                    <th className="px-4 py-3 text-center font-semibold w-[15%]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
                  {usuariosFiltrados.map((usuario, index) => (
                    <tr 
                      key={usuario.id} 
                      className="transition-colors"
                      style={{ 
                        backgroundColor: index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-page)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-page)'}
                    >
                      <td className="px-4 py-3 align-middle">
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{usuario.nome}</span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="text-sm break-words" style={{ color: 'var(--text-secondary)' }}>{usuario.email}</span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          usuario.tipo === 'admin' ? 'bg-accent/20 text-accent-dark' : 'bg-primary/20 text-primary'
                        }`}>
                          {usuario.tipo === 'admin' ? 'Admin' : 'Instrutor'}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="text-sm break-words" style={{ color: 'var(--text-secondary)' }}>{usuario.igreja || '-'}</span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {usuario.tipo !== 'admin' ? (
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                            usuario.aprovado 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                          }`}>
                            {usuario.aprovado ? '✓ Aprovado' : '⏳ Aguardando'}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex gap-2 justify-center items-center flex-wrap">
                          {usuario.tipo !== 'admin' && (
                            <button
                              onClick={() => aprovarUsuario(usuario.id, !usuario.aprovado)}
                              className={`text-white px-3 py-1.5 rounded-lg text-xs transition-colors font-medium whitespace-nowrap ${
                                usuario.aprovado
                                  ? 'bg-yellow-600 hover:bg-yellow-700'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {usuario.aprovado ? 'Reprovar' : 'Aprovar'}
                            </button>
                          )}
                          <button
                            onClick={() => iniciarEdicao(usuario)}
                            className="px-3 py-1.5 rounded-lg text-xs transition-colors font-medium whitespace-nowrap"
                            style={{
                              backgroundColor: 'var(--accent-primary)',
                              color: 'var(--dark-primary)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => router.push(`/admin/usuarios/reset-senha?usuarioId=${usuario.id}`)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
                          >
                            Reset Senha
                          </button>
                          <button
                            onClick={() => excluirUsuario(usuario.id)}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-600 transition-colors font-medium whitespace-nowrap"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {mostrarAlterarSenha && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-primary">Alterar Senha</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Senha Atual</label>
                  <input
                    type="password"
                    value={senhaForm.senhaAtual}
                    onChange={(e) => setSenhaForm({ ...senhaForm, senhaAtual: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Nova Senha</label>
                  <input
                    type="password"
                    value={senhaForm.novaSenha}
                    onChange={(e) => setSenhaForm({ ...senhaForm, novaSenha: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={senhaForm.confirmarSenha}
                    onChange={(e) => setSenhaForm({ ...senhaForm, confirmarSenha: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => alterarSenha(mostrarAlterarSenha)}
                  disabled={carregando}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--dark-primary)'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--accent-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                    }
                  }}
                >
                  {carregando ? 'Alterando...' : 'Alterar Senha'}
                </button>
                <button
                  onClick={() => {
                    setMostrarAlterarSenha(null);
                    setSenhaForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg transition-colors font-medium"
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
