'use client';

import { useTheme } from '@/hooks/useTheme';

/**
 * Provider de tema que inicializa o sistema de tema
 * Garante que o tema seja aplicado corretamente
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Apenas inicializar o hook - ele gerencia o tema automaticamente
  useTheme();

  return <>{children}</>;
}
