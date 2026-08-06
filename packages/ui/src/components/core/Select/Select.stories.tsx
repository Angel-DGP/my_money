import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta = {
  title: 'Core/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'select-default',
    name: 'default',
    label: 'Select Option',
    children: (
      <>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </>
    ),
  },
};

export const WithHelperText: Story = {
  args: {
    id: 'select-helper',
    name: 'helper',
    label: 'Select Option',
    helperText: 'Please select an option from the list.',
    children: (
      <>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </>
    ),
  },
};

export const WithError: Story = {
  args: {
    id: 'select-error',
    name: 'error',
    label: 'Select Option',
    error: 'This field is required.',
    required: true,
    children: (
      <>
        <option value="" disabled selected>Select an option</option>
        <option value="1">Option 1</option>
      </>
    ),
  },
};

export const Disabled: Story = {
  args: {
    id: 'select-disabled',
    name: 'disabled',
    label: 'Select Option',
    disabled: true,
    children: (
      <option value="1">Option 1</option>
    ),
  },
};
