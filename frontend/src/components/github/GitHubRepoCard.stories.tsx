import type { Meta, StoryObj } from '@storybook/react';
import { GitHubRepoCard } from './GitHubRepoCard';
import { GitHubRepo } from '../../types/github';

const baseRepo: GitHubRepo = {
  id: 1,
  name: 'personalWebsite',
  fullName: 'chris-lau/personalWebsite',
  description: 'Triple-themed personal website and technical blog engine built with React 18, TypeScript, and Vite.',
  githubUrl: 'https://github.com/chris-lau/personalWebsite',
  demoUrl: 'https://chrislau.dev',
  stars: 24,
  forks: 5,
  primaryLanguage: 'TypeScript',
  topics: ['react', 'typescript', 'vite', 'storybook'],
  isFork: false,
  updatedAt: new Date().toISOString(),
  pushedAt: new Date().toISOString(),
  formattedLastUpdated: '2 hours ago',
  isRecentlyUpdated: true,
};

const meta: Meta<typeof GitHubRepoCard> = {
  title: 'GitHub/GitHubRepoCard',
  component: GitHubRepoCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GitHubRepoCard>;

export const ActiveRepo: Story = {
  args: {
    repo: baseRepo,
  },
};

export const StandardRepo: Story = {
  args: {
    repo: {
      ...baseRepo,
      name: 'legacy-utility',
      description: 'Older command line utility for log parsing.',
      demoUrl: null,
      stars: 3,
      forks: 0,
      primaryLanguage: 'Python',
      isRecentlyUpdated: false,
      formattedLastUpdated: '1 year ago',
    },
  },
};
