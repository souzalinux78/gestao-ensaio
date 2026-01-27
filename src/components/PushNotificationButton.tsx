'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * Componente para ativar/desativar push notifications
 */
export default function PushNotificationButton() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    solicitarPermissao,
    cancelarSubscription,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
        Push notifications não são suportadas neste navegador
      </div>
    );
  }

  // Verificar se o erro é sobre VAPID não configurado
  const isVapidError = error?.includes('VAPID');

  return (
    <div className="space-y-2">
      {error && (
        <div className={`p-4 border rounded-lg text-sm ${
          isVapidError 
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          <div className="font-semibold mb-2">{error}</div>
          {isVapidError && (
            <div className="mt-3 text-xs space-y-2">
              <p className="font-semibold">📋 Passos para configurar:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>
                  <span className="font-medium">Gerar as chaves VAPID:</span>
                  <div className="mt-1 ml-4">
                    <code className="bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded block text-xs">
                      node scripts/gerar-vapid-keys.js
                    </code>
                    <p className="text-xs mt-1 text-yellow-700 dark:text-yellow-300">
                      Ou use: <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">npm install -g web-push && web-push generate-vapid-keys</code>
                    </p>
                  </div>
                </li>
                <li>
                  <span className="font-medium">Adicionar ao arquivo <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">.env</code> ou <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">.env.local</code>:</span>
                  <div className="mt-1 ml-4 text-xs font-mono bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded">
                    NEXT_PUBLIC_VAPID_PUBLIC_KEY=chave-publica-gerada<br/>
                    VAPID_PRIVATE_KEY=chave-privada-gerada<br/>
                    VAPID_EMAIL=seu-email@exemplo.com
                  </div>
                </li>
                <li>
                  <span className="font-medium">Reiniciar o servidor:</span>
                  <div className="mt-1 ml-4">
                    <code className="bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded block text-xs">
                      npm run dev
                    </code>
                    <p className="text-xs mt-1 text-yellow-700 dark:text-yellow-300">
                      (ou reinicie o servidor de produção)
                    </p>
                  </div>
                </li>
              </ol>
              <div className="mt-3 pt-2 border-t border-yellow-300 dark:border-yellow-700">
                <p className="text-xs">
                  💡 <strong>Dica:</strong> Consulte o arquivo <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">COMO-CONFIGURAR-PUSH-NOTIFICATIONS.md</code> para mais detalhes.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {isSubscribed ? (
        <div className="space-y-2">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
            ✓ Notificações push ativadas
          </div>
          <button
            onClick={cancelarSubscription}
            disabled={isLoading}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Desativando...' : 'Desativar Notificações'}
          </button>
        </div>
      ) : (
        <button
          onClick={solicitarPermissao}
          disabled={isLoading}
          className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Ativando...' : 'Ativar Notificações Push'}
        </button>
      )}
    </div>
  );
}
