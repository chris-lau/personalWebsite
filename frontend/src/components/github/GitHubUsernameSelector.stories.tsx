import type { Meta, StoryObj } from '@storybook/react';
import { GitHubUsernameSelector } from './GitHubUsernameSelector';

const meta: Meta<typeof GitHubUsernameSelector> = {
  title: 'GitHub/GitHubUsernameSelector',
  component: GitHubUsernameSelector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GitHubUsernameSelector>;

export const DefaultUser: Story = {
  args: {
    currentUsername: 'chris-lau',
    onSelectUsername: (username: string) => console.log('Selected:', username),
    onResetDefault: () => console.log('Reset default'),
    isDefaultUser: true,
  },
};

export const CustomUser: Story = {
  args: {
    currentUsername: 'facebook',
    onSelectUsername: (username: string) => console.log('Selected:', username),
    onResetDefault: () => console.log('Reset default'),
    isDefaultUser: false,
  },
};
