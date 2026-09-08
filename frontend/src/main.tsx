/*! cache-bust 2026-09-08: rotate entry hash after edge-cache poisoning (see commit 2d13bda) */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';
import './styles/global.css';

// Build marker: also rotates the entry chunk hash (see _redirects for why that matters).
document.documentElement.dataset.build = '2026-09-08';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
