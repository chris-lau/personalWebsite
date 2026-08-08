import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// A child component that throws on render, simulating a lazy-import failure
// or any other render-phase crash.
const ThrowOnRender: React.FC<{ error: Error }> = ({ error }) => {
  throw error;
};

const GenericError = new Error('Something broke in render');

const StaleChunkError = new TypeError(
  'Failed to fetch dynamically imported module: https://chrislau.dev/assets/AboutPage-CViaNC6i.js'
);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>healthy child content</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('healthy child content')).toBeInTheDocument();
  });

  it('renders the error UI with a reload button for a generic error', () => {
    // Suppress the expected console.error from React about the uncaught error.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowOnRender error={GenericError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload Page/i })).toBeInTheDocument();
    // Must NOT show the chunk-specific message for a generic error
    expect(screen.queryByText(/newer version/i)).not.toBeInTheDocument();
    spy.mockRestore();
  });

  it('auto-reloads the page when a stale-chunk error is caught', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowOnRender error={StaleChunkError} />
      </ErrorBoundary>
    );

    // Recovery should fire a cache-busted reload exactly once.
    expect(reloadSpy).toHaveBeenCalledTimes(1);
    // And record that we retried, so a repeat failure doesn't loop.
    expect(sessionStorage.getItem('chunk_error_reloaded_at')).not.toBeNull();
    spy.mockRestore();
  });

  it('does not auto-reload twice within the 60s guard window (no infinite loop)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

    // Simulate that we already reloaded moments ago for this URL.
    sessionStorage.setItem('chunk_error_reloaded_at', Date.now().toString());

    render(
      <ErrorBoundary>
        <ThrowOnRender error={StaleChunkError} />
      </ErrorBoundary>
    );

    // No reload — we're inside the guard window, so fall through to the manual UI.
    expect(reloadSpy).not.toHaveBeenCalled();
    // The chunk-specific recovery message should show since it's still a chunk error.
    expect(screen.getByText(/newer version of this site/i)).toBeInTheDocument();
    spy.mockRestore();
  });

  it('shows the chunk-specific recovery message when a chunk error reaches the UI', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window.location, 'reload').mockImplementation(() => {});
    // Pretend we already retried so recovery is skipped and the UI renders.
    sessionStorage.setItem('chunk_error_reloaded_at', Date.now().toString());

    render(
      <ErrorBoundary>
        <ThrowOnRender error={StaleChunkError} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/newer version of this site/i)).toBeInTheDocument();
    expect(screen.getByText(/Reloading will fix this/i)).toBeInTheDocument();
    spy.mockRestore();
  });

  it('detects the Safari-style "Importing a module script failed" message', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowOnRender
          error={new Error('Importing a module script failed.')}
        />
      </ErrorBoundary>
    );

    expect(reloadSpy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
