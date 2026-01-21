'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CadastroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    igreja: '',
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    if (!formData.nome || !formData.email || !formData.senha || !formData.igreja) {
      setErro('Todos os campos são obrigatórios');
      setCarregando(false);
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      setCarregando(false);
      return;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      setCarregando(false);
      return;
    }

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          tipo: 'instrutor',
          igreja: formData.igreja,
          aprovado: false, // Sempre criar como não aprovado
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSucesso(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setErro(data.error || 'Erro ao criar conta');
      }
    } catch (error) {
      setErro('Erro ao criar conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-4">Cadastro Realizado!</h2>
          <p className="text-gray-600 mb-6">
            Seu cadastro foi enviado com sucesso. Aguarde a aprovação do administrador para acessar o sistema.
          </p>
          <p className="text-sm text-gray-500">
            Redirecionando para a página de login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Criar Conta</h1>
          <p className="text-gray-600 text-sm">Preencha os dados para se cadastrar</p>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Nome Completo</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Igreja/Congregação</label>
            <input
              type="text"
              value={formData.igreja}
              onChange={(e) => setFormData({ ...formData, igreja: e.target.value })}
              placeholder="Ex: CCB Teste"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              required
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-500">Mínimo de 6 caracteres</p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Confirmar Senha</label>
            <input
              type="password"
              value={formData.confirmarSenha}
              onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {carregando ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <a href="/login" className="text-primary hover:text-primary-dark font-medium">
              Fazer login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
