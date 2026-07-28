import React from 'react';
import { GitHubUser } from '../../types/github';
import './GitHubComponents.css';

interface GitHubSummaryProps {
  user: GitHubUser;
}

export const GitHubSummary: React.FC<GitHubSummaryProps> = ({ user }) => {
  return (
    <div className="gh-summary-card">
      <div className="gh-summary-header">
        <img
          src={user.avatarUrl}
          alt={`${user.displayName}'s GitHub Avatar`}
          className="gh-avatar"
        />
        <div className="gh-user-info">
          <div className="gh-user-names">
            <h2 className="gh-display-name">{user.displayName}</h2>
            <a
              href={user.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gh-handle-link"
            >
              @{user.username} ↗
            </a>
          </div>
          <p className="gh-bio">{user.bio}</p>

          <div className="gh-stats-row">
            <div className="gh-stat-badge">
              <span className="gh-stat-value">{user.publicRepos}</span>
              <span className="gh-stat-label">Public Repos</span>
            </div>
            <div className="gh-stat-badge">
              <span className="gh-stat-value">{user.followers}</span>
              <span className="gh-stat-label">Followers</span>
            </div>
            <div className="gh-stat-badge">
              <span className="gh-stat-value">{user.following}</span>
              <span className="gh-stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>

      {user.topLanguages.length > 0 && (
        <div className="gh-languages-section">
          <h4 className="gh-section-subtitle">Top Languages</h4>
          <div className="gh-language-bar" role="progressbar" aria-label="Top language breakdown">
            {user.topLanguages.map((stat) => (
              <div
                key={stat.language}
                className="gh-language-bar-segment"
                style={{
                  width: `${stat.percentage}%`,
                  backgroundColor: stat.color,
                }}
                title={`${stat.language}: ${stat.percentage}%`}
              />
            ))}
          </div>
          <div className="gh-language-legend">
            {user.topLanguages.map((stat) => (
              <span key={stat.language} className="gh-legend-item">
                <span
                  className="gh-legend-dot"
                  style={{ backgroundColor: stat.color }}
                />
                {stat.language} <span className="gh-legend-pct">{stat.percentage}%</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
