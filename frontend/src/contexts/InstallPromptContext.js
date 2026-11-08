import React, { createContext, useContext, useEffect, useState } from 'react';

const InstallPromptContext = createContext(null);

// Module-level singletons — capture the event before React even mounts.
let deferredInstallPrompt = null;
const promptListeners = new Set();
const installedListeners = new Set();

if (typeof window !== 'undefined') {
  // ── KEY FIX ────────────────────────────────────────────────────────────
  // The browser fires `beforeinstallprompt` ONCE, typically at initial page
  // load (e.g. on '/' or '/login'). The old code had a path-guard here that
  // discarded the event when the user hadn't navigated to a dashboard yet,
  // so deferredInstallPrompt was always null and canInstall was always false.
  //
  // Fix: capture the event unconditionally. The InstallCard component itself
  // controls where it renders — we don't need to guard here.
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    promptListeners.forEach((listener) => listener(event));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installedListeners.forEach((listener) => listener());
  });
}

function isRunningStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export function InstallPromptProvider({ children }) {
  const [installPrompt, setInstallPrompt] = useState(deferredInstallPrompt);
  const [isInstalled, setIsInstalled] = useState(isRunningStandalone);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      if (!isRunningStandalone()) {
        setInstallPrompt(event);
      }
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    promptListeners.add(handleBeforeInstallPrompt);
    installedListeners.add(handleAppInstalled);

    // Sync with any event already captured before this provider mounted
    if (deferredInstallPrompt) {
      handleBeforeInstallPrompt(deferredInstallPrompt);
    }

    return () => {
      promptListeners.delete(handleBeforeInstallPrompt);
      installedListeners.delete(handleAppInstalled);
    };
  }, []);

  const promptToInstall = async () => {
    if (!installPrompt) return;

    const promptEvent = installPrompt;
    deferredInstallPrompt = null;
    setInstallPrompt(null);

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    return outcome;
  };

  return (
    <InstallPromptContext.Provider
      value={{
        canInstall: Boolean(installPrompt) && !isInstalled,
        isInstalled,
        promptToInstall,
      }}
    >
      {children}
    </InstallPromptContext.Provider>
  );
}

export function useInstallPrompt() {
  const context = useContext(InstallPromptContext);
  if (!context) {
    throw new Error('useInstallPrompt must be used within InstallPromptProvider');
  }
  return context;
}
