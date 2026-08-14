import type { Meta, StoryObj } from '@storybook/react';
import { NumberInput } from './NumberInput';

const meta: Meta<typeof NumberInput> = {
  title: 'Forms/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  args: {
    label: 'Día de Pago (1-31)',
    placeholder: 'Ej: 5',
    min: 1,
    max: 31,
  },
};

export const WithSuffix: Story = {
  args: {
    label: 'Tasa de Interés',
    placeholder: 'Ej: 16.5',
    suffix: '%',
    step: 0.1,
    min: 0,
    max: 100,
  },
};

export const WithError: Story = {
  args: {
    label: 'Cuotas',
    value: 0,
    error: 'El número de cuotas debe ser mayor a 0',
  },
};
