'use client';

import { useState, useEffect } from 'react';
import { Contato, Usuario } from '@/types';
import { obterSessao } from '@/lib/session';

export default function ContatosManager() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const sessao = obterSessao();
    if (sessao) {
      setUsuario(sessao);
      carregarContatos(sessao.id);
    }
  }, []);

  async function carregarContatos(usuarioId: number) {
    setCarregando(true);
    try {
      const res = await fetch(`/api/contatos?usuarioId=${usuarioId}`);
      const data = await res.json();
      setContatos(data);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar contatos' });
    } finally {
      setCarregando(false);
    }
  }

  function iniciarEdicao(contato: Contato) {
    setEditandoId(contato.id);
    setNome(contato.nome);
    setTelefone(contato.telefone);
    setMostrarForm(true);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setNome('');
    setTelefone('');
    setMostrarForm(false);
  }

  async function salvarContato() {
    if (!nome.trim() || !telefone.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Nome e telefone são obrigatórios' });
      return;
    }

    if (!usuario) {
      setMensagem({ tipo: 'erro', texto: 'Sessão expirada. Faça login novamente.' });
      return;
    }

    setSalvando(true);
    setMensagem(null);

    try {
      const url = editandoId ? `/api/contatos/${editandoId}` : '/api/contatos';
      const method = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nome: nome.trim(), 
          telefone: telefone.trim(),
          usuarioId: usuario.id,
        }),
      });

      if (res.ok) {
        await carregarContatos(usuario.id);
        cancelarEdicao();
        setMensagem({ tipo: 'sucesso', texto: editandoId ? 'Contato atualizado!' : 'Contato adicionado!' });
      } else {
        const error = await res.json();
        setMensagem({ tipo: 'erro', texto: error.error || 'Erro ao salvar contato' });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar contato' });
    } finally {
      setSalvando(false);
    }
  }

  async function excluirContato(id: number) {
    if (!confirm('Tem certeza que deseja excluir este contato?')) {
      return;
    }

    if (!usuario) {
      setMensagem({ tipo: 'erro', texto: 'Sessão expirada. Faça login novamente.' });
      return;
    }

    try {
      const res = await fetch(`/api/contatos/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await carregarContatos(usuario.id);
        setMensagem({ tipo: 'sucesso', texto: 'Contato excluído!' });
      } else {
        const error = await res.json();
        setMensagem({ tipo: 'erro', texto: error.error || 'Erro ao excluir contato' });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao excluir contato' });
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-primary">Gerenciar Contatos</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Adicione telefones e nomes que serão enviados junto com os dados do ensaio para o webhook.
          </p>
        </div>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="w-full sm:w-auto bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            + Adicionar Contato
          </button>
        )}
      </div>

      {mensagem && (
        <div
          className={`p-4 rounded ${
            mensagem.tipo === 'sucesso'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      {mostrarForm && (
        <div className="border rounded p-4 bg-gray-50 space-y-4">
          <h3 className="font-semibold">
            {editandoId ? 'Editar Contato' : 'Novo Contato'}
          </h3>
          <div>
            <label className="block mb-2">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do contato"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-2">Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={salvarContato}
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
        <div className="text-center py-8">Carregando contatos...</div>
      ) : contatos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum contato cadastrado. Clique em "Adicionar Contato" para começar.
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="font-semibold mb-4">Contatos Cadastrados</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Nome</th>
                  <th className="border px-4 py-2 text-left">Telefone</th>
                  <th className="border px-4 py-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contatos.map((contato) => (
                  <tr key={contato.id}>
                    <td className="border px-4 py-2">{contato.nome}</td>
                    <td className="border px-4 py-2">{contato.telefone}</td>
                    <td className="border px-4 py-2">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => iniciarEdicao(contato)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirContato(contato.id)}
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
