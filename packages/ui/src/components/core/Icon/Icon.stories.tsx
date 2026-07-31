import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';

const meta = {
  title: 'Primitives/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'plus',
    size: 'md',
    decorative: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Icon name="check" size="xs" />
      <Icon name="check" size="sm" />
      <Icon name="check" size="md" />
      <Icon name="check" size="lg" />
    </div>
  ),
};

export const Accessible: Story = {
  args: {
    name: 'info',
    decorative: false,
    title: 'More Information',
  },
};

export const Colored: Story = {
  args: {
    name: 'alert-triangle',
    className: 'text-warning-500',
  },
};
