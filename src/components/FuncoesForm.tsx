'use client';

interface FuncoesFormProps {
  valores: {
    ancioes: number;
    diaconos: number;
    cooperadorOficio: number;
    cooperadorJovens: number;
    encarregadosLocais: number;
    encarregadosRegionais: number;
    instrutores: number;
  };
  onChange: (campo: string, valor: number) => void;
}

export default function FuncoesForm({ valores, onChange }: FuncoesFormProps) {
  const campos = [
    { key: 'ancioes', label: 'Anciões' },
    { key: 'diaconos', label: 'Diáconos' },
    { key: 'cooperadorOficio', label: 'Cooperador de Ofício' },
    { key: 'cooperadorJovens', label: 'Cooperador de Jovens' },
    { key: 'encarregadosLocais', label: 'Encarregados Locais' },
    { key: 'encarregadosRegionais', label: 'Encarregados Regionais' },
    { key: 'instrutores', label: 'Instrutores' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Ministério</h3>
      <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <strong>Nota:</strong> Instrutores, Encarregados Locais e Regionais já estão tocando instrumentos, 
        por isso não são contabilizados no total geral.
      </p>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Ministério (contabilizado no total):</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {campos.filter(c => ['ancioes', 'diaconos', 'cooperadorOficio', 'cooperadorJovens'].includes(c.key)).map((campo) => (
              <div key={campo.key} className="flex items-center gap-3">
                <label className="flex-1 text-sm sm:text-base text-gray-700">{campo.label}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={(valores[campo.key as keyof typeof valores] && valores[campo.key as keyof typeof valores] > 0) ? String(valores[campo.key as keyof typeof valores]) : ''}
                  onChange={(e) => {
                    // Permitir apenas números
                    const valorDigitado = e.target.value.replace(/[^0-9]/g, '');
                    if (valorDigitado === '' || valorDigitado === '0') {
                      // Se estiver vazio ou for 0, passar 0 mas não mostrar
                      onChange(campo.key, 0);
                    } else {
                      const valor = parseInt(valorDigitado);
                      if (!isNaN(valor) && valor > 0) {
                        onChange(campo.key, valor);
                      } else {
                        onChange(campo.key, 0);
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    // Bloquear teclas que não são números, backspace, delete, tab, etc
                    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                    const isNumber = /^[0-9]$/.test(e.key);
                    if (!isNumber && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                    }
                  }}
                  placeholder=""
                  className="border border-gray-300 rounded-lg px-3 py-2 w-20 sm:w-24 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-center"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-3 mt-4">Músicos (não contabilizado no total):</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {campos.filter(c => ['instrutores', 'encarregadosLocais', 'encarregadosRegionais'].includes(c.key)).map((campo) => (
              <div key={campo.key} className="flex items-center gap-3">
                <label className="flex-1 text-sm sm:text-base text-gray-700">{campo.label}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={(valores[campo.key as keyof typeof valores] && valores[campo.key as keyof typeof valores] > 0) ? String(valores[campo.key as keyof typeof valores]) : ''}
                  onChange={(e) => {
                    // Permitir apenas números
                    const valorDigitado = e.target.value.replace(/[^0-9]/g, '');
                    if (valorDigitado === '' || valorDigitado === '0') {
                      // Se estiver vazio ou for 0, passar 0 mas não mostrar
                      onChange(campo.key, 0);
                    } else {
                      const valor = parseInt(valorDigitado);
                      if (!isNaN(valor) && valor > 0) {
                        onChange(campo.key, valor);
                      } else {
                        onChange(campo.key, 0);
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    // Bloquear teclas que não são números, backspace, delete, tab, etc
                    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                    const isNumber = /^[0-9]$/.test(e.key);
                    if (!isNumber && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                    }
                  }}
                  placeholder=""
                  className="border border-gray-300 rounded-lg px-3 py-2 w-20 sm:w-24 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-center"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
