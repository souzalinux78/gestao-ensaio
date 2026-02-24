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
  onExcluir?: (ensaio: Ensaio) => void;
}

export default function RelatorioTable({
  ensaios,
  instrumentos,
  onGerarPDF,
  onEnviarWebhook,
  onEditar,
  onExcluir,
}: RelatorioTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
      <div className="block sm:hidden">
        {/* Versão mobile: cards */}
        {ensaios.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Nenhum ensaio encontrado</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
            {ensaios.map((ensaio) => (
              <div key={ensaio.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {format(new Date(ensaio.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Responsável: {ensaio.instrutor?.nome || 'N/A'}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Igreja: {ensaio.instrutor?.igreja || '-'}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total: {ensaio.totalGeral}</p>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    {onEditar ? (
                      <button
                        onClick={() => onEditar(ensaio)}
                        className="px-3 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                        style={{
                          backgroundColor: 'var(--bg-muted)',
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                        title="Editar ensaio"
                      >
                        ✏️ Editar
                      </button>
                    ) : null}
                    {onEnviarWebhook ? (
                      <button
                        onClick={() => onEnviarWebhook(ensaio)}
                        className="px-3 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                        style={{
                          backgroundColor: 'var(--pe-gold-main)',
                          color: 'var(--pe-black)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-strong)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-main)'}
                      >
                        Enviar
                      </button>
                    ) : null}
                    {onExcluir ? (
                      <button
                        onClick={() => onExcluir(ensaio)}
                        className="px-3 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                        style={{
                          backgroundColor: '#ef4444',
                          color: '#ffffff'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                      >
                        Excluir
                      </button>
                    ) : null}
                    <button
                      onClick={() => onGerarPDF(ensaio)}
                      className="px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--dark-primary)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
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
          <tr style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
            <th className="px-4 py-3 text-left font-semibold">Data</th>
            <th className="px-4 py-3 text-left font-semibold">Responsável</th>
            <th className="px-4 py-3 text-left font-semibold">Igreja</th>
            <th className="px-4 py-3 text-left font-semibold">Total Geral</th>
            <th className="px-4 py-3 text-left font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
          {ensaios.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                Nenhum ensaio encontrado
              </td>
            </tr>
          ) : (
            ensaios.map((ensaio, index) => (
              <tr 
                key={ensaio.id} 
                className="transition-colors"
                style={{ 
                  backgroundColor: index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-page)'
                }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-page)'}
              >
                <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                  {format(new Date(ensaio.data), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                  {ensaio.instrutor?.nome || 'N/A'}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                  {ensaio.instrutor?.igreja || '-'}
                </td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{ensaio.totalGeral}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 items-center flex-wrap">
                    {onEditar ? (
                      <button
                        onClick={() => onEditar(ensaio)}
                        className="px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                        style={{
                          backgroundColor: 'var(--bg-muted)',
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                        title="Editar ensaio"
                      >
                        ✏️ Editar
                      </button>
                    ) : null}
                    {onEnviarWebhook ? (
                      <button
                        onClick={() => onEnviarWebhook(ensaio)}
                        className="px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                        style={{
                          backgroundColor: 'var(--pe-gold-main)',
                          color: 'var(--pe-black)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-strong)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-main)'}
                      >
                        Enviar
                      </button>
                    ) : null}
                    {onExcluir ? (
                      <button
                        onClick={() => onExcluir(ensaio)}
                        className="px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                        style={{
                          backgroundColor: '#ef4444',
                          color: '#ffffff'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                      >
                        Excluir
                      </button>
                    ) : null}
                    <button
                      onClick={() => onGerarPDF(ensaio)}
                      className="px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--dark-primary)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
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
