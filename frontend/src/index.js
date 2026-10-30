import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './index.css';
import App from './App';

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
    const serviceWorkerUrl = `${publicUrl}/sw.js`;

    navigator.serviceWorker.register(serviceWorkerUrl).catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
