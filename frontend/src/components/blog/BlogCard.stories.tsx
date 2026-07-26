import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { BlogCard } from './BlogCard';

const meta: Meta<typeof BlogCard> = {
  title: 'Blog/BlogCard',
  component: BlogCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: '600px', margin: '20px auto' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BlogCard>;

export const Default: Story = {
  args: {
    post: {
      id: 'demo-post',
      slug: 'demo-post-slug',
      title: 'Demystifying Modern React Architecture',
      description: 'A beginner-friendly deep dive into TypeScript interfaces, static data layers, and dev servers.',
      updatedDate: '2026-07-26',
      readTime: '6 min read',
      tags: ['React', 'TypeScript', 'Vite'],
      author: 'Chris Lau',
      content: 'Demo content',
    },
  },
};
