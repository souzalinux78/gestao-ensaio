'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { salvarSessao } from '@/lib/session';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (res.ok) {
        // Salvar sessão
        salvarSessao(data);
        if (data.tipo === 'admin') {
          router.push('/admin');
        } else {
          router.push('/instrutor');
        }
      } else {
        const errorMsg = data.error || 'Credenciais inválidas';
        // Se o erro for sobre aprovação, mostrar mensagem específica
        if (errorMsg.includes('aprovado') || errorMsg.includes('aprov')) {
          setErro('Sua conta ainda não foi aprovada pelo administrador. Aguarde a aprovação.');
        } else {
          setErro(errorMsg);
        }
      }
    } catch (error) {
      setErro('Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32">
            <Image
              src="/logo.png"
              alt="Logo Gestão de Ensaio"
              fill
              style={{ objectFit: 'contain' }}
              priority
              onError={(e) => {
                // Fallback para um ícone se o logo.png não for encontrado
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d4af37'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-6h2v6zm2 0h-2v-2h2v2zm2-4h-2v-2h2v2zm-2-4h-2V7h2v2zm2 0h-2V7h2v2z'/%3E%3C/svg%3E";
                target.style.width = '100%';
                target.style.height = '100%';
              }}
            />
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            <span className="text-gray-700">Gestão de</span>{' '}
            <span className="text-accent">Ensaio</span>
          </h1>
          <p className="text-sm text-gray-600">Sistema de gestão de ensaios musicais</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {erro}
            </div>
          )}
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-md hover:shadow-lg"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <a href="/cadastro" className="text-primary hover:text-primary-dark font-medium">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
