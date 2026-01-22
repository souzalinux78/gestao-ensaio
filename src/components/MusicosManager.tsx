'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Musico, Usuario } from '@/types';
import { obterSessao, removerSessao } from '@/lib/session';

export default function MusicosManager() {
  const router = useRouter();
  const [musicos, setMusicos] = useState<Musico[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const sessao = obterSessao();
    if (sessao) {
      setUsuario(sessao);
      carregarMusicos(sessao.id);
    }
  }, []);

  function lidarSessaoInvalida(mensagem?: string) {
    if (mensagem) {
      setMensagem({ tipo: 'erro', texto: mensagem });
    }
    removerSessao();
    router.push('/login');
  }

  async function carregarMusicos(instrutorId: number) {
    setCarregando(true);
    try {
      const res = await fetch(`/api/musicos?instrutorId=${instrutorId}`, {
        headers: { Authorization: `Bearer ${instrutorId}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          lidarSessaoInvalida('Sessão expirada. Faça login novamente.');
          return;
        }
        throw new Error(data.error || 'Erro ao carregar músicos');
      }
      setMusicos(data);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar músicos' });
    } finally {
      setCarregando(false);
    }
  }

  function iniciarEdicao(musico: Musico) {
    setEditandoId(musico.id);
    setNome(musico.nome);
    setMostrarForm(true);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setNome('');
    setMostrarForm(false);
  }

  async function salvarMusico() {
    if (!nome.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Nome é obrigatório' });
      return;
    }

    if (!usuario) {
      setMensagem({ tipo: 'erro', texto: 'Sessão expirada. Faça login novamente.' });
      return;
    }

    console.info('[MusicosManager] salvarMusico', {
      usuarioId: usuario.id,
      nome: nome.trim(),
    });

    setSalvando(true);
    setMensagem(null);

    try {
      const url = editandoId ? `/api/musicos/${editandoId}` : '/api/musicos';
      const method = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${usuario.id}`,
        },
        body: JSON.stringify({
          nome: nome.trim(),
          instrutorId: usuario.id,
        }),
      });

      const data = await res.json();
      if (!res.ok && res.status === 401) {
        lidarSessaoInvalida('Sessão expirada. Faça login novamente.');
        return;
      }
      if (!res.ok && data?.error === 'Instrutor não encontrado') {
        lidarSessaoInvalida('Sessão inválida. Faça login novamente.');
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar músico');
      }

      await carregarMusicos(usuario.id);
      cancelarEdicao();
      setMensagem({
        tipo: 'sucesso',
        texto: editandoId ? 'Músico atualizado!' : 'Músico adicionado!',
      });
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar músico' });
    } finally {
      setSalvando(false);
    }
  }

  async function excluirMusico(id: number) {
    if (!confirm('Tem certeza que deseja excluir este músico?')) {
      return;
    }

    if (!usuario) {
      setMensagem({ tipo: 'erro', texto: 'Sessão expirada. Faça login novamente.' });
      return;
    }

    try {
      const res = await fetch(`/api/musicos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${usuario.id}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao excluir músico');
      }

      await carregarMusicos(usuario.id);
      setMensagem({ tipo: 'sucesso', texto: 'Músico excluído!' });
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir músico' });
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-primary">Gerenciar Músicos</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Cadastre os músicos da comum. Eles aparecerão na tela de novo ensaio para marcar presença.
          </p>
        </div>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="w-full sm:w-auto bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            + Adicionar Músico
          </button>
        )}
      </div>

      {mensagem && (
        <div
          className={`p-4 rounded ${
            mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      {mostrarForm && (
        <div className="border rounded p-4 bg-gray-50 space-y-4">
          <h3 className="font-semibold">{editandoId ? 'Editar Músico' : 'Novo Músico'}</h3>
          <div>
            <label className="block mb-2">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do músico"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={salvarMusico}
              disabled={salvando}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={cancelarEdicao}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {carregando ? (
        <div className="text-center py-8">Carregando músicos...</div>
      ) : musicos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum músico cadastrado. Clique em "Adicionar Músico" para começar.
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="font-semibold mb-4">Músicos Cadastrados</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Nome</th>
                  <th className="border px-4 py-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {musicos.map((musico) => (
                  <tr key={musico.id}>
                    <td className="border px-4 py-2">{musico.nome}</td>
                    <td className="border px-4 py-2">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => iniciarEdicao(musico)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirMusico(musico.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
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
    </div>
  );
}
