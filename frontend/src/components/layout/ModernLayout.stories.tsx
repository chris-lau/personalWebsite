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
          <Story />
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
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Technical product leader who builds the AI systems he ships.
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          The Light Crisp layout — one design system, light and dark modes.
        </p>
      </div>
    ),
  },
};
