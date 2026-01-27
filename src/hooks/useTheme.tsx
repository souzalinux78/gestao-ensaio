'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'gestao-ensaio-theme';

/**
 * Hook para gerenciar tema dark/light
 * - Detecta preferência do sistema
 * - Salva preferência no localStorage
 * - Aplica tema no documento
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Inicializar tema
  useEffect(() => {
    // Verificar se há preferência salva
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      // Usar preferência salva
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Detectar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme: Theme = prefersDark ? 'dark' : 'light';
      setTheme(systemTheme);
      applyTheme(systemTheme);
    }
    
    setMounted(true);
    
    // Escutar mudanças na preferência do sistema (se não houver preferência salva)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      // Só aplicar mudança do sistema se não houver preferência salva
      if (!savedTheme) {
        const newTheme: Theme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Aplicar tema no documento
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  };

  // Alternar tema
  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  // Definir tema específico
  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  return {
    theme,
    toggleTheme,
    setTheme: setThemeValue,
    mounted, // Para evitar flash de conteúdo incorreto
  };
}
