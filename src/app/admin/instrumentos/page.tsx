'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { apiFetch } from '@/lib/api-client';
import { Instrumento } from '@/types';

type Naipe = 'Cordas' | 'Madeiras' | 'Metais' | 'Teclas' | 'Outros';

function normalizarTexto(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function identificarNaipe(nome: string): Naipe {
  const nomeBase = normalizarTexto(nome);

  if (['VIOLINO', 'VIOLINO CONTRALTO', 'VIOLA', 'VIOLONCELO'].includes(nomeBase)) {
    return 'Cordas';
  }

  if (
    nomeBase.startsWith('FLAUTA') ||
    nomeBase.startsWith('CLARINETE') ||
    nomeBase.startsWith('SAXOFONE') ||
    nomeBase === 'OBOE' ||
    nomeBase === "OBOE D'AMORE" ||
    nomeBase === 'OBOE D AMORE' ||
    nomeBase === 'CORNE INGLES' ||
    nomeBase === 'FAGOTE'
  ) {
    return 'Madeiras';
  }

  if (
    [
      'POCKET',
      'CORNET',
      'TROMPETE',
      'FLUGELHORN',
      'TROMPA',
      'TROMBONITO',
      'BARITONO DE PISTO',
      'MELOFONE',
      'TROMBONE',
      'SAX HORN',
      'TUBA WAGNERIANA',
      'EUPHONIUM',
      'TUBA',
    ].includes(nomeBase)
  ) {
    return 'Metais';
  }

  if (['ACORDEON', 'ORGANISTA', 'ORGAO'].includes(nomeBase)) {
    return 'Teclas';
  }

  return 'Outros';
}

export default function AdminInstrumentosPage() {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    carregarInstrumentos();
  }, []);

  async function carregarInstrumentos() {
    setCarregando(true);
    try {
      const res = await apiFetch('/api/instrumentos');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao carregar instrumentos');
      }
      setInstrumentos(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar instrumentos' });
    } finally {
      setCarregando(false);
    }
  }

  async function adicionarInstrumento() {
    setMensagem(null);
    const nome = novoNome.trim();
    if (!nome) {
      setMensagem({ tipo: 'erro', texto: 'Informe o nome do instrumento.' });
      return;
    }

    try {
      const res = await apiFetch('/api/instrumentos', {
        method: 'POST',
        body: JSON.stringify({ nome }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao adicionar instrumento');
      }

      setNovoNome('');
      setMensagem({ tipo: 'sucesso', texto: 'Instrumento adicionado com sucesso.' });
      await carregarInstrumentos();
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao adicionar instrumento' });
    }
  }

  async function salvarEdicao(id: number) {
    setMensagem(null);
    const nome = nomeEdicao.trim();
    if (!nome) {
      setMensagem({ tipo: 'erro', texto: 'Informe o nome do instrumento.' });
      return;
    }

    try {
      const res = await apiFetch(`/api/instrumentos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nome }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao editar instrumento');
      }

      setEditandoId(null);
      setNomeEdicao('');
      setMensagem({ tipo: 'sucesso', texto: 'Instrumento atualizado com sucesso.' });
      await carregarInstrumentos();
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao editar instrumento' });
    }
  }

  async function excluirInstrumento(id: number) {
    if (!confirm('Deseja realmente excluir este instrumento?')) {
      return;
    }

    setMensagem(null);
    try {
      const res = await apiFetch(`/api/instrumentos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao excluir instrumento');
      }

      setMensagem({ tipo: 'sucesso', texto: 'Instrumento excluído com sucesso.' });
      await carregarInstrumentos();
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir instrumento' });
    }
  }

  const instrumentosFiltrados = useMemo(() => {
    const termo = filtro.trim().toLowerCase();
    if (!termo) {
      return instrumentos;
    }
    return instrumentos.filter((item) => item.nome.toLowerCase().includes(termo));
  }, [instrumentos, filtro]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary dark:text-[var(--text-primary)]">Gerenciar Instrumentos</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Apenas administradores podem editar ou excluir instrumentos.
            </p>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            Total: <strong className="text-[var(--text-primary)]">{instrumentosFiltrados.length}</strong>
          </div>
        </div>

        {mensagem && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              mensagem.tipo === 'sucesso'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        <div className="rounded-lg shadow p-4 sm:p-6 mb-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Adicionar Instrumento</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: TROMPETE"
              className="flex-1 border border-[var(--border-default)] rounded-lg px-4 py-2.5 bg-white text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
            <button
              onClick={adicionarInstrumento}
              className="px-5 py-2.5 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'var(--pe-gold-main)', color: 'var(--pe-black)' }}
            >
              + Adicionar
            </button>
          </div>
        </div>

        <div className="rounded-lg shadow overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <input
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Filtrar por nome do instrumento..."
              className="w-full border border-[var(--border-default)] rounded-lg px-4 py-2.5 bg-white text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          {carregando ? (
            <div className="py-10 text-center text-[var(--text-secondary)]">Carregando instrumentos...</div>
          ) : instrumentosFiltrados.length === 0 ? (
            <div className="py-10 text-center text-[var(--text-secondary)]">Nenhum instrumento encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Instrumento</th>
                    <th className="px-4 py-3 text-left font-semibold">Naipe</th>
                    <th className="px-4 py-3 text-center font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
                  {instrumentosFiltrados.map((instrumento, index) => {
                    const naipe = identificarNaipe(instrumento.nome);
                    return (
                      <tr
                        key={instrumento.id}
                        style={{ backgroundColor: index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-page)' }}
                      >
                        <td className="px-4 py-3">
                          {editandoId === instrumento.id ? (
                            <input
                              type="text"
                              value={nomeEdicao}
                              onChange={(e) => setNomeEdicao(e.target.value)}
                              className="w-full border border-[var(--border-default)] rounded-lg px-3 py-2 bg-white text-[var(--text-primary)]"
                            />
                          ) : (
                            <span className="font-medium text-[var(--text-primary)]">{instrumento.nome}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            {naipe}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            {editandoId === instrumento.id ? (
                              <>
                                <button
                                  onClick={() => salvarEdicao(instrumento.id)}
                                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                                >
                                  Salvar
                                </button>
                                <button
                                  onClick={() => {
                                    setEditandoId(null);
                                    setNomeEdicao('');
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 transition-colors"
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditandoId(instrumento.id);
                                    setNomeEdicao(instrumento.nome);
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                                  style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--dark-primary)' }}
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => excluirInstrumento(instrumento.id)}
                                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                                >
                                  Excluir
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
