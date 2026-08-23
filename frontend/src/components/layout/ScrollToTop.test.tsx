import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';

const scrollToMock = vi.fn();
vi.stubGlobal('scrollTo', scrollToMock);

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ScrollToTop />
      <nav>
        <Link to="/long-page">Go to long page</Link>
        <Link to="/anchored#section-2">Go to anchor</Link>
      </nav>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/long-page" element={<div>Long Page</div>} />
        <Route path="/anchored" element={<div>Anchored</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ScrollToTop', () => {
  beforeEach(() => {
    scrollToMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not hijack the initial page load position on the entry route', () => {
    renderAt('/');
    expect(scrollToMock).toHaveBeenCalledWith(0, 0);
  });

  it('scrolls to top when navigating to a new route', async () => {
    const user = userEvent.setup();
    renderAt('/');
    scrollToMock.mockClear();

    await user.click(screen.getByRole('link', { name: 'Go to long page' }));

    expect(screen.getByText('Long Page')).toBeInTheDocument();
    expect(scrollToMock).toHaveBeenCalledWith(0, 0);
  });

  it('does not scroll when the target URL carries a hash (in-page anchor)', async () => {
    const user = userEvent.setup();
    renderAt('/');
    scrollToMock.mockClear();

    await user.click(screen.getByRole('link', { name: 'Go to anchor' }));

    expect(screen.getByText('Anchored')).toBeInTheDocument();
    expect(scrollToMock).not.toHaveBeenCalled();
  });
});
