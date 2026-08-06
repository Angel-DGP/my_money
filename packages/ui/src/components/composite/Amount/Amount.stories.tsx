import type { Meta, StoryObj } from '@storybook/react';
import { Amount } from './Amount';

const meta = {
  title: 'Composite/Amount',
  component: Amount,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['neutral', 'income', 'expense'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
    },
    signDisplay: {
      control: 'radio',
      options: ['auto', 'always', 'never'],
    },
  },
} satisfies Meta<typeof Amount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 1250.75,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Amount value={1250.75} variant="neutral" />
      <Amount value={1250.75} variant="income" signDisplay="always" />
      <Amount value={-45.00} variant="expense" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <Amount value={1250.75} size="sm" />
      <Amount value={1250.75} size="md" />
      <Amount value={1250.75} size="lg" />
      <Amount value={1250.75} size="xl" />
    </div>
  ),
};

export const CustomLocaleAndCurrency: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-text-secondary mb-1">Japan (JPY)</p>
        <Amount value={1250.75} locale="ja-JP" currency="JPY" />
      </div>
      <div>
        <p className="text-xs text-text-secondary mb-1">Germany (EUR)</p>
        <Amount value={1250.75} locale="de-DE" currency="EUR" />
      </div>
      <div>
        <p className="text-xs text-text-secondary mb-1">Ecuador (USD)</p>
        <Amount value={1250.75} locale="es-EC" currency="USD" />
      </div>
    </div>
  ),
};
