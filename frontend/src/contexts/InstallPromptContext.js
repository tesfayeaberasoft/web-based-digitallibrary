import React, { createContext, useContext, useEffect, useState } from 'react';

const DISMISSED_KEY = 'digital-library-install-dismissed';
const InstallPromptContext = createContext(null);

function isRunningStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export function InstallPromptProvider({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isDismissed, setIsDismissed] = useState(
    () => window.sessionStorage.getItem(DISMISSED_KEY) === 'true'
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      if (!isRunningStandalone() && !isDismissed) {
        setInstallPrompt(event);
      }
    };

    const handleAppInstalled = () => {
      window.sessionStorage.setItem(DISMISSED_KEY, 'true');
      setInstallPrompt(null);
      setIsDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isDismissed]);

  const dismissInstallCard = () => {
    window.sessionStorage.setItem(DISMISSED_KEY, 'true');
    setInstallPrompt(null);
    setIsDismissed(true);
  };

  const promptToInstall = async () => {
    if (!installPrompt) {
      return;
    }

    const promptEvent = installPrompt;
    setInstallPrompt(null);

    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;

      if (outcome === 'accepted') {
        window.sessionStorage.setItem(DISMISSED_KEY, 'true');
        setIsDismissed(true);
      }
    } catch (error) {
      console.error('The app installation prompt failed:', error);
    }
  };

  return (
    <InstallPromptContext.Provider
      value={{
        canInstall: Boolean(installPrompt) && !isDismissed && !isRunningStandalone(),
        dismissInstallCard,
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
