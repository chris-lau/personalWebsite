import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGitHubData, DEFAULT_GITHUB_USERNAME } from './useGitHubData';
import * as githubApi from '../api/github';
import { GitHubUser, GitHubRepo } from '../types/github';

describe('useGitHubData hook', () => {
  const mockUser: GitHubUser = {
    username: 'chris-lau',
    displayName: 'Chris Lau',
    avatarUrl: 'https://avatar.dev',
    profileUrl: 'https://github.com/chris-lau',
    bio: 'Software engineer',
    publicRepos: 5,
    followers: 10,
    following: 2,
    topLanguages: [{ language: 'TypeScript', count: 5, percentage: 100, color: '#3178c6' }],
  };

  const mockRepos: GitHubRepo[] = [
    {
      id: 1,
      name: 'repo-one',
      fullName: 'chris-lau/repo-one',
      description: 'Repo 1',
      githubUrl: 'https://github.com/chris-lau/repo-one',
      demoUrl: null,
      stars: 10,
      forks: 1,
      primaryLanguage: 'TypeScript',
      topics: [],
      isFork: false,
      updatedAt: new Date().toISOString(),
      pushedAt: new Date().toISOString(),
      formattedLastUpdated: 'just now',
      isRecentlyUpdated: true,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default username and fetches data', async () => {
    vi.spyOn(githubApi, 'fetchGitHubUser').mockResolvedValue(mockUser);
    vi.spyOn(githubApi, 'fetchGitHubRepos').mockResolvedValue(mockRepos);

    const { result } = renderHook(() => useGitHubData());

    expect(result.current.loading).toBe(true);
    expect(result.current.username).toBe(DEFAULT_GITHUB_USERNAME);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.repos).toEqual(mockRepos);
    expect(result.current.error).toBeNull();
    expect(result.current.isDefaultUser).toBe(true);
  });

  it('updates username and resets back to default', async () => {
    vi.spyOn(githubApi, 'fetchGitHubUser').mockResolvedValue(mockUser);
    vi.spyOn(githubApi, 'fetchGitHubRepos').mockResolvedValue(mockRepos);

    const { result } = renderHook(() => useGitHubData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setUsername('vercel');
    });

    await waitFor(() => {
      expect(result.current.username).toBe('vercel');
      expect(result.current.isDefaultUser).toBe(false);
    });

    act(() => {
      result.current.resetDefault();
    });

    await waitFor(() => {
      expect(result.current.username).toBe(DEFAULT_GITHUB_USERNAME);
      expect(result.current.isDefaultUser).toBe(true);
    });
  });

  it('handles error states gracefully', async () => {
    vi.spyOn(githubApi, 'fetchGitHubUser').mockRejectedValue(new Error('User not found'));
    vi.spyOn(githubApi, 'fetchGitHubRepos').mockResolvedValue([]);

    const { result } = renderHook(() => useGitHubData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('User not found');
    expect(result.current.user).toBeNull();
  });
});
