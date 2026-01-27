'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast from '@/components/Toast';

export interface ToastMessage {
  id: string;
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
  texto: string;
}

interface ToastContextType {
  showToast: (tipo: 'sucesso' | 'erro' | 'aviso' | 'info', texto: string) => string;
  success: (texto: string) => void;
  error: (texto: string) => void;
  warning: (texto: string) => void;
  info: (texto: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((tipo: 'sucesso' | 'erro' | 'aviso' | 'info', texto: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, tipo, texto };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((texto: string) => showToast('sucesso', texto), [showToast]);
  const error = useCallback((texto: string) => showToast('erro', texto), [showToast]);
  const warning = useCallback((texto: string) => showToast('aviso', texto), [showToast]);
  const info = useCallback((texto: string) => showToast('info', texto), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full sm:w-auto">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              tipo={toast.tipo}
              texto={toast.texto}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
}
