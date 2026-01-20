'use client';

import { useState } from 'react';
import { Instrumento } from '@/types';

interface InstrumentoFormProps {
  instrumentos: Instrumento[];
  valores: { [key: number]: number };
  onChange: (instrumentoId: number, quantidade: number) => void;
  onAdicionarNovo: (nome: string) => void;
}

export default function InstrumentoForm({
  instrumentos,
  valores,
  onChange,
  onAdicionarNovo,
}: InstrumentoFormProps) {
  const [novoInstrumento, setNovoInstrumento] = useState('');
  const [mostrarNovo, setMostrarNovo] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Instrumentos</h3>
      
      <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {instrumentos.map((instrumento) => (
            <div key={instrumento.id} className="flex items-center gap-2 sm:gap-3">
              <label className="flex-1 text-sm sm:text-base text-gray-700 min-w-0 truncate">
                {instrumento.nome}
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={valores[instrumento.id] && valores[instrumento.id] > 0 ? valores[instrumento.id].toString() : ''}
                onChange={(e) => {
                  // Permitir apenas números
                  const valorDigitado = e.target.value.replace(/[^0-9]/g, '');
                  if (valorDigitado === '') {
                    // Se estiver vazio, não atualizar (mantém vazio visualmente)
                    onChange(instrumento.id, 0);
                  } else {
                    const valor = parseInt(valorDigitado) || 0;
                    onChange(instrumento.id, valor);
                  }
                }}
                onKeyDown={(e) => {
                  // Bloquear teclas que não são números, backspace, delete, tab, etc
                  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                  const isNumber = /^[0-9]$/.test(e.key);
                  if (!isNumber && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                  }
                }}
                placeholder=""
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 w-16 sm:w-20 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-center"
              />
            </div>
          ))}
        </div>
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
