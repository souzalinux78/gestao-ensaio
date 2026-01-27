'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { apiFetch } from '@/lib/api-client';

export default function ResetSenhaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usuarioId = searchParams.get('usuarioId');
  const [usuarioNome, setUsuarioNome] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    if (!usuarioId) {
      router.push('/admin/usuarios');
    }
  }, [usuarioId, router]);

  async function resetarSenha() {
    if (!usuarioId) return;

    if (!novaSenha || novaSenha.length < 6) {
      setMensagem({ tipo: 'erro', texto: 'A senha deve ter pelo menos 6 caracteres' });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'As senhas não coincidem' });
      return;
    }

    setCarregando(true);
    setMensagem(null);

    try {
      const res = await apiFetch('/api/admin/usuarios/reset-senha', {
        method: 'POST',
        body: JSON.stringify({
          usuarioId: parseInt(usuarioId),
          novaSenha,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMensagem({ tipo: 'sucesso', texto: data.message || 'Senha resetada com sucesso!' });
        setNovaSenha('');
        setConfirmarSenha('');
        setTimeout(() => {
          router.push('/admin/usuarios');
        }, 2000);
      } else {
        const error = await res.json();
        setMensagem({ tipo: 'erro', texto: error.error || 'Erro ao resetar senha' });
      }
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao resetar senha' });
    } finally {
      setCarregando(false);
    }
  }

  if (!usuarioId) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary hover:text-primary-dark font-medium mb-4"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold text-primary dark:text-[var(--text-primary)]">
            Resetar Senha de Usuário
          </h1>
        </div>

        {mensagem && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              mensagem.tipo === 'sucesso'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        <div className="bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
                ID do Usuário
              </label>
              <input
                type="text"
                value={usuarioId}
                disabled
                className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-2.5 bg-gray-100 dark:bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
                Nova Senha
              </label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-2.5 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full border border-gray-300 dark:border-[var(--border-primary)] rounded-lg px-4 py-2.5 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Digite a senha novamente"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={resetarSenha}
              disabled={carregando || !novaSenha || !confirmarSenha}
              className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {carregando ? 'Resetando...' : 'Resetar Senha'}
            </button>
            <button
              onClick={() => router.back()}
              className="bg-gray-400 text-white px-6 py-2.5 rounded-lg hover:bg-gray-500 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
