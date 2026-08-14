import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Forms/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {
    label: 'Fecha de transacción',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Fecha de pago',
    value: '2026-08-14',
  },
};

export const WithError: Story = {
  args: {
    label: 'Fecha límite',
    error: 'La fecha no puede ser en el pasado',
  },
};
