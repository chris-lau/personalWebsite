import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { CliLayout } from './CliLayout';
import { ThemeProvider } from '../../context/ThemeContext';

const meta: Meta<typeof CliLayout> = {
  title: 'Layout/CliLayout',
  component: CliLayout,
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
type Story = StoryObj<typeof CliLayout>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: '1rem 0' }}>
        <h2>$ cat welcome.txt</h2>
        <p>This is how terminal outputs and commands render inside the CliLayout window.</p>
      </div>
    ),
  },
};
