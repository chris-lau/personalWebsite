import React from 'react';
import { GitHubRepo } from '../../types/github';
import './GitHubComponents.css';

interface GitHubRepoCardProps {
  repo: GitHubRepo;
}

export const GitHubRepoCard: React.FC<GitHubRepoCardProps> = ({ repo }) => {
  return (
    <div className={`gh-repo-card ${repo.isRecentlyUpdated ? 'recently-active' : ''}`}>
      <div className="gh-card-header">
        <h3 className="gh-repo-name">
          <a href={repo.githubUrl} target="_blank" rel="noopener noreferrer">
            {repo.name}
          </a>
        </h3>
        {repo.isRecentlyUpdated && (
          <span className="gh-active-badge" title="Pushed to or updated within the last 30 days">
            🔥 Active
          </span>
        )}
      </div>

      <p className="gh-repo-desc">{repo.description}</p>

      {repo.topics.length > 0 && (
        <div className="gh-topic-tags">
          {repo.topics.slice(0, 4).map((topic) => (
            <span key={topic} className="gh-topic-tag">
              #{topic}
            </span>
          ))}
        </div>
      )}

      <div className="gh-repo-meta">
        <div className="gh-meta-left">
          <span className="gh-lang-badge">
            <span className="gh-lang-dot" />
            {repo.primaryLanguage}
          </span>
          {repo.stars > 0 && (
            <span className="gh-meta-stat" title="Stars">
              ⭐ {repo.stars}
            </span>
          )}
          {repo.forks > 0 && (
            <span className="gh-meta-stat" title="Forks">
              🍴 {repo.forks}
            </span>
          )}
        </div>
        <span className="gh-time-updated">{repo.formattedLastUpdated}</span>
      </div>

      <div className="gh-repo-actions">
        <a
          href={repo.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="gh-link-button"
        >
          GitHub ↗
        </a>
        {repo.demoUrl && (
          <a
            href={repo.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="gh-link-button live-demo"
          >
            Live Demo 🌐
          </a>
        )}
      </div>
    </div>
  );
};
