import React from 'react';
import { RepoSortOption } from '../../types/github';
import './GitHubComponents.css';

interface GitHubFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLanguage: string | null;
  availableLanguages: string[];
  onLanguageChange: (language: string | null) => void;
  sortBy: RepoSortOption;
  onSortChange: (sort: RepoSortOption) => void;
  onlyActive30Days: boolean;
  onToggleActive30Days: () => void;
}

export const GitHubFilters: React.FC<GitHubFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedLanguage,
  availableLanguages,
  onLanguageChange,
  sortBy,
  onSortChange,
  onlyActive30Days,
  onToggleActive30Days,
}) => {
  return (
    <div className="gh-filters-bar">
      <div className="gh-filter-search">
        <label htmlFor="gh-search-input" className="sr-only">
          Search repositories
        </label>
        <input
          id="gh-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="🔍 Search repos by name or description..."
          className="gh-search-input"
        />
      </div>

      <div className="gh-filter-controls">
        <button
          type="button"
          className={`gh-filter-pill ${onlyActive30Days ? 'active' : ''}`}
          onClick={onToggleActive30Days}
          aria-pressed={onlyActive30Days}
        >
          ⚡ Active (Past 30 Days)
        </button>

        <select
          value={selectedLanguage || ''}
          onChange={(e) => onLanguageChange(e.target.value || null)}
          className="gh-select-input"
          aria-label="Filter by language"
        >
          <option value="">All Languages</option>
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as RepoSortOption)}
          className="gh-select-input"
          aria-label="Sort repositories by"
        >
          <option value="active">Sort: Recently Active</option>
          <option value="stars">Sort: Most Stars ⭐</option>
          <option value="updated">Sort: Recently Updated</option>
          <option value="name">Sort: Name (A-Z)</option>
        </select>
      </div>
    </div>
  );
};
