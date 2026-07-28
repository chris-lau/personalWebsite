/**
 * GitHub API Raw Data Models & Transformed View Models
 */

// Raw GitHub User API Response
export interface GitHubUserResponse {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

// Raw GitHub Repository API Response
export interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
  default_branch: string;
}

// Language statistics model
export interface LanguageStat {
  language: string;
  count: number;
  percentage: number;
  color: string;
}

// Transformed User View Model
export interface GitHubUser {
  username: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  location?: string;
  blogUrl?: string;
  topLanguages: LanguageStat[];
}

// Transformed Repository View Model
export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  githubUrl: string;
  demoUrl: string | null;
  stars: number;
  forks: number;
  primaryLanguage: string;
  topics: string[];
  isFork: boolean;
  updatedAt: string;
  pushedAt: string;
  formattedLastUpdated: string;
  isRecentlyUpdated: boolean; // Pushed or updated within the last 30 days
}

// Dashboard Filter Options
export type RepoSortOption = 'active' | 'stars' | 'updated' | 'name';
