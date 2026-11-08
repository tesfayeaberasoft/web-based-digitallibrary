import React, { useState } from 'react';
import { useInstallPrompt } from '../contexts/InstallPromptContext';
import { useTranslation } from 'react-i18next';

const DISMISSED_KEY = 'digital-library-install-card-dismissed';

export default function InstallCard() {
  const { canInstall, isInstalled, promptToInstall } = useInstallPrompt();
  const { t } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(
    () => window.sessionStorage.getItem(DISMISSED_KEY) === 'true'
  );
  const [showInstructions, setShowInstructions] = useState(false);
  const [installError, setInstallError] = useState('');

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    if (canInstall) {
      setInstallError('');
      try {
        await promptToInstall();
      } catch (error) {
        console.error('Unable to start the app installation:', error);
        setInstallError(t('pwa.installFailed'));
      }
      return;
    }

    setShowInstructions((visible) => !visible);
  };

  const dismiss = () => {
    window.sessionStorage.setItem(DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  return (
    <aside
      aria-label={t('pwa.title')}
      className="fixed bottom-5 right-5 z-[1400] flex w-[min(22rem,calc(100vw-2.5rem))] items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 pr-11 shadow-xl"
      role="dialog"
    >
      <img
        alt=""
        aria-hidden="true"
        className="h-11 w-11 shrink-0 rounded-lg object-cover"
        src={`${process.env.PUBLIC_URL}/digital-library-icon-192x192.png`}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5 text-slate-900">
          {t('pwa.title')}
        </p>
        <p className="mt-1 text-xs leading-4 text-slate-600">
          {t('pwa.description')}
        </p>
        <button
          className="mt-3 rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          onClick={handleInstall}
          type="button"
        >
          {canInstall ? t('pwa.install') : t('pwa.howToInstall')}
        </button>
        {showInstructions && !canInstall && (
          <p className="mt-3 text-xs leading-5 text-slate-600">
            {t('pwa.manualInstructions')}
          </p>
        )}
        {installError && (
          <p className="mt-3 text-xs leading-5 text-red-700" role="alert">
            {installError}
          </p>
        )}
      </div>

      <button
        aria-label={t('pwa.dismiss')}
        className="absolute right-2 top-2 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        onClick={dismiss}
        type="button"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ×
        </span>
      </button>
    </aside>
  );
}
