import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { ModernLayout } from './ModernLayout';
import { ThemeProvider } from '../../context/ThemeContext';

const meta: Meta<typeof ModernLayout> = {
  title: 'Layout/ModernLayout',
  component: ModernLayout,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <MemoryRouter>
          <div data-theme="modern">
            <Story />
          </div>
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ModernLayout>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Engineering Intelligent Systems &amp; Human-AI Interfaces
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Welcome to the Modern Editorial layout, inspired by Anthropic and OpenAI designs.
        </p>
      </div>
    ),
  },
};
