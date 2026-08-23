import type { Meta, StoryObj } from '@storybook/react';
import { FullStackMonitoringDashboard } from './FullStackMonitoringDashboard';
import { ThemeProvider } from '../../context/ThemeContext';

const meta: Meta<typeof FullStackMonitoringDashboard> = {
  title: 'Monitoring/FullStackMonitoringDashboard',
  component: FullStackMonitoringDashboard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FullStackMonitoringDashboard>;

export const OperationalMode: Story = {};

