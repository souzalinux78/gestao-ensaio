'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import InstrumentoForm from '@/components/InstrumentoForm';
import FuncoesForm from '@/components/FuncoesForm';
import { Instrumento, Usuario } from '@/types';
import { obterSessao } from '@/lib/session';

export default function NovoEnsaioPage() {
  const router = useRouter();
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [quantidades, setQuantidades] = useState<{ [key: number]: number }>({});
  const [funcoes, setFuncoes] = useState<{
    ancioes: number | undefined;
    diaconos: number | undefined;
    cooperadorOficio: number | undefined;
    cooperadorJovens: number | undefined;
    encarregadosLocais: number | undefined;
    encarregadosRegionais: number | undefined;
    instrutores: number | undefined;
  }>({
    ancioes: undefined,
    diaconos: undefined,
    cooperadorOficio: undefined,
    cooperadorJovens: undefined,
    encarregadosLocais: undefined,
    encarregadosRegionais: undefined,
    instrutores: undefined,
  });
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [hinosEnsaidos, setHinosEnsaidos] = useState('');
  const [regencia, setRegencia] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const sessao = obterSessao();
    if (!sessao) {
      router.push('/login');
      return;
    }
    setUsuario(sessao);
    carregarInstrumentos();
  }, [router]);

  async function carregarInstrumentos() {
    const res = await fetch('/api/instrumentos');
    const data = await res.json();
    setInstrumentos(data);
  }

  async function adicionarNovoInstrumento(nome: string) {
    const res = await fetch('/api/instrumentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    });
    if (res.ok) {
      await carregarInstrumentos();
    }
  }

  async function salvarEnsaio() {
    setCarregando(true);
    try {
      // Encontrar o ID do instrumento "Órgão"
      const orgao = instrumentos.find((i) => i.nome === 'Órgão');
      const orgaoId = orgao?.id;

      // Calcular total de músicos (todos os instrumentos EXCETO Órgão)
      const totalMusicos = Object.entries(quantidades)
        .filter(([id, _]) => parseInt(id) !== orgaoId)
        .reduce((sum, [_, qtd]) => sum + (qtd || 0), 0);

      // Calcular total de organistas (apenas Órgão)
      const totalOrganistas = orgaoId ? (quantidades[orgaoId] || 0) : 0;

      // Total geral = Músicos + Organistas (SEM ministério)
      const totalGeral = totalMusicos + totalOrganistas;

      if (!usuario) {
        alert('Sessão expirada. Faça login novamente.');
        router.push('/login');
        return;
      }

      const res = await fetch('/api/ensaios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          instrumentos: Object.entries(quantidades)
            .filter(([_, qtd]) => qtd > 0)
            .map(([id, qtd]) => ({
              instrumentoId: parseInt(id),
              quantidade: qtd,
            })),
          funcoes: {
            ancioes: funcoes.ancioes ?? 0,
            diaconos: funcoes.diaconos ?? 0,
            cooperadorOficio: funcoes.cooperadorOficio ?? 0,
            cooperadorJovens: funcoes.cooperadorJovens ?? 0,
            encarregadosLocais: funcoes.encarregadosLocais ?? 0,
            encarregadosRegionais: funcoes.encarregadosRegionais ?? 0,
            instrutores: funcoes.instrutores ?? 0,
          },
          totalGeral,
          hinosEnsaidos: hinosEnsaidos.trim() || null,
          regencia: regencia.trim() || null,
          instrutorId: usuario.id,
        }),
      });

      if (res.ok) {
        router.push('/instrutor');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-primary">Novo Ensaio</h1>

        <div className="space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Data do Ensaio</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
            />
          </div>

          <InstrumentoForm
            instrumentos={instrumentos}
            valores={quantidades}
            onChange={(id, qtd) => {
              if (qtd === undefined || qtd === 0) {
                // Remover do estado se for 0 ou undefined
                const novasQuantidades = { ...quantidades };
                delete novasQuantidades[id];
                setQuantidades(novasQuantidades);
              } else {
                setQuantidades({ ...quantidades, [id]: qtd });
              }
            }}
            onAdicionarNovo={adicionarNovoInstrumento}
          />

          <FuncoesForm
            valores={funcoes}
            onChange={(campo, valor) => {
              setFuncoes({ ...funcoes, [campo]: valor });
            }}
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Hinos Ensaiados</label>
            <input
              type="text"
              value={hinosEnsaidos}
              onChange={(e) => setHinosEnsaidos(e.target.value)}
              placeholder="Ex: 1, 22, 33, 44"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
            />
            <p className="text-sm text-gray-500 mt-1">
              Digite os números dos hinos separados por vírgula
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Regência</label>
            <textarea
              value={regencia}
              onChange={(e) => setRegencia(e.target.value)}
              placeholder="Ex:&#10;João Silva São Paulo Central&#10;Pedro Oliveira Campinas Bairro Novo"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors resize-y"
            />
            <p className="text-sm text-gray-500 mt-1">
              Digite o nome do regente e a localidade (um por linha)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={salvarEnsaio}
              disabled={carregando}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-md hover:shadow-lg"
            >
              {carregando ? 'Salvando...' : 'Salvar Ensaio'}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 sm:flex-none bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
