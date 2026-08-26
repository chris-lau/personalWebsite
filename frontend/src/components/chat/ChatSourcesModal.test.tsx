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
});
