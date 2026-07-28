import { useState, useEffect, useCallback } from 'react';
import { GitHubUser, GitHubRepo } from '../types/github';
import { fetchGitHubUser, fetchGitHubRepos } from '../api/github';

export const DEFAULT_GITHUB_USERNAME = 'chris-lau';

export function useGitHubData(initialUsername = DEFAULT_GITHUB_USERNAME) {
  const [username, setUsernameState] = useState<string>(initialUsername);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (targetUser: string) => {
    setLoading(true);
    setError(null);

    try {
      const [userData, reposData] = await Promise.all([
        fetchGitHubUser(targetUser),
        fetchGitHubRepos(targetUser),
      ]);
      setUser(userData);
      setRepos(reposData);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to fetch GitHub activity. Please check the username or network connection.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(username);
  }, [username, loadData]);

  const setUsername = useCallback((newUsername: string) => {
    if (newUsername.trim()) {
      setUsernameState(newUsername.trim());
    }
  }, []);

  const resetDefault = useCallback(() => {
    setUsernameState(DEFAULT_GITHUB_USERNAME);
  }, []);

  const refetch = useCallback(() => {
    loadData(username);
  }, [username, loadData]);

  return {
    username,
    setUsername,
    resetDefault,
    user,
    repos,
    loading,
    error,
    refetch,
    isDefaultUser: username.toLowerCase() === DEFAULT_GITHUB_USERNAME.toLowerCase(),
  };
}
