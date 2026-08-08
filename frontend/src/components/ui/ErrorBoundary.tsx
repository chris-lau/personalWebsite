import { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// sessionStorage key tracking whether we've already force-reloaded for a stale
// chunk on this URL. Prevents an infinite reload loop if the error persists.
const CHUNK_RELOAD_KEY = 'chunk_error_reloaded_at';

/**
 * Detect errors caused by a stale main bundle trying to load a lazy chunk whose
 * hashed filename no longer exists post-deploy. The browser (or Cloudflare's SPA
 * fallback) returns something that isn't a valid module, and the dynamic import
 * rejects with one of these messages. Different browsers phrase it differently.
 */
function isStaleChunkError(error: Error): boolean {
  const message = error?.message ?? '';
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module') ||
    // The MIME mismatch surfaces as a SyntaxError in some browsers
    (error.name === 'SyntaxError' && message.includes('module'))
  );
}

/**
 * When a stale-chunk error is caught, force a reload that bypasses the HTTP
 * cache so the browser re-fetches a fresh main bundle pointing at chunks that
 * actually exist. Guarded by sessionStorage so we only retry once per URL —
 * if the error persists after a fresh load, show the manual recovery UI.
 */
function attemptChunkRecovery(): boolean {
  try {
    const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY);
    const now = Date.now().toString();
    // If we reloaded less than 60s ago for this same situation, don't loop.
    if (alreadyReloaded && Date.now() - parseInt(alreadyReloaded, 10) < 60_000) {
      return false;
    }
    sessionStorage.setItem(CHUNK_RELOAD_KEY, now);
    // Bust the cache so the browser pulls a fresh index.html + main bundle.
    window.location.reload();
    return true;
  } catch {
    // sessionStorage may be unavailable (private mode); fall back to manual UI.
    return false;
  }
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React ErrorBoundary error:', error, errorInfo);

    // Auto-recover from stale deployment chunks by forcing a cache-busted reload.
    // If recovery is attempted, the page reloads before this UI ever paints.
    if (isStaleChunkError(error)) {
      attemptChunkRecovery();
    }
  }

  public render() {
    if (this.state.hasError) {
      // If this is a chunk-load error we couldn't auto-recover from, tailor the
      // messaging so the user knows a plain reload is the fix.
      const isChunkError = this.state.error ? isStaleChunkError(this.state.error) : false;

      return (
        <div className="error-boundary-container">
          <h2 className="error-boundary-title">Something went wrong</h2>
          <p className="error-boundary-message">
            {isChunkError
              ? 'A newer version of this site is available. Reloading will fix this.'
              : 'An unexpected error occurred while loading this page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="error-boundary-reload-btn"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
