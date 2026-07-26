import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { AsciiLayout } from './AsciiLayout';
import { ThemeProvider } from '../../context/ThemeContext';

const meta: Meta<typeof AsciiLayout> = {
  title: 'Layout/AsciiLayout',
  component: AsciiLayout,
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
type Story = StoryObj<typeof AsciiLayout>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: '2rem 0' }}>
        <h2>Sample Page Content</h2>
        <p>This is how content looks when rendered inside the AsciiLayout wrapper component.</p>
      </div>
    ),
  },
};
