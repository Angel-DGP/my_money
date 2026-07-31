import type { Meta, StoryObj } from '@storybook/react';
import { TransactionCard } from './TransactionCard';
import { Dropdown } from '../../overlay/Dropdown';
import { Icon } from '../../core/Icon';
import React from 'react';

const meta = {
  title: 'Composite/TransactionCard',
  component: TransactionCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['income', 'expense', 'transfer'],
    },
    date: {
      control: 'date',
    },
  },
} satisfies Meta<typeof TransactionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Parse date arg back to Date object for stories
const withDateParsed = (args: any) => ({
  ...args,
  date: new Date(args.date),
});

export const Default: Story = {
  args: {
    title: 'Starbucks',
    category: 'Food & Drink',
    amount: 15.50,
    date: new Date('2024-03-14T15:30:00Z'),
    variant: 'expense',
    icon: 'coffee',
  },
  render: (args) => <TransactionCard {...withDateParsed(args)} />,
};

export const Income: Story = {
  args: {
    title: 'Salary',
    category: 'Income',
    amount: 5500.00,
    date: new Date('2024-03-01T09:00:00Z'),
    variant: 'income',
    icon: 'dollar-sign',
  },
  render: (args) => <TransactionCard {...withDateParsed(args)} />,
};

export const Transfer: Story = {
  args: {
    title: 'Transfer to Alice',
    category: 'Friends',
    amount: 150.00,
    date: new Date('2024-03-10T12:00:00Z'),
    variant: 'transfer',
    icon: 'arrow-right-circle',
  },
  render: (args) => <TransactionCard {...withDateParsed(args)} />,
};

export const WithBadgesAndActions: Story = {
  args: {
    title: 'Uber Eats',
    category: 'Food & Drink',
    amount: 34.20,
    date: new Date('2024-03-15T19:45:00Z'),
    variant: 'expense',
    icon: 'shopping-bag',
    badges: [
      { text: 'Pending', variant: 'warning' },
      { text: 'Visa **4242' },
    ],
    actions: (
      <Dropdown.Root>
        <Dropdown.Trigger>
          <button className="p-2 text-text-muted hover:text-text-base hover:bg-surface-100 rounded-full transition-colors">
            <Icon name="more-horizontal" size="sm" />
          </button>
        </Dropdown.Trigger>
        <Dropdown.Content align="end">
          <Dropdown.Item>Edit</Dropdown.Item>
          <Dropdown.Item>Duplicate</Dropdown.Item>
          <Dropdown.Separator />
          <Dropdown.Item className="text-error-600 focus:text-error-600">Delete</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
    ),
  },
  render: (args) => <TransactionCard {...withDateParsed(args)} />,
};
