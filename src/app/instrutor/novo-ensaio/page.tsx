'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import InstrumentoForm from '@/components/InstrumentoForm';
import FuncoesForm from '@/components/FuncoesForm';
import MusicosForm from '@/components/MusicosForm';
import DateInputBR from '@/components/DateInputBR';
import { Instrumento, Usuario, Ensaio, Musico } from '@/types';
import { obterSessao } from '@/lib/session';
import { fetchWithCSRF } from '@/lib/csrf-client';
import { apiFetch } from '@/lib/api-client';

function normalizarNome(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

function extrairDataISO(valor: string | Date | null | undefined): string {
  if (!valor) return new Date().toISOString().split('T')[0];
  if (typeof valor === 'string') {
    const match = valor.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match?.[1]) return match[1];
    const d = new Date(valor);
    if (!Number.isNaN(d.getTime())) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return new Date().toISOString().split('T')[0];
  }

  const y = valor.getUTCFullYear();
  const m = String(valor.getUTCMonth() + 1).padStart(2, '0');
  const day = String(valor.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type AtendimentoTipo =
  | 'ancioes'
  | 'diaconos'
  | 'cooperadorOficio'
  | 'cooperadorJovens'
  | 'encarregadosLocais'
  | 'encarregadosRegionais'
  | 'instrutores'
  | 'examinadora'
  | '';

const TIPOS_ATENDIMENTO: Array<{ value: AtendimentoTipo; label: string }> = [
  { value: '', label: 'Selecione o tipo' },
  { value: 'ancioes', label: 'Ancião' },
  { value: 'diaconos', label: 'Diácono' },
  { value: 'cooperadorOficio', label: 'Coop. de Ofício' },
  { value: 'cooperadorJovens', label: 'Coop. de Jovens' },
  { value: 'encarregadosLocais', label: 'Encarregado Local' },
  { value: 'encarregadosRegionais', label: 'Encarregado Regional' },
  { value: 'instrutores', label: 'Instrutor' },
  { value: 'examinadora', label: 'Examinadora' },
];

function NovoEnsaioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ensaioId = searchParams.get('id');
  const isEditando = !!ensaioId;

  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [quantidades, setQuantidades] = useState<{ [key: number]: number }>({});
  const [musicos, setMusicos] = useState<Musico[]>([]);
  const [musicosSelecionados, setMusicosSelecionados] = useState<number[]>([]);
  const [funcoes, setFuncoes] = useState<{
    ancioes: number | undefined;
    diaconos: number | undefined;
    cooperadorOficio: number | undefined;
    cooperadorJovens: number | undefined;
    examinadora: number | undefined;
    encarregadosLocais: number | undefined;
    encarregadosRegionais: number | undefined;
    instrutores: number | undefined;
  }>({
    ancioes: undefined,
    diaconos: undefined,
    cooperadorOficio: undefined,
    cooperadorJovens: undefined,
    examinadora: undefined,
    encarregadosLocais: undefined,
    encarregadosRegionais: undefined,
    instrutores: undefined,
  });
  const [atendimento, setAtendimento] = useState<{
    primeiroNome: string;
    primeiroTipo: AtendimentoTipo;
    segundoNome: string;
    segundoTipo: AtendimentoTipo;
  }>({
    primeiroNome: '',
    primeiroTipo: '',
    segundoNome: '',
    segundoTipo: '',
  });
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [hinosEnsaidos, setHinosEnsaidos] = useState('');
  const [regencia, setRegencia] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [carregandoEnsaio, setCarregandoEnsaio] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const sessao = obterSessao();
    if (!sessao) {
      router.push('/login');
      return;
    }
    setUsuario(sessao);

    const inicializar = async () => {
      const instrumentosCarregados = await carregarInstrumentos();
      await carregarMusicos(sessao.id);
      if (isEditando && ensaioId) {
        await carregarEnsaio(parseInt(ensaioId, 10), instrumentosCarregados);
      }
    };

    inicializar();
  }, [router, ensaioId, isEditando]);

  async function carregarEnsaio(id: number, instrumentosTela: Instrumento[] = instrumentos) {
    setCarregandoEnsaio(true);
    try {
      const res = await apiFetch(`/api/ensaios/${id}`);
      if (!res.ok) {
        alert('Erro ao carregar ensaio. Redirecionando...');
        router.push('/instrutor');
        return;
      }
      
      const ensaio: Ensaio = await res.json();
      
      // Preencher data
      setData(extrairDataISO(ensaio.data as unknown as string | Date));
      
      // Preencher quantidades de instrumentos
      const novasQuantidades: { [key: number]: number } = {};
      ensaio.instrumentos.forEach((item) => {
        novasQuantidades[item.instrumentoId] = item.quantidade;
      });

      // Compatibilidade: se IDs mudaram entre escopos (global/tenant), remapear por nome.
      if (instrumentosTela.length > 0) {
        const porNome = new Map<string, number>();
        ensaio.instrumentos.forEach((item) => {
          const nome = item.instrumento?.nome;
          const chave = nome ? normalizarNome(nome) : '';
          if (!chave) return;
          porNome.set(chave, (porNome.get(chave) || 0) + (item.quantidade || 0));
        });

        instrumentosTela.forEach((instrumento) => {
          const chave = normalizarNome(instrumento.nome);
          const quantidadePorNome = porNome.get(chave);
          if (!quantidadePorNome) return;
          if (novasQuantidades[instrumento.id] !== undefined) return;
          novasQuantidades[instrumento.id] = quantidadePorNome;
        });
      }

      setQuantidades(novasQuantidades);
      
      // Preencher funções
      if (ensaio.funcoes) {
        setFuncoes({
          ancioes: ensaio.funcoes.ancioes || undefined,
          diaconos: ensaio.funcoes.diaconos || undefined,
          cooperadorOficio: ensaio.funcoes.cooperadorOficio || undefined,
          cooperadorJovens: ensaio.funcoes.cooperadorJovens || undefined,
          examinadora: ensaio.funcoes.examinadora || undefined,
          encarregadosLocais: ensaio.funcoes.encarregadosLocais || undefined,
          encarregadosRegionais: ensaio.funcoes.encarregadosRegionais || undefined,
          instrutores: ensaio.funcoes.instrutores || undefined,
        });
      }

      setAtendimento({
        primeiroNome: ensaio.atendimento1Nome || '',
        primeiroTipo: (ensaio.atendimento1Tipo as AtendimentoTipo) || '',
        segundoNome: ensaio.atendimento2Nome || '',
        segundoTipo: (ensaio.atendimento2Tipo as AtendimentoTipo) || '',
      });
      
      // Preencher hinos e regência
      setHinosEnsaidos(ensaio.hinosEnsaidos || '');
      setRegencia(ensaio.regencia || '');

      // Preencher músicos presentes
      if (ensaio.musicos) {
        setMusicosSelecionados(ensaio.musicos.map((item) => item.musicoId));
      } else {
        setMusicosSelecionados([]);
      }
    } catch (error) {
      console.error('Erro ao carregar ensaio:', error);
      alert('Erro ao carregar ensaio. Redirecionando...');
      router.push('/instrutor');
    } finally {
      setCarregandoEnsaio(false);
    }
  }

  async function carregarInstrumentos(): Promise<Instrumento[]> {
    try {
      const res = await apiFetch('/api/instrumentos');
      if (!res.ok) {
        console.error('Erro ao carregar instrumentos:', res.status, res.statusText);
        setInstrumentos([]);
        return [];
      }
      const data = await res.json();
      // Filtrar apenas instrumentos válidos (com nome)
      const instrumentosValidos = Array.isArray(data)
        ? data.filter((instrumento: Instrumento) => instrumento?.nome?.trim())
        : [];
      setInstrumentos(instrumentosValidos);
      return instrumentosValidos;
    } catch (error) {
      console.error('Erro ao carregar instrumentos:', error);
      setInstrumentos([]);
      return [];
    }
  }

  async function carregarMusicos(instrutorId: number) {
    const res = await apiFetch('/api/musicos', {
      headers: { Authorization: `Bearer ${instrutorId}` },
    });
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setMusicos(data);
  }

  function alternarMusico(musicoId: number) {
    setMusicosSelecionados((atual) =>
      atual.includes(musicoId)
        ? atual.filter((id) => id !== musicoId)
        : [...atual, musicoId]
    );
  }

  async function adicionarNovoInstrumento(nome: string) {
    const res = await apiFetch('/api/instrumentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    });
    if (res.ok) {
      await carregarInstrumentos();
      return;
    }

    const dataErro = await res.json().catch(() => null);
    alert(dataErro?.error || 'Erro ao adicionar instrumento');
  }

  async function salvarEnsaio() {
    setCarregando(true);
    try {
      // Encontrar o ID do instrumento "Órgão"
      const nomesOrganista = new Set(['ORGAO', 'ORGANISTA']);
      const orgao = instrumentos.find((i) => nomesOrganista.has(normalizarNome(i.nome)));
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

      const body = {
        data,
        instrumentos: Object.entries(quantidades)
          .filter(([_, qtd]) => qtd > 0)
          .map(([id, qtd]) => ({
            instrumentoId: parseInt(id),
            quantidade: qtd,
          })),
        musicos: musicosSelecionados.map((musicoId) => ({
          musicoId,
        })),
        funcoes: {
          ancioes: funcoes.ancioes ?? 0,
          diaconos: funcoes.diaconos ?? 0,
          cooperadorOficio: funcoes.cooperadorOficio ?? 0,
          cooperadorJovens: funcoes.cooperadorJovens ?? 0,
          examinadora: funcoes.examinadora ?? 0,
          encarregadosLocais: funcoes.encarregadosLocais ?? 0,
          encarregadosRegionais: funcoes.encarregadosRegionais ?? 0,
          instrutores: funcoes.instrutores ?? 0,
        },
        atendimento1Nome: atendimento.primeiroNome.trim() || null,
        atendimento1Tipo: atendimento.primeiroTipo || null,
        atendimento2Nome: atendimento.segundoNome.trim() || null,
        atendimento2Tipo: atendimento.segundoTipo || null,
        totalGeral,
        hinosEnsaidos: hinosEnsaidos.trim() || null,
        regencia: regencia.trim() || null,
      };

      const url = isEditando && ensaioId ? `/api/ensaios/${ensaioId}` : '/api/ensaios';
      const method = isEditando && ensaioId ? 'PUT' : 'POST';

      const res = await fetchWithCSRF(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditando ? body : { ...body, instrutorId: usuario.id }),
      });

      if (res.ok) {
        router.push('/instrutor');
      } else {
        const errorData = await res.json();
        alert(`Erro ao ${isEditando ? 'atualizar' : 'salvar'} ensaio: ${errorData.error || 'Erro desconhecido'}`);
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="portal-shell">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--text-primary)]">
          {isEditando ? 'Editar Ensaio' : 'Novo Ensaio'}
        </h1>
        
        {carregandoEnsaio && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
            Carregando dados do ensaio...
          </div>
        )}

        <div className="space-y-6 bg-[var(--bg-surface)] border border-[var(--border-default)] p-4 sm:p-6 rounded-xl shadow-sm">
          <div>
            <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">Data do Ensaio</label>
            <DateInputBR
              value={data}
              onChange={(value) => setData(value)}
              required
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

          <MusicosForm
            musicos={musicos}
            selecionados={musicosSelecionados}
            onToggle={alternarMusico}
          />

          <FuncoesForm
            valores={funcoes}
            onChange={(campo, valor) => {
              setFuncoes({ ...funcoes, [campo]: valor });
            }}
          />

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Atendimento</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Informe quem atendeu o culto/ensaio e a função ministerial de cada pessoa.
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Dica: se deixar em branco, o PDF tenta usar automaticamente a Regência no formato
              {' '}<strong>Regional - Nome - Localidade</strong> ou <strong>Local - Nome - Localidade</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">1º Atendimento</label>
                <input
                  type="text"
                  value={atendimento.primeiroNome}
                  onChange={(e) => setAtendimento({ ...atendimento, primeiroNome: e.target.value })}
                  placeholder="Ex: Eduardo"
                  className="w-full border border-[var(--border-default)] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-[var(--text-primary)] bg-white"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">Função do 1º</label>
                <select
                  value={atendimento.primeiroTipo}
                  onChange={(e) => setAtendimento({ ...atendimento, primeiroTipo: e.target.value as AtendimentoTipo })}
                  className="w-full border border-[var(--border-default)] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-[var(--text-primary)] bg-white"
                >
                  {TIPOS_ATENDIMENTO.map((tipo) => (
                    <option key={`primeiro-${tipo.value || 'vazio'}`} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">2º Atendimento</label>
                <input
                  type="text"
                  value={atendimento.segundoNome}
                  onChange={(e) => setAtendimento({ ...atendimento, segundoNome: e.target.value })}
                  placeholder="Ex: Willian"
                  className="w-full border border-[var(--border-default)] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-[var(--text-primary)] bg-white"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">Função do 2º</label>
                <select
                  value={atendimento.segundoTipo}
                  onChange={(e) => setAtendimento({ ...atendimento, segundoTipo: e.target.value as AtendimentoTipo })}
                  className="w-full border border-[var(--border-default)] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-[var(--text-primary)] bg-white"
                >
                  {TIPOS_ATENDIMENTO.map((tipo) => (
                    <option key={`segundo-${tipo.value || 'vazio'}`} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">Hinos Ensaiados</label>
            <input
              type="text"
              value={hinosEnsaidos}
              onChange={(e) => setHinosEnsaidos(e.target.value)}
              placeholder="Ex: 1, 22, 33, 44"
              className="w-full border border-[var(--border-default)] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-[var(--text-primary)] bg-white"
            />
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Digite os números dos hinos separados por vírgula
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">Regência</label>
            <textarea
              value={regencia}
              onChange={(e) => setRegencia(e.target.value)}
              placeholder="Ex:&#10;João Silva São Paulo Central&#10;Pedro Oliveira Campinas Bairro Novo"
              rows={4}
              className="w-full border border-[var(--border-default)] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors resize-y text-[var(--text-primary)] bg-white"
            />
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Digite um por linha. Exemplo: Regional - Eduardo - Cruzeiro
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={salvarEnsaio}
              disabled={carregando || carregandoEnsaio}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-md hover:shadow-lg"
            >
              {carregando ? (isEditando ? 'Atualizando...' : 'Salvando...') : (isEditando ? 'Atualizar Ensaio' : 'Salvar Ensaio')}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 sm:flex-none bg-[var(--bg-muted)] text-[var(--text-primary)] px-6 py-3 rounded-lg hover:opacity-90 transition-colors font-medium border border-[var(--border-default)]"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NovoEnsaioPage() {
  return (
    <Suspense fallback={
      <div className="portal-shell">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="text-center py-8 text-[var(--text-secondary)]">Carregando...</div>
        </div>
      </div>
    }>
      <NovoEnsaioContent />
    </Suspense>
  );
}
