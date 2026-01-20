'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ensaio, Instrumento } from '@/types';

interface RelatorioTableProps {
  ensaios: Ensaio[];
  instrumentos: Instrumento[];
  onGerarPDF: (ensaio: Ensaio) => void;
  onEnviarWebhook?: (ensaio: Ensaio) => void;
  onEditar?: (ensaio: Ensaio) => void;
}

export default function RelatorioTable({
  ensaios,
  instrumentos,
  onGerarPDF,
  onEnviarWebhook,
  onEditar,
}: RelatorioTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
      <div className="block sm:hidden">
        {/* Versão mobile: cards */}
        {ensaios.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum ensaio encontrado</div>
        ) : (
          <div className="divide-y">
            {ensaios.map((ensaio) => (
              <div key={ensaio.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-primary">
                      {format(new Date(ensaio.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Instrutor: {ensaio.instrutor?.nome || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Igreja: {ensaio.instrutor?.igreja || '-'}
                    </p>
                    <p className="text-sm text-gray-600">Total: {ensaio.totalGeral}</p>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    {onEditar ? (
                      <button
                        onClick={() => onEditar(ensaio)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium whitespace-nowrap"
                        title="Editar ensaio"
                      >
                        ✏️ Editar
                      </button>
                    ) : null}
                    {onEnviarWebhook ? (
                      <button
                        onClick={() => onEnviarWebhook(ensaio)}
                        className="bg-accent text-white px-3 py-2 rounded-lg hover:bg-accent-dark transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        Enviar
                      </button>
                    ) : null}
                    <button
                      onClick={() => onGerarPDF(ensaio)}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Versão desktop: tabela */}
      <table className="hidden sm:table min-w-full">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-4 py-3 text-left font-semibold">Data</th>
            <th className="px-4 py-3 text-left font-semibold">Instrutor</th>
            <th className="px-4 py-3 text-left font-semibold">Igreja</th>
            <th className="px-4 py-3 text-left font-semibold">Total Geral</th>
            <th className="px-4 py-3 text-left font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {ensaios.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                Nenhum ensaio encontrado
              </td>
            </tr>
          ) : (
            ensaios.map((ensaio) => (
              <tr key={ensaio.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  {format(new Date(ensaio.data), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="px-4 py-3">
                  {ensaio.instrutor?.nome || 'N/A'}
                </td>
                <td className="px-4 py-3">
                  {ensaio.instrutor?.igreja || '-'}
                </td>
                <td className="px-4 py-3 font-medium">{ensaio.totalGeral}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 items-center flex-wrap">
                    {onEditar ? (
                      <button
                        onClick={() => onEditar(ensaio)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium whitespace-nowrap"
                        title="Editar ensaio"
                      >
                        ✏️ Editar
                      </button>
                    ) : null}
                    {onEnviarWebhook ? (
                      <button
                        onClick={() => onEnviarWebhook(ensaio)}
                        className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        Enviar
                      </button>
                    ) : null}
                    <button
                      onClick={() => onGerarPDF(ensaio)}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      Gerar PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
