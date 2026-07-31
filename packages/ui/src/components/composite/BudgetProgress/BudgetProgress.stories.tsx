import type { Meta, StoryObj } from '@storybook/react';
import { BudgetProgress } from './BudgetProgress';

const meta = {
  title: 'Composite/BudgetProgress',
  component: BudgetProgress,
  tags: ['autodocs'],
} satisfies Meta<typeof BudgetProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    spent: 450,
    limit: 1000,
    percentage: 45,
    remaining: 550,
  },
};

export const Warning: Story = {
  args: {
    spent: 880,
    limit: 1000,
    percentage: 88,
    remaining: 120,
  },
};

export const Exceeded: Story = {
  args: {
    spent: 1250,
    limit: 1000,
    percentage: 125,
    remaining: -250,
  },
};

export const WithoutDetails: Story = {
  args: {
    spent: 300,
    limit: 1000,
    percentage: 30,
    remaining: 700,
    showPercentage: false,
    showRemaining: false,
  },
};
