import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatSourcesModal } from './ChatSourcesModal';
import * as backendApi from '../../api/backend';

describe('ChatSourcesModal', () => {
  const mockSourcesResponse = {
    sources: [
      {
        id: 'blog-post-1',
        title: 'Blog: Building Systems',
        category: 'blog',
        source_file: 'post1.md',
        route: '/blog/post-1',
        char_count: 500,
        estimated_tokens: 125,
        content: '# Blog post: Building Systems\n\nFull content here...',
      },
      {
        id: 'guidebook-1',
        title: 'Frontend Guidebook — Chapter 1: React',
        category: 'guidebook',
        source_file: 'guidebook_chapters.json',
        route: '/guidebook',
        char_count: 1000,
        estimated_tokens: 250,
        content: '# Chapter 1: React State Management',
      },
      {
        id: 'profile-json',
        title: 'Profile & Bio',
        category: 'profile',
        source_file: 'profile.json',
        route: '/about',
        char_count: 200,
        estimated_tokens: 50,
        content: '{"name": "Chris Lau"}',
      },
    ],
    total_sources: 3,
    total_characters: 1700,
    total_estimated_tokens: 425,
    language_rule:
      'When answering in Chinese or if the user asks in Chinese, ALWAYS use Traditional Chinese (繁體中文), NEVER Simplified Chinese (簡體中文).',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<ChatSourcesModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders modal and fetches source materials when isOpen is true', async () => {
    vi.spyOn(backendApi, 'fetchChatSources').mockResolvedValue({
      data: mockSourcesResponse,
      isFallback: false,
    });

    render(<ChatSourcesModal isOpen={true} onClose={vi.fn()} />);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(await screen.findByText('Grounding Source Material')).toBeInTheDocument();
    expect(await screen.findByText('Blog: Building Systems')).toBeInTheDocument();
    expect(await screen.findByText('Frontend Guidebook — Chapter 1: React')).toBeInTheDocument();
    expect((await screen.findAllByText('Profile & Bio')).length).toBeGreaterThan(0);
    // The language rule comes from the API response, not a hardcoded string.
    expect(await screen.findByText(/Language rule: .*繁體中文/)).toBeInTheDocument();
  });

  it('filters sources by search query', async () => {
    vi.spyOn(backendApi, 'fetchChatSources').mockResolvedValue({
      data: mockSourcesResponse,
      isFallback: false,
    });

    render(<ChatSourcesModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Blog: Building Systems')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search source materials/i);
    fireEvent.change(searchInput, { target: { value: 'Guidebook' } });

    expect(screen.queryByText('Blog: Building Systems')).toBeNull();
    expect(screen.getByText('Frontend Guidebook — Chapter 1: React')).toBeInTheDocument();
  });

  it('filters sources by category pill', async () => {
    vi.spyOn(backendApi, 'fetchChatSources').mockResolvedValue({
      data: mockSourcesResponse,
      isFallback: false,
    });

    render(<ChatSourcesModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Blog Posts')).toBeInTheDocument();
    });

    const blogPill = screen.getByRole('radio', { name: 'Blog Posts' });
    fireEvent.click(blogPill);

    expect(screen.getByText('Blog: Building Systems')).toBeInTheDocument();
    expect(screen.queryByText('Frontend Guidebook — Chapter 1: React')).toBeNull();
  });

  it('expands source content on card click', async () => {
    vi.spyOn(backendApi, 'fetchChatSources').mockResolvedValue({
      data: mockSourcesResponse,
      isFallback: false,
    });

    render(<ChatSourcesModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Blog: Building Systems')).toBeInTheDocument();
    });

    const cardHeader = screen.getByText('Blog: Building Systems').closest('.source-card__header');
    expect(cardHeader).toBeInTheDocument();
    fireEvent.click(cardHeader!);

    expect(screen.getByText(/Full content here/i)).toBeInTheDocument();
  });

  it('calls onClose when close button or Escape key is pressed', async () => {
    const onClose = vi.fn();
    vi.spyOn(backendApi, 'fetchChatSources').mockResolvedValue({
      data: mockSourcesResponse,
      isFallback: false,
    });

    render(<ChatSourcesModal isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByLabelText('Close sources dialog');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('shows a retryable error state without category pills when the first fetch fails', async () => {
    vi.spyOn(backendApi, 'fetchChatSources').mockResolvedValue({
      data: null,
      isFallback: true,
      error: 'The user aborted a request.',
    });

    render(<ChatSourcesModal isOpen={true} onClose={vi.fn()} />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to load grounding sources.')).toBeInTheDocument();
    // Cold-start hint appears for abort-style (timeout) errors.
    expect(screen.getByText(/backend may be waking up/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    // No data → no lone "All Sources" pill and no source cards.
    expect(screen.queryByRole('radio', { name: 'All Sources' })).toBeNull();
    expect(screen.queryByText('Blog: Building Systems')).toBeNull();
  });

  it('recovers when Retry follows a failed fetch', async () => {
    const spy = vi
      .spyOn(backendApi, 'fetchChatSources')
      .mockResolvedValueOnce({ data: null, isFallback: true, error: 'HTTP 503' })
      .mockResolvedValueOnce({ data: mockSourcesResponse, isFallback: false });

    render(<ChatSourcesModal isOpen={true} onClose={vi.fn()} />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(await screen.findByText('Blog: Building Systems')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('keeps previously loaded cards visible when a refresh fails', async () => {
    vi.spyOn(backendApi, 'fetchChatSources')
      .mockResolvedValueOnce({ data: mockSourcesResponse, isFallback: false })
      .mockResolvedValue({ data: null, isFallback: true, error: 'HTTP 500' });

    const { rerender } = render(<ChatSourcesModal isOpen={true} onClose={vi.fn()} />);

    expect(await screen.findByText('Blog: Building Systems')).toBeInTheDocument();

    // Reopen (isOpen toggled) triggers a refresh that fails.
    rerender(<ChatSourcesModal isOpen={false} onClose={vi.fn()} />);
    rerender(<ChatSourcesModal isOpen={true} onClose={vi.fn()} />);

    // Stale data is retained — cards stay visible, no error alert replaces them.
    await waitFor(() => {
      expect(screen.getByText('Blog: Building Systems')).toBeInTheDocument();
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
