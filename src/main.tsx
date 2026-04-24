import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { PrivacyPolicy } from './components/PrivacyPolicy.tsx';
import { TermsOfService } from './components/TermsOfService.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  } else {
    registerSW({ immediate: true });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
