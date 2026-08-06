import type { Meta, StoryObj } from '@storybook/react';
import { MoneyInput } from './MoneyInput';
import React from 'react';

const meta = {
  title: 'Composite/MoneyInput',
  component: MoneyInput,
  tags: ['autodocs'],
  argTypes: {
    format: {
      control: 'radio',
      options: ['currency', 'decimal', 'percent'],
    },
    precision: {
      control: 'number',
    },
  },
} satisfies Meta<typeof MoneyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(1250.75);
    return (
      <div className="max-w-xs flex flex-col gap-2">
        <MoneyInput {...args} value={value} onValueChange={setValue} />
        <p className="text-xs text-text-secondary mt-2">Parsed Number: {value}</p>
      </div>
    );
  },
};

export const Formats: Story = {
  render: () => {
    const [currencyValue, setCurrencyValue] = React.useState<number | null>(1250.75);
    const [decimalValue, setDecimalValue] = React.useState<number | null>(42.5);
    const [percentValue, setPercentValue] = React.useState<number | null>(15);

    return (
      <div className="flex flex-col gap-6 max-w-xs">
        <div>
          <label className="text-sm font-medium mb-1 block">Currency</label>
          <MoneyInput format="currency" value={currencyValue} onValueChange={setCurrencyValue} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Decimal</label>
          <MoneyInput format="decimal" value={decimalValue} onValueChange={setDecimalValue} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Percent (0 precision)</label>
          <MoneyInput format="percent" precision={0} value={percentValue} onValueChange={setPercentValue} />
        </div>
      </div>
    );
  },
};

export const Locales: Story = {
  render: () => {
    const [value, setValue] = React.useState<number | null>(1500.50);
    return (
      <div className="flex flex-col gap-6 max-w-xs">
        <div>
          <label className="text-sm font-medium mb-1 block">US (en-US, USD)</label>
          <MoneyInput locale="en-US" currency="USD" value={value} onValueChange={setValue} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Ecuador (es-EC, USD)</label>
          <MoneyInput locale="es-EC" currency="USD" value={value} onValueChange={setValue} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Germany (de-DE, EUR)</label>
          <MoneyInput locale="de-DE" currency="EUR" value={value} onValueChange={setValue} />
        </div>
      </div>
    );
  },
};
