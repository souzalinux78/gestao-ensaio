'use client';

import { useMemo } from 'react';
import { Musico } from '@/types';

interface MusicosFormProps {
  musicos: Musico[];
  selecionados: number[];
  onToggle: (musicoId: number) => void;
}

export default function MusicosForm({
  musicos,
  selecionados,
  onToggle,
}: MusicosFormProps) {
  const selecionadosSet = useMemo(() => new Set(selecionados), [selecionados]);

  if (musicos.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-primary">Músicos Presentes</h3>
        <div className="mt-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4">
          Nenhum músico cadastrado. Cadastre na tela "Cadastro de Músicos" para selecionar aqui.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">Músicos Presentes</h3>
        <span className="text-xs sm:text-sm text-gray-500">
          {selecionados.length} selecionado{selecionados.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {musicos.map((musico) => (
            <label
              key={musico.id}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm sm:text-base"
            >
              <input
                type="checkbox"
                checked={selecionadosSet.has(musico.id)}
                onChange={() => onToggle(musico.id)}
                className="accent-primary"
              />
              <span className="truncate">{musico.nome}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
