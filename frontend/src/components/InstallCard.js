import React from 'react';
import { useInstallPrompt } from '../contexts/InstallPromptContext';

export default function InstallCard() {
  const { canInstall, dismissInstallCard, promptToInstall } = useInstallPrompt();

  if (!canInstall) {
    return null;
  }

  return (
    <aside
      aria-label="Install Digital Library"
      className="fixed bottom-5 right-5 z-[1400] flex w-[min(22rem,calc(100vw-2.5rem))] items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 pr-11 shadow-xl"
      role="dialog"
    >
      <img
        alt=""
        aria-hidden="true"
        className="h-11 w-11 shrink-0 rounded-lg object-cover"
        src={`${process.env.PUBLIC_URL}/logo192.png`}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5 text-slate-900">
          Install Library App
        </p>
        <p className="mt-1 text-xs leading-4 text-slate-600">
          Install Library App for a better experience.
        </p>
        <button
          className="mt-3 rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          onClick={promptToInstall}
          type="button"
        >
          Install
        </button>
      </div>

      <button
        aria-label="Dismiss install card"
        className="absolute right-2 top-2 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        onClick={dismissInstallCard}
        type="button"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ×
        </span>
      </button>
    </aside>
  );
}
