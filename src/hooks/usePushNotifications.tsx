'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para gerenciar push notifications
 */
export function usePushNotifications() {
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    // Verificar se o navegador suporta push notifications
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    ) {
      setState((prev) => ({ ...prev, isSupported: true }));
      verificarSubscription();
    }
  }, []);

  async function verificarSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setState((prev) => ({
        ...prev,
        isSubscribed: !!subscription,
      }));
    } catch (error) {
      console.error('Erro ao verificar subscription:', error);
    }
  }

  async function solicitarPermissao() {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Push notifications não são suportadas neste navegador',
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Solicitar permissão
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Permissão de notificações negada',
        }));
        return false;
      }

      // Registrar service worker
      const registration = await navigator.serviceWorker.ready;

      // Criar subscription
      // NOTA: Para funcionar completamente, você precisa gerar chaves VAPID
      // e configurar NEXT_PUBLIC_VAPID_PUBLIC_KEY no .env
      // Por enquanto, estrutura básica sem chave (não funcionará em produção)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        throw new Error('Chave VAPID não configurada. Configure NEXT_PUBLIC_VAPID_PUBLIC_KEY no .env');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Enviar subscription para o servidor
      const res = await apiFetch('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription }),
      });

      if (res.ok) {
        setState((prev) => ({
          ...prev,
          isSubscribed: true,
          isLoading: false,
        }));
        return true;
      } else {
        const error = await res.json();
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.error || 'Erro ao salvar subscription',
        }));
        return false;
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erro ao solicitar permissão',
      }));
      return false;
    }
  }

  async function cancelarSubscription() {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        setState((prev) => ({
          ...prev,
          isSubscribed: false,
          isLoading: false,
        }));
        return true;
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erro ao cancelar subscription',
      }));
      return false;
    }

    return false;
  }

  return {
    ...state,
    solicitarPermissao,
    cancelarSubscription,
  };
}

/**
 * Converte chave VAPID de base64 URL-safe para Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  if (!base64String) {
    throw new Error('VAPID public key não configurada');
  }

  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
