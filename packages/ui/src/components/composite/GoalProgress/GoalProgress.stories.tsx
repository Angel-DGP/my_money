import type { Meta, StoryObj } from '@storybook/react';
import { GoalProgress } from './GoalProgress';

const meta = {
  title: 'Composite/GoalProgress',
  component: GoalProgress,
  tags: ['autodocs'],
} satisfies Meta<typeof GoalProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    current: 250,
    target: 1000,
    percentage: 25,
    remaining: 750,
  },
};

export const Halfway: Story = {
  args: {
    current: 500,
    target: 1000,
    percentage: 50,
    remaining: 500,
  },
};

export const Completed: Story = {
  args: {
    current: 1000,
    target: 1000,
    percentage: 100,
    remaining: 0,
  },
};

export const WithoutDetails: Story = {
  args: {
    current: 500,
    target: 1000,
    percentage: 50,
    remaining: 500,
    showPercentage: false,
    showRemaining: false,
  },
};
