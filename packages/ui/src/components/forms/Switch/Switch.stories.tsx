import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Forms/Switch',
  component: Switch,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    label: 'Notificaciones activas',
    description: 'Recibir alertas por correo ante movimientos inusuales.',
  },
};

export const Checked: Story = {
  args: {
    label: 'Modo Automático',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Opción bloqueada',
    disabled: true,
    checked: true,
  },
};
