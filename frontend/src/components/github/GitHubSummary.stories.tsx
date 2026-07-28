import type { Meta, StoryObj } from '@storybook/react';
import { GitHubSummary } from './GitHubSummary';
import { GitHubUser } from '../../types/github';

const mockUser: GitHubUser = {
  username: 'chris-lau',
  displayName: 'Chris Lau',
  avatarUrl: 'https://avatars.githubusercontent.com/u/10001?v=4',
  profileUrl: 'https://github.com/chris-lau',
  bio: 'Software engineer, technical product leader & AI enthusiast building personal website & web apps.',
  publicRepos: 18,
  followers: 42,
  following: 12,
  location: 'San Francisco, CA',
  blogUrl: 'https://chrislau.dev',
  topLanguages: [
    { language: 'TypeScript', count: 12, percentage: 60, color: '#3178c6' },
    { language: 'Python', count: 4, percentage: 25, color: '#3572A5' },
    { language: 'HTML', count: 2, percentage: 15, color: '#e34c26' },
  ],
};

const meta: Meta<typeof GitHubSummary> = {
  title: 'GitHub/GitHubSummary',
  component: GitHubSummary,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GitHubSummary>;

export const Default: Story = {
  args: {
    user: mockUser,
  },
};

export const MinimalProfile: Story = {
  args: {
    user: {
      ...mockUser,
      bio: 'Developer',
      topLanguages: [],
    },
  },
};
