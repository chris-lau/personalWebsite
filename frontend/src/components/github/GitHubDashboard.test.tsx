import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GitHubDashboard } from './GitHubDashboard';
import * as useGitHubDataModule from '../../hooks/useGitHubData';
import { GitHubUser, GitHubRepo } from '../../types/github';

describe('GitHubDashboard component suite', () => {
  const mockUser: GitHubUser = {
    username: 'chris-lau',
    displayName: 'Chris Lau',
    avatarUrl: 'https://avatar.dev/chris',
    profileUrl: 'https://github.com/chris-lau',
    bio: 'Software engineer bio',
    publicRepos: 12,
    followers: 45,
    following: 10,
    topLanguages: [{ language: 'TypeScript', count: 10, percentage: 80, color: '#3178c6' }],
  };

  const mockRepos: GitHubRepo[] = [
    {
      id: 101,
      name: 'active-repo',
      fullName: 'chris-lau/active-repo',
      description: 'Active project description',
      githubUrl: 'https://github.com/chris-lau/active-repo',
      demoUrl: 'https://active.demo',
      stars: 25,
      forks: 4,
      primaryLanguage: 'TypeScript',
      topics: ['react', 'vite'],
      isFork: false,
      updatedAt: new Date().toISOString(),
      pushedAt: new Date().toISOString(),
      formattedLastUpdated: 'just now',
      isRecentlyUpdated: true,
    },
    {
      id: 102,
      name: 'older-repo',
      fullName: 'chris-lau/older-repo',
      description: 'Older repo description',
      githubUrl: 'https://github.com/chris-lau/older-repo',
      demoUrl: null,
      stars: 5,
      forks: 0,
      primaryLanguage: 'Python',
      topics: ['python'],
      isFork: false,
      updatedAt: '2025-01-01T00:00:00Z',
      pushedAt: '2025-01-01T00:00:00Z',
      formattedLastUpdated: '1y ago',
      isRecentlyUpdated: false,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state when fetching data', () => {
    vi.spyOn(useGitHubDataModule, 'useGitHubData').mockReturnValue({
      username: 'chris-lau',
      setUsername: vi.fn(),
      resetDefault: vi.fn(),
      user: null,
      repos: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
      isDefaultUser: true,
    });

    render(<GitHubDashboard />);
    expect(screen.getByText(/Fetching live GitHub activity for @chris-lau/i)).toBeDefined();
  });

  it('renders error message when fetch fails', () => {
    vi.spyOn(useGitHubDataModule, 'useGitHubData').mockReturnValue({
      username: 'chris-lau',
      setUsername: vi.fn(),
      resetDefault: vi.fn(),
      user: null,
      repos: [],
      loading: false,
      error: 'GitHub user not found',
      refetch: vi.fn(),
      isDefaultUser: true,
    });

    render(<GitHubDashboard />);
    expect(screen.getByText(/GitHub user not found/i)).toBeDefined();
  });

  it('renders profile summary, repository cards, and handles search & 30-day filter', async () => {
    const setUsernameMock = vi.fn();
    const resetDefaultMock = vi.fn();

    vi.spyOn(useGitHubDataModule, 'useGitHubData').mockReturnValue({
      username: 'chris-lau',
      setUsername: setUsernameMock,
      resetDefault: resetDefaultMock,
      user: mockUser,
      repos: mockRepos,
      loading: false,
      error: null,
      refetch: vi.fn(),
      isDefaultUser: true,
    });

    render(<GitHubDashboard />);

    // Header & summary check
    expect(screen.getByText('Chris Lau')).toBeDefined();
    expect(screen.getByText('@chris-lau ↗')).toBeDefined();
    expect(screen.getByText('active-repo')).toBeDefined();
    expect(screen.getByText('older-repo')).toBeDefined();
    expect(screen.getByText('🔥 Active')).toBeDefined();

    // Toggle 30-day active filter
    const activeFilterBtn = screen.getByRole('button', { name: /⚡ Active \(Past 30 Days\)/i });
    fireEvent.click(activeFilterBtn);

    await waitFor(() => {
      expect(screen.getByText('active-repo')).toBeDefined();
      expect(screen.queryByText('older-repo')).toBeNull();
    });

    // Username lookup search input
    const lookupInput = screen.getByPlaceholderText(/Lookup any GitHub user/i);
    const lookupBtn = screen.getByRole('button', { name: 'Lookup' });

    fireEvent.change(lookupInput, { target: { value: 'facebook' } });
    fireEvent.click(lookupBtn);

    expect(setUsernameMock).toHaveBeenCalledWith('facebook');
  });

  it('renders a distinct empty state for a user with no public repositories', () => {
    vi.spyOn(useGitHubDataModule, 'useGitHubData').mockReturnValue({
      username: 'empty-user',
      setUsername: vi.fn(),
      resetDefault: vi.fn(),
      user: { ...mockUser, username: 'empty-user', publicRepos: 0 },
      repos: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      isDefaultUser: false,
    });

    render(<GitHubDashboard />);

    // Distinct message for genuinely-empty user (not the filter message)
    expect(screen.getByText(/This user has no public repositories/i)).toBeDefined();
    // The "Clear Filters" button must NOT appear — there's nothing to filter
    expect(screen.queryByRole('button', { name: /Clear Filters/i })).toBeNull();
  });
});
