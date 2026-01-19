'use client';

import { useState, useEffect } from 'react';
import { Configuracoes } from '@/types';

export default function WebhookConfig() {
  const [config, setConfig] = useState<Configuracoes | null>(null);
  const [webhook, setWebhook] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  async function carregarConfiguracoes() {
    setCarregando(true);
    try {
      const res = await fetch('/api/configuracoes');
      const data = await res.json();
      setConfig(data);
      setWebhook(data.webhook || '');
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar configurações' });
    } finally {
      setCarregando(false);
    }
  }

  async function salvarWebhook() {
    setSalvando(true);
    setMensagem(null);

    try {
      const res = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setMensagem({ tipo: 'sucesso', texto: 'Webhook salvo com sucesso!' });
      } else {
        const error = await res.json();
        setMensagem({ tipo: 'erro', texto: error.error || 'Erro ao salvar webhook' });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar webhook' });
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-primary">Configuração de Webhook</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Configure a URL do webhook que receberá os dados quando um PDF for gerado.
        </p>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Webhook URL</label>
        <input
          type="url"
          value={webhook}
          onChange={(e) => setWebhook(e.target.value)}
          placeholder="https://exemplo.com/webhook"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
        />
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Exemplo: https://webhook.automatizeonline.com.br/webhook/ensaio
        </p>
      </div>

      {mensagem && (
        <div
          className={`p-4 rounded-lg ${
            mensagem.tipo === 'sucesso'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={salvarWebhook}
          disabled={salvando}
          className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {salvando ? 'Salvando...' : 'Salvar Webhook'}
        </button>
      </div>
    </div>
  );
}
