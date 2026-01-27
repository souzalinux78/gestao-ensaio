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

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
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
