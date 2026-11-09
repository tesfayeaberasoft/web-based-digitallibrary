/**
 * InstallPromptContext
 *
 * Provides `canInstall`, `isInstalled`, and `promptToInstall` to any
 * component that needs them. The PersistentInstallCard manages its own
 * prompt state internally (module-level singleton), so this context is
 * now a lightweight companion — kept for compatibility.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

const InstallPromptContext = createContext(null);

// Module-level singletons — capture beforeinstallprompt before React mounts.
let deferredInstallPrompt = null;
const promptListeners = new Set();
const installedListeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    promptListeners.forEach((fn) => fn(event));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installedListeners.forEach((fn) => fn());
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
    const handlePrompt = (event) => {
      if (!isRunningStandalone()) setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    promptListeners.add(handlePrompt);
    installedListeners.add(handleInstalled);
    if (deferredInstallPrompt) handlePrompt(deferredInstallPrompt);

    return () => {
      promptListeners.delete(handlePrompt);
      installedListeners.delete(handleInstalled);
    };
  }, []);

  const promptToInstall = async () => {
    if (!installPrompt) return;
    const e = installPrompt;
    deferredInstallPrompt = null;
    setInstallPrompt(null);
    await e.prompt();
    const { outcome } = await e.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
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
  const ctx = useContext(InstallPromptContext);
  if (!ctx) throw new Error('useInstallPrompt must be used within InstallPromptProvider');
  return ctx;
}
