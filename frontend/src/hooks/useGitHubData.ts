import { useState, useEffect, useCallback, useRef } from 'react';
import { GitHubUser, GitHubRepo } from '../types/github';
import { fetchGitHubUser, fetchGitHubRepos } from '../api/github';

export const DEFAULT_GITHUB_USERNAME = 'chris-lau';

export function useGitHubData(initialUsername = DEFAULT_GITHUB_USERNAME) {
  const [username, setUsernameState] = useState<string>(initialUsername);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Request sequencing guard: only the most recent request updates state.
  const latestRequestId = useRef<number>(0);

  const loadData = useCallback(async (targetUser: string) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);

    try {
      const [userData, reposData] = await Promise.all([
        fetchGitHubUser(targetUser),
        fetchGitHubRepos(targetUser),
      ]);
      // Discard stale responses if a newer request superseded this one.
      if (requestId !== latestRequestId.current) return;
      setUser(userData);
      setRepos(reposData);
    } catch (err: unknown) {
      if (requestId !== latestRequestId.current) return;
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to fetch GitHub activity. Please check the username or network connection.';
      setError(message);
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData(username);
    // Cleanup: invalidate the in-flight request on unmount / username change.
    return () => {
      latestRequestId.current++;
    };
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
