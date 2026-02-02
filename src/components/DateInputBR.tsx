'use client';

import { useState, useEffect } from 'react';

interface DateInputBRProps {
  value: string; // Formato ISO: YYYY-MM-DD
  onChange: (value: string) => void; // Recebe formato ISO
  className?: string;
  required?: boolean;
}

export default function DateInputBR({ value, onChange, className = '', required = false }: DateInputBRProps) {
  // Converter ISO (YYYY-MM-DD) para BR (DD/MM/YYYY)
  const isoToBR = (iso: string): string => {
    if (!iso) return '';
    const [year, month, day] = iso.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    return '';
  };

  // Converter BR (DD/MM/YYYY) para ISO (YYYY-MM-DD)
  const brToISO = (br: string): string => {
    // Remove caracteres não numéricos
    const numbers = br.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    
    // Formata como DD/MM/YYYY
    let formatted = numbers;
    if (numbers.length > 2) {
      formatted = numbers.slice(0, 2) + '/' + numbers.slice(2);
    }
    if (numbers.length > 4) {
      formatted = numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
    }
    
    // Se tiver 8 dígitos, converter para ISO
    if (numbers.length === 8) {
      const day = numbers.slice(0, 2);
      const month = numbers.slice(2, 4);
      const year = numbers.slice(4, 8);
      
      // Validar data
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
        return `${year}-${month}-${day}`;
      }
    }
    
    return '';
  };

  const [displayValue, setDisplayValue] = useState(isoToBR(value));
  const [showPicker, setShowPicker] = useState(false);

  // Sincronizar quando value mudar externamente
  useEffect(() => {
    setDisplayValue(isoToBR(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Permitir apenas números e barras
    const cleaned = inputValue.replace(/[^\d/]/g, '');
    
    // Aplicar máscara DD/MM/YYYY
    let formatted = cleaned;
    if (cleaned.length > 2 && !cleaned.includes('/')) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    if (cleaned.length > 8) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    
    setDisplayValue(formatted);
    
    // Converter para ISO quando tiver 10 caracteres (DD/MM/YYYY)
    if (formatted.length === 10) {
      const iso = brToISO(formatted);
      if (iso) {
        onChange(iso);
      }
    } else if (formatted.length === 0) {
      onChange('');
    }
  };

  const handleBlur = () => {
    // Validar e corrigir ao sair do campo
    if (displayValue.length > 0 && displayValue.length < 10) {
      // Se não estiver completo, limpar
      setDisplayValue('');
      onChange('');
    } else if (displayValue.length === 10) {
      const iso = brToISO(displayValue);
      if (!iso) {
        // Data inválida, limpar
        setDisplayValue('');
        onChange('');
      } else {
        // Garantir que está formatado corretamente
        setDisplayValue(isoToBR(iso));
      }
    }
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="DD/MM/AAAA"
          maxLength={10}
          className={`flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-gray-900 bg-white ${className}`}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Abrir calendário"
        >
          📅
        </button>
      </div>
      {showPicker && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <input
            type="date"
            value={value}
            onChange={handleDatePickerChange}
            className="border-0 p-2 text-gray-900 bg-white"
            lang="pt-BR"
          />
        </div>
      )}
      {value && (
        <p className="text-sm text-gray-500 mt-1">
          Data selecionada: {isoToBR(value)}
        </p>
      )}
    </div>
  );
}
