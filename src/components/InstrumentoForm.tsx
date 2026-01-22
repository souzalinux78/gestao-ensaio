'use client';

import { useMemo, useState } from 'react';
import { Instrumento } from '@/types';

interface InstrumentoFormProps {
  instrumentos: Instrumento[];
  valores: { [key: number]: number };
  onChange: (instrumentoId: number, quantidade: number | undefined) => void;
  onAdicionarNovo: (nome: string) => void;
}

type Naipe = 'Cordas' | 'Madeiras' | 'Metais' | 'Teclas' | 'Outros';

const ORDEM_NAIPES: Naipe[] = ['Cordas', 'Madeiras', 'Metais', 'Teclas', 'Outros'];

const PALAVRAS_CHAVE_POR_NAIPE: Record<Naipe, string[]> = {
  Cordas: [
    'violino',
    'viola',
    'violoncelo',
    'contrabaixo',
    'harpa',
    'violao',
    'guitarra',
    'bandolim',
    'cavaquinho',
  ],
  Madeiras: [
    'flauta',
    'flautim',
    'piccolo',
    'clarinete',
    'oboe',
    'oboé',
    'fagote',
    'sax',
  ],
  Metais: [
    'trompete',
    'trombone',
    'tuba',
    'trompa',
    'cornet',
    'corneta',
    'bombardino',
    'baritono',
    'barítono',
    'eufonio',
    'eufônio',
    'pisto',
  ],
  Teclas: ['orgao', 'órgão', 'piano', 'teclado', 'acordeon', 'acordeão'],
  Outros: [],
};

function normalizarTexto(valor: string) {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function identificarNaipe(nomeInstrumento: string): Naipe {
  const nomeNormalizado = normalizarTexto(nomeInstrumento);

  for (const naipe of ORDEM_NAIPES) {
    const palavrasChave = PALAVRAS_CHAVE_POR_NAIPE[naipe];
    if (palavrasChave.some((palavra) => nomeNormalizado.includes(normalizarTexto(palavra)))) {
      return naipe;
    }
  }

  return 'Outros';
}

export default function InstrumentoForm({
  instrumentos,
  valores,
  onChange,
  onAdicionarNovo,
}: InstrumentoFormProps) {
  const [novoInstrumento, setNovoInstrumento] = useState('');
  const [mostrarNovo, setMostrarNovo] = useState(false);
  const instrumentosPorNaipe = useMemo(() => {
    const grupos = new Map<Naipe, Instrumento[]>();

    instrumentos.forEach((instrumento) => {
      const naipe = identificarNaipe(instrumento.nome);
      const lista = grupos.get(naipe) ?? [];
      lista.push(instrumento);
      grupos.set(naipe, lista);
    });

    return grupos;
  }, [instrumentos]);

  function renderInstrumentoItem(instrumento: Instrumento) {
    return (
      <div key={instrumento.id} className="flex items-center gap-2 sm:gap-3">
        <label className="flex-1 text-sm sm:text-base text-gray-700 min-w-0 truncate">
          {instrumento.nome}
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={
            valores[instrumento.id] !== undefined &&
            valores[instrumento.id] !== null &&
            valores[instrumento.id] > 0
              ? String(valores[instrumento.id])
              : ''
          }
          onChange={(e) => {
            // Permitir apenas números
            const valorDigitado = e.target.value.replace(/[^0-9]/g, '');

            // Se estiver vazio, remover do estado
            if (valorDigitado === '') {
              onChange(instrumento.id, undefined);
              return;
            }

            // Se for apenas "0", também remover
            if (valorDigitado === '0') {
              onChange(instrumento.id, undefined);
              return;
            }

            // Converter para número
            const valor = parseInt(valorDigitado, 10);

            // Se for um número válido e maior que 0, salvar
            if (!isNaN(valor) && valor > 0) {
              onChange(instrumento.id, valor);
            } else {
              // Se não for válido, remover
              onChange(instrumento.id, undefined);
            }
          }}
          onBlur={(e) => {
            // Ao sair do campo, se estiver vazio ou 0, garantir que está limpo
            if (e.target.value === '' || e.target.value === '0') {
              onChange(instrumento.id, undefined);
            }
          }}
          onKeyDown={(e) => {
            // Bloquear teclas que não são números, backspace, delete, tab, etc
            const allowedKeys = [
              'Backspace',
              'Delete',
              'Tab',
              'Escape',
              'Enter',
              'ArrowLeft',
              'ArrowRight',
              'ArrowUp',
              'ArrowDown',
              'Home',
              'End',
            ];
            const isNumber = /^[0-9]$/.test(e.key);
            if (!isNumber && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
              e.preventDefault();
            }
          }}
          placeholder=""
          className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 w-16 sm:w-20 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-center"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Instrumentos</h3>
      
      <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50 space-y-6">
        {ORDEM_NAIPES.map((naipe) => {
          const lista = instrumentosPorNaipe.get(naipe);
          if (!lista || lista.length === 0) {
            return null;
          }

          return (
            <div key={naipe} className="space-y-2">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {naipe}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lista.map((instrumento) => renderInstrumentoItem(instrumento))}
              </div>
            </div>
          );
        })}
      </div>

      {mostrarNovo ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <input
            type="text"
            value={novoInstrumento}
            onChange={(e) => setNovoInstrumento(e.target.value)}
            placeholder="Nome do novo instrumento"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (novoInstrumento.trim()) {
                  onAdicionarNovo(novoInstrumento.trim());
                  setNovoInstrumento('');
                  setMostrarNovo(false);
                }
              }}
              className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Adicionar
            </button>
            <button
              onClick={() => {
                setMostrarNovo(false);
                setNovoInstrumento('');
              }}
              className="bg-gray-400 text-white px-4 py-2.5 rounded-lg hover:bg-gray-500 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMostrarNovo(true)}
          className="mt-4 w-full sm:w-auto bg-accent text-white px-4 py-2.5 rounded-lg hover:bg-accent-dark transition-colors font-medium shadow-md hover:shadow-lg"
        >
          + Adicionar Novo Instrumento
        </button>
      )}
    </div>
  );
}
