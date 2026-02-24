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

const MAPEAMENTO_NAIPES: Record<string, Naipe> = {
  // Cordas
  'violino': 'Cordas',
  'violino contralto': 'Cordas',
  'viola': 'Cordas',
  'violoncelo': 'Cordas',
  // Madeiras
  'flauta': 'Madeiras',
  'flauta contralto': 'Madeiras',
  'flauta baixo': 'Madeiras',
  'clarinete': 'Madeiras',
  'clarinete alto': 'Madeiras',
  'clarinete baixo': 'Madeiras',
  'clarinete contra baixo': 'Madeiras',
  'oboe': 'Madeiras',
  "oboe d'amore": 'Madeiras',
  'oboe d amore': 'Madeiras',
  'corne ingles': 'Madeiras',
  'fagote': 'Madeiras',
  'saxofone sopranino c': 'Madeiras',
  'saxofone sopranino r': 'Madeiras',
  'saxofone soprano cur': 'Madeiras',
  'saxofone soprano ret': 'Madeiras',
  'saxofone soprano curvo': 'Madeiras',
  'saxofone soprano reto': 'Madeiras',
  'saxofone alto': 'Madeiras',
  'saxofone tenor': 'Madeiras',
  'saxofone baritono': 'Madeiras',
  'saxofone baixo': 'Madeiras',
  // Metais
  'pocket': 'Metais',
  'cornet': 'Metais',
  'trompete': 'Metais',
  'flugelhorn': 'Metais',
  'trompa': 'Metais',
  'trombonito': 'Metais',
  'baritono de pisto': 'Metais',
  'melofone': 'Metais',
  'trombone': 'Metais',
  'sax horn': 'Metais',
  'tuba wagneriana': 'Metais',
  'euphonium': 'Metais',
  'tuba': 'Metais',
  // Teclas
  'acordeon': 'Teclas',
  'organista': 'Teclas',
  'orgao': 'Teclas',
};

function normalizarTexto(valor: string) {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function identificarNaipe(nomeInstrumento: string): Naipe {
  const nomeNormalizado = normalizarTexto(nomeInstrumento);
  return MAPEAMENTO_NAIPES[nomeNormalizado] ?? 'Outros';
}

export default function InstrumentoForm({
  instrumentos,
  valores,
  onChange,
  onAdicionarNovo,
}: InstrumentoFormProps) {
  const [novoInstrumento, setNovoInstrumento] = useState('');
  const [mostrarNovo, setMostrarNovo] = useState(false);
  // Map para armazenar valores temporários durante digitação
  const [valoresTemporarios, setValoresTemporarios] = useState<Map<number, string>>(new Map());
  
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
    // Validar se instrumento tem nome válido
    const nomeInstrumento = instrumento?.nome?.trim() || `Instrumento #${instrumento.id}`;
    const nomeInstrumentoExibicao =
      normalizarTexto(nomeInstrumento) === 'organista' ? 'Organista' : nomeInstrumento;
    
    // Obter valor do estado temporário ou do estado principal
    const valorTemporario = valoresTemporarios.get(instrumento.id);
    const valorPrincipal = valores[instrumento.id] !== undefined &&
      valores[instrumento.id] !== null &&
      valores[instrumento.id] > 0
        ? String(valores[instrumento.id])
        : '';
    
    // Usar valor temporário se existir, senão usar valor principal
    const valorExibido = valorTemporario !== undefined ? valorTemporario : valorPrincipal;

    return (
      <div key={instrumento.id} className="flex items-center gap-2 sm:gap-3">
        <label 
          htmlFor={`instrumento-qtd-${instrumento.id}`}
          className="flex-1 text-sm sm:text-base text-gray-700 min-w-0 truncate"
          title={nomeInstrumentoExibicao}
        >
          {nomeInstrumentoExibicao}
        </label>
        <input
          id={`instrumento-qtd-${instrumento.id}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={valorExibido}
          aria-label={`Quantidade de ${nomeInstrumento}`}
          onChange={(e) => {
            // Permitir apenas números
            const valorDigitado = e.target.value.replace(/[^0-9]/g, '');
            
            // Atualizar valor temporário imediatamente para feedback visual
            const novosValoresTemporarios = new Map(valoresTemporarios);
            if (valorDigitado === '') {
              novosValoresTemporarios.delete(instrumento.id);
            } else {
              novosValoresTemporarios.set(instrumento.id, valorDigitado);
            }
            setValoresTemporarios(novosValoresTemporarios);

            // Se estiver vazio, remover do estado pai
            if (valorDigitado === '') {
              onChange(instrumento.id, undefined);
              return;
            }

            // Converter para número
            const valor = parseInt(valorDigitado, 10);

            // Se for um número válido e maior que 0, salvar no estado pai
            if (!isNaN(valor) && valor > 0) {
              onChange(instrumento.id, valor);
            } else {
              // Se for 0 ou inválido, remover do estado pai mas manter no temporário para digitação
              onChange(instrumento.id, undefined);
            }
          }}
          onBlur={(e) => {
            // Ao sair do campo, validar e limpar se necessário
            const valorDigitado = e.target.value.replace(/[^0-9]/g, '');
            
            // Remover do estado temporário
            const novosValoresTemporarios = new Map(valoresTemporarios);
            novosValoresTemporarios.delete(instrumento.id);
            setValoresTemporarios(novosValoresTemporarios);
            
            if (valorDigitado === '' || valorDigitado === '0') {
              // Limpar se estiver vazio ou for apenas 0
              onChange(instrumento.id, undefined);
            } else {
              // Garantir que o valor final está salvo corretamente
              const valor = parseInt(valorDigitado, 10);
              if (!isNaN(valor) && valor > 0) {
                onChange(instrumento.id, valor);
              } else {
                onChange(instrumento.id, undefined);
              }
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
          placeholder="0"
          className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 w-16 sm:w-20 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-center text-gray-900 bg-white"
        />
      </div>
    );
  }

  // Filtrar instrumentos válidos (com nome)
  const instrumentosValidos = instrumentos.filter((inst) => inst?.nome?.trim());
  
  // Verificar se há instrumentos para exibir
  const temInstrumentos = instrumentosValidos.length > 0;
  const naipesComInstrumentos = ORDEM_NAIPES.filter((naipe) => {
    const lista = instrumentosPorNaipe.get(naipe);
    return lista && lista.length > 0 && lista.some((inst) => inst?.nome?.trim());
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Instrumentos</h3>
      
      {temInstrumentos ? (
        <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50 space-y-6">
          {naipesComInstrumentos.map((naipe) => {
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
                  {lista
                    .filter((inst) => inst?.nome?.trim()) // Filtrar apenas instrumentos com nome válido
                    .map((instrumento) => renderInstrumentoItem(instrumento))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-center text-gray-500 text-sm">
          Nenhum instrumento cadastrado. Use o botão abaixo para adicionar.
        </div>
      )}

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
