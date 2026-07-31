import type { Meta, StoryObj } from '@storybook/react';
import { CurrencyField } from './CurrencyField';
import React from 'react';

const meta = {
  title: 'Composite/CurrencyField',
  component: CurrencyField,
  tags: ['autodocs'],
} satisfies Meta<typeof CurrencyField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Amount',
    value: 1250,
  },
};

export const WithDescriptionAndHelper: Story = {
  args: {
    label: 'Monthly Income',
    description: 'Enter your total monthly income after taxes.',
    helperText: 'This helps us calculate your budget limits.',
    value: 5000,
  },
};

export const WithError: Story = {
  args: {
    label: 'Transfer Amount',
    description: 'Amount to send to the recipient',
    error: 'Insufficient funds in your account.',
    value: 1000000,
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = React.useState<number | null>(0);
    const hasError = value !== null && value > 10000;
    
    return (
      <div className="max-w-sm">
        <CurrencyField
          label="Payment Amount"
          description="Enter the amount you wish to pay."
          value={value}
          onValueChange={setValue}
          helperText="Maximum allowed is $10,000.00"
          error={hasError ? 'Amount exceeds the maximum allowed limit.' : undefined}
        />
      </div>
    );
  },
};
