'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Verificar se banner já foi mostrado (localStorage)
    const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');
    const dismissedDate = bannerDismissed ? new Date(bannerDismissed) : null;
    const daysSinceDismiss = dismissedDate 
      ? Math.floor((Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Para iOS: sempre mostrar após 3 segundos (se não foi dispensado nos últimos 7 dias)
    // Para Android/Chrome: mostrar quando o evento beforeinstallprompt for disparado
    if (isIOSDevice) {
      // iOS não tem evento beforeinstallprompt, então mostramos sempre (respeitando localStorage)
      if (!bannerDismissed || (daysSinceDismiss && daysSinceDismiss > 7)) {
        setTimeout(() => {
          setShowBanner(true);
        }, 3000);
      }
    } else {
      // Para Android/Chrome, esperar pelo evento beforeinstallprompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        // Só mostrar se não foi dispensado recentemente
        if (!bannerDismissed || (daysSinceDismiss && daysSinceDismiss > 7)) {
          setTimeout(() => {
            setShowBanner(true);
          }, 1000);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Escutar evento appinstalled
      window.addEventListener('appinstalled', () => {
        setShowBanner(false);
        setIsInstalled(true);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome, Edge, etc
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowBanner(false);
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', new Date().toISOString());
  };

  // Não mostrar se já estiver instalado ou não deve mostrar
  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-primary to-primary-dark text-white shadow-2xl animate-slide-up">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:block">
              <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Instalar App</h3>
              <p className="text-sm text-primary-light">
                {isIOS 
                  ? 'Adicione este app à tela inicial para acesso rápido' 
                  : 'Instale o app para acesso rápido e uso offline'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {isIOS ? (
              <>
                <div className="flex-1 bg-white/10 rounded-lg p-3 mb-2 sm:mb-0">
                  <div className="text-xs sm:text-sm text-white mb-2 font-semibold">
                    📱 Como instalar no iPhone:
                  </div>
                  <ol className="text-xs text-white/90 space-y-1 list-decimal list-inside">
                    <li>Toque no botão <span className="font-bold">Compartilhar</span> <span className="text-lg">📤</span> (barra inferior do Safari)</li>
                    <li>Role para baixo e toque em <span className="font-bold">"Adicionar à Tela Inicial"</span> <span className="text-lg">➕</span></li>
                    <li>Toque em <span className="font-bold">"Adicionar"</span> no canto superior direito</li>
                  </ol>
                </div>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Entendi
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                >
                  Depois
                </button>
                <button
                  onClick={handleInstallClick}
                  disabled={!deferredPrompt}
                  className="px-6 py-2 bg-accent hover:bg-accent-dark rounded-lg transition-colors text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Instalar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
