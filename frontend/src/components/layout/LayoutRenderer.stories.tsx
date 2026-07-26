import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { LayoutRenderer } from './LayoutRenderer';
import { ThemeProvider } from '../../context/ThemeContext';

const meta: Meta<typeof LayoutRenderer> = {
  title: 'Layout/LayoutRenderer',
  component: LayoutRenderer,
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
type Story = StoryObj<typeof LayoutRenderer>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h2>Dynamic Theme Layout Demo</h2>
        <p>Click the mode toggle button in the header above to watch the entire layout instantly switch between ASCII and CLI themes!</p>
      </div>
    ),
  },
};
