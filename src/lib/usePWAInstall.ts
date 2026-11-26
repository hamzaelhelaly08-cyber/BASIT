import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __basitDeferredInstallPrompt?: BeforeInstallPromptEvent | null;
    __basitPromptBootPath?: string;
  }
}

// Capture beforeinstallprompt early at module evaluation so SPA navigation never misses it
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    window.__basitDeferredInstallPrompt = e as BeforeInstallPromptEvent;
    window.__basitPromptBootPath = window.location.search;
    window.dispatchEvent(new CustomEvent('basit:install-ready'));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    typeof window !== 'undefined' ? window.__basitDeferredInstallPrompt || null : null
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    if (window.__basitDeferredInstallPrompt) {
      setDeferredPrompt(window.__basitDeferredInstallPrompt);
    }

    const syncCachedPrompt = () => {
      if (window.__basitDeferredInstallPrompt) {
        setDeferredPrompt(window.__basitDeferredInstallPrompt);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      window.__basitDeferredInstallPrompt = evt;
      window.__basitPromptBootPath = window.location.search;
      setDeferredPrompt(evt);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__basitDeferredInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('basit:install-ready', syncCachedPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('basit:install-ready', syncCachedPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    const promptEvt = deferredPrompt || window.__basitDeferredInstallPrompt;
    if (!promptEvt) return false;
    await promptEvt.prompt();
    const { outcome } = await promptEvt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__basitDeferredInstallPrompt = null;
      return true;
    }
    return false;
  };

  // True when booting on isolated /habe entrypoint or legacy ?view=al_ain_habe with manifest-habe.webmanifest
  const pathname = typeof window !== 'undefined' ? window.location.pathname || '/' : '/';
  const isPromptForHabeManifest =
    typeof window !== 'undefined' &&
    (pathname === '/habe' ||
      pathname.startsWith('/habe/') ||
      new URLSearchParams(window.__basitPromptBootPath || window.location.search).get('view') ===
        'al_ain_habe');

  return {
    isInstallable: !!(deferredPrompt || (typeof window !== 'undefined' && window.__basitDeferredInstallPrompt)),
    isPromptForHabeManifest,
    isInstalled,
    isIOS,
    isInIframe,
    install,
  };
}
