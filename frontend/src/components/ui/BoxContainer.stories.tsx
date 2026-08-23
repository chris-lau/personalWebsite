import type { Meta, StoryObj } from '@storybook/react';
import { BoxContainer } from './BoxContainer';

const meta: Meta<typeof BoxContainer> = {
  title: 'UI/BoxContainer',
  component: BoxContainer,
};

export default meta;
type Story = StoryObj<typeof BoxContainer>;

export const TitledPanel: Story = {
  args: {
    title: 'ASK THIS SITE',
    children: 'A flat widget panel for app-like surfaces you operate, not read.',
  },
};

export const UntitledPanel: Story = {
  args: {
    children: 'Title-less panel used when surrounding context names the surface.',
  },
};
