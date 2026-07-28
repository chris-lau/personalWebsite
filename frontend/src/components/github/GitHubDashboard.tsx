import React, { useState, useMemo } from 'react';
import { useGitHubData } from '../../hooks/useGitHubData';
import { GitHubUsernameSelector } from './GitHubUsernameSelector';
import { GitHubSummary } from './GitHubSummary';
import { GitHubRepoCard } from './GitHubRepoCard';
import { GitHubFilters } from './GitHubFilters';
import { RepoSortOption } from '../../types/github';
import './GitHubComponents.css';

export const GitHubDashboard: React.FC = () => {
  const {
    username,
    setUsername,
    resetDefault,
    user,
    repos,
    loading,
    error,
    refetch,
    isDefaultUser,
  } = useGitHubData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<RepoSortOption>('active');
  const [onlyActive30Days, setOnlyActive30Days] = useState(false);

  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach((r) => {
      if (r.primaryLanguage) langs.add(r.primaryLanguage);
    });
    return Array.from(langs).sort();
  }, [repos]);

  const filteredAndSortedRepos = useMemo(() => {
    let result = [...repos];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.topics.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Language filter
    if (selectedLanguage) {
      result = result.filter((r) => r.primaryLanguage === selectedLanguage);
    }

    // 30-day activity filter
    if (onlyActive30Days) {
      result = result.filter((r) => r.isRecentlyUpdated);
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      // 'active' default: Sort by pushed_at
      return new Date(b.pushedAt || b.updatedAt).getTime() - new Date(a.pushedAt || a.updatedAt).getTime();
    });

    return result;
  }, [repos, searchQuery, selectedLanguage, onlyActive30Days, sortBy]);

  return (
    <div className="gh-dashboard">
      <GitHubUsernameSelector
        currentUsername={username}
        onSelectUsername={setUsername}
        onResetDefault={resetDefault}
        isDefaultUser={isDefaultUser}
      />

      {loading && (
        <div className="gh-loading-container" aria-label="Loading GitHub data">
          <div className="gh-spinner" />
          <p className="gh-loading-text">Fetching live GitHub activity for @{username}...</p>
        </div>
      )}

      {error && (
        <div className="gh-error-box" role="alert">
          <p className="gh-error-message">⚠️ {error}</p>
          <div className="gh-error-actions">
            <button type="button" className="gh-retry-button" onClick={refetch}>
              Retry Fetch
            </button>
            {!isDefaultUser && (
              <button type="button" className="gh-reset-button" onClick={resetDefault}>
                Reset to @chris-lau
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !error && user && (
        <>
          <GitHubSummary user={user} />

          <GitHubFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLanguage={selectedLanguage}
            availableLanguages={availableLanguages}
            onLanguageChange={setSelectedLanguage}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onlyActive30Days={onlyActive30Days}
            onToggleActive30Days={() => setOnlyActive30Days((prev) => !prev)}
          />

          <div className="gh-repo-count-bar">
            <span>
              Showing <strong>{filteredAndSortedRepos.length}</strong> of{' '}
              <strong>{repos.length}</strong> repositories
              {onlyActive30Days && ' (Updated in past 30 days)'}
            </span>
          </div>

          {filteredAndSortedRepos.length === 0 ? (
            <div className="gh-empty-state">
              <p>No repositories match your search or filter criteria.</p>
              <button
                type="button"
                className="gh-reset-filters-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLanguage(null);
                  setOnlyActive30Days(false);
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="gh-repo-grid">
              {filteredAndSortedRepos.map((repo) => (
                <GitHubRepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
