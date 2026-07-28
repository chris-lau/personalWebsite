import React, { useState } from 'react';
import './GitHubComponents.css';

interface GitHubUsernameSelectorProps {
  currentUsername: string;
  onSelectUsername: (username: string) => void;
  onResetDefault: () => void;
  isDefaultUser: boolean;
}

const PRESET_USERNAMES = ['chris-lau', 'facebook', 'vercel', 'google'];

export const GitHubUsernameSelector: React.FC<GitHubUsernameSelectorProps> = ({
  currentUsername,
  onSelectUsername,
  onResetDefault,
  isDefaultUser,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSelectUsername(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="gh-selector-container">
      <form onSubmit={handleSubmit} className="gh-selector-form">
        <label htmlFor="gh-username-input" className="sr-only">
          Lookup GitHub Username
        </label>
        <input
          id="gh-username-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Lookup any GitHub user / org..."
          className="gh-username-input"
        />
        <button type="submit" className="gh-selector-button">
          Lookup
        </button>
      </form>

      <div className="gh-presets">
        <span className="gh-presets-label">Presets:</span>
        {PRESET_USERNAMES.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`gh-preset-chip ${
              currentUsername.toLowerCase() === preset.toLowerCase() ? 'active' : ''
            }`}
            onClick={() => onSelectUsername(preset)}
          >
            @{preset}
          </button>
        ))}

        {!isDefaultUser && (
          <button type="button" className="gh-reset-button" onClick={onResetDefault}>
            ↩ Reset to @chris-lau
          </button>
        )}
      </div>
    </div>
  );
};
