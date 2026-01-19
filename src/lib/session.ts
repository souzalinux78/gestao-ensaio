import { Usuario } from '@/types';

const SESSION_KEY = 'gestao_ensaio_user';

export function salvarSessao(usuario: Usuario) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
  }
}

export function obterSessao(): Usuario | null {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        return JSON.parse(session);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function removerSessao() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}
