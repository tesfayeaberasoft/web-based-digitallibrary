import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './index.css';
import App from './App';

// Register service worker in ALL environments (dev + prod).
// Chrome requires an active service worker before it will fire
// `beforeinstallprompt` — without it, PWA install never becomes available.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
    const serviceWorkerUrl = `${publicUrl}/sw.js`;

    navigator.serviceWorker
      .register(serviceWorkerUrl)
      .then((registration) => {
        console.log('[App] Service worker registered:', registration.scope);
        return registration.update();
      })
      .catch((error) => {
        console.error('[App] Service worker registration failed:', error);
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
