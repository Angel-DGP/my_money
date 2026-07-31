import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './Label';

const meta = {
  title: 'Primitives/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    htmlFor: 'example',
    children: 'Email Address',
  },
};

export const Error: Story = {
  args: {
    htmlFor: 'example-error',
    children: 'Email Address (Error)',
    className: 'text-error-500',
  },
};
