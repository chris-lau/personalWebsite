import type { Meta, StoryObj } from '@storybook/react';
import { BoxContainer } from './BoxContainer';

const meta: Meta<typeof BoxContainer> = {
  title: 'UI/BoxContainer',
  component: BoxContainer,
};

export default meta;
type Story = StoryObj<typeof BoxContainer>;

export const SingleBorder: Story = {
  args: {
    title: 'WELCOME',
    children: 'This is inside a single-border box container.',
  },
};

export const DoubleBorder: Story = {
  args: {
    title: 'SYSTEM LOGS',
    variant: 'double',
    children: 'This box uses double border lines for extra visual distinction.',
  },
};
