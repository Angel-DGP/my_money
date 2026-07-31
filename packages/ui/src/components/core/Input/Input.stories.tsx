import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'Primitives/Input',
  component: Input,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'default-input',
    name: 'default',
    placeholder: 'Enter text here...',
  },
};

export const WithLabel: Story = {
  args: {
    id: 'label-input',
    name: 'label',
    label: 'Username',
    placeholder: 'Enter username',
  },
};

export const Required: Story = {
  args: {
    id: 'required-input',
    name: 'required',
    label: 'Email Address',
    required: true,
    placeholder: 'Enter your email',
  },
};

export const ErrorState: Story = {
  args: {
    id: 'error-input',
    name: 'error',
    label: 'Email Address',
    defaultValue: 'invalid-email',
    error: 'Please enter a valid email address.',
  },
};

export const HelperText: Story = {
  args: {
    id: 'helper-input',
    name: 'helper',
    label: 'Password',
    type: 'password',
    helperText: 'Must be at least 8 characters long.',
  },
};

export const Disabled: Story = {
  args: {
    id: 'disabled-input',
    name: 'disabled',
    label: 'Disabled Field',
    disabled: true,
    value: 'Cannot edit this',
  },
};

export const ReadOnly: Story = {
  args: {
    id: 'readonly-input',
    name: 'readonly',
    label: 'Read Only Field',
    readOnly: true,
    value: 'Locked value',
  },
};

export const LeftIcon: Story = {
  args: {
    id: 'left-icon-input',
    name: 'leftIcon',
    placeholder: 'Search...',
    leftIcon: 'search',
  },
};

export const RightIcon: Story = {
  args: {
    id: 'right-icon-input',
    name: 'rightIcon',
    placeholder: 'Clear input',
    defaultValue: 'Some text',
    rightIcon: 'x',
  },
};

export const Password: Story = {
  args: {
    id: 'password-input',
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const Search: Story = {
  args: {
    id: 'search-input',
    name: 'search',
    type: 'search',
    placeholder: 'Search transactions...',
    leftIcon: 'search',
  },
};
