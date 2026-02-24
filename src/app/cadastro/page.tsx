'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { construirIgreja, ufEhValida } from '@/lib/igreja';

export default function CadastroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'instrutor' as 'instrutor' | 'encarregado' | 'secretario',
    localidade: '',
    cidade: '',
    uf: '',
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    if (!formData.nome || !formData.email || !formData.telefone || !formData.senha || !formData.localidade || !formData.cidade || !formData.uf) {
      setErro('Todos os campos são obrigatórios');
      setCarregando(false);
      return;
    }

    if (!ufEhValida(formData.uf)) {
      setErro('UF inválida. Use 2 letras (ex: SP).');
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

    const igrejaPadrao = construirIgreja(formData.localidade, formData.cidade, formData.uf);
    if (!igrejaPadrao) {
      setErro('Preencha Localidade, Cidade e UF corretamente.');
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
          telefone: formData.telefone,
          senha: formData.senha,
          tipo: formData.tipo,
          localidade: formData.localidade,
          cidade: formData.cidade,
          uf: formData.uf.toUpperCase(),
          igreja: igrejaPadrao,
          aprovado: false, // Sempre criar como não aprovado
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSucesso(true);
        // Não redirecionar automaticamente - deixar o usuário ler a mensagem
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
      <div className="auth-shell">
        <div className="auth-card p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pe-gold-bg)' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--pe-gold-main)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--pe-gold-main)' }}>Cadastro Realizado!</h2>
          <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
            Sua conta foi criada com sucesso.
            O administrador já foi notificado e irá aprovar
            seu cadastro no sistema Gestão de Ensaio.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2.5 rounded-lg transition-colors font-medium"
            style={{
              backgroundColor: 'var(--pe-gold-main)',
              color: 'var(--pe-black)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-strong)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--pe-gold-main)'}
          >
            Ir para Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card p-6 sm:p-8">
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--pe-gold-main)' }}>Cadastro Gestão de Ensaio</h1>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Preencha os dados para se cadastrar</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
            ⚠️ Sua conta precisará ser aprovada por um administrador antes de poder fazer login.
          </div>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Nome Completo</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full border rounded-lg px-4 py-2.5 transition-all duration-200"
              style={{
                borderColor: 'var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--pe-gold-strong)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(47, 111, 235, 0.24)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded-lg px-4 py-2.5 transition-all duration-200"
              style={{
                borderColor: 'var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--pe-gold-strong)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(47, 111, 235, 0.24)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Telefone Celular <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
              className="w-full border rounded-lg px-4 py-2.5 transition-all duration-200"
              style={{
                borderColor: 'var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--pe-gold-strong)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(47, 111, 235, 0.24)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Tipo de Cadastro <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'instrutor' | 'encarregado' | 'secretario' })}
              className="w-full border rounded-lg px-4 py-2.5 transition-all duration-200"
              style={{
                borderColor: 'var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--pe-gold-strong)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(47, 111, 235, 0.24)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            >
              <option value="instrutor">Instrutor</option>
              <option value="encarregado">Encarregado</option>
              <option value="secretario">Secretário</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Localidade</label>
            <input
              type="text"
              value={formData.localidade}
              onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
              placeholder="Ex: Bairro do Cruzeiro"
              className="w-full border rounded-lg px-4 py-2.5 transition-all duration-200"
              style={{
                borderColor: 'var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--pe-gold-strong)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(47, 111, 235, 0.24)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Cidade</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                placeholder="Ex: Bragança Paulista"
                className="w-full border rounded-lg px-4 py-2.5 transition-all duration-200"
                style={{
                  borderColor: 'var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--pe-gold-strong)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(47, 111, 235, 0.24)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>UF</label>
              <input
                type="text"
                value={formData.uf}
                onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase().slice(0, 2) })}
                placeholder="SP"
                className="w-full border rounded-lg px-4 py-2.5 transition-all duration-200 uppercase"
                style={{
                  borderColor: 'var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--pe-gold-strong)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(47, 111, 235, 0.24)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Senha</label>
            <input
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              className="w-full border rounded-lg px-4 py-2.5 transition-all duration-200"
              style={{
                borderColor: 'var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--pe-gold-strong)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(47, 111, 235, 0.24)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
              minLength={6}
            />
            <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Mínimo de 6 caracteres</p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Confirmar Senha</label>
            <input
              type="password"
              value={formData.confirmarSenha}
              onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
              className="w-full border rounded-lg px-4 py-2.5 transition-all duration-200"
              style={{
                borderColor: 'var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--pe-gold-strong)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(47, 111, 235, 0.24)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--dark-primary)'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--accent-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
              }
            }}
          >
            {carregando ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Já tem uma conta?{' '}
            <a 
              href="/login" 
              className="font-medium transition-colors"
              style={{ color: 'var(--pe-gold-main)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--pe-gold-strong)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--pe-gold-main)'}
            >
              Fazer login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
