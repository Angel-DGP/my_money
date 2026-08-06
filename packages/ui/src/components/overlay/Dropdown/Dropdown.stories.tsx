import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown } from './Dropdown';
import { Button } from '../../core/Button';

const meta = {
  title: 'Overlay/Dropdown',
  component: Dropdown.Root,
  tags: ['autodocs'],
} satisfies Meta<typeof Dropdown.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center justify-center p-12">
      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <Button variant="outline">Options</Button>
        </Dropdown.Trigger>
        <Dropdown.Content side="bottom" align="start">
          <Dropdown.Item>Edit Profile</Dropdown.Item>
          <Dropdown.Item>Settings</Dropdown.Item>
          <Dropdown.Separator />
          <Dropdown.Item className="text-error-600 data-[disabled]:text-text-secondary" disabled>
            Delete Account
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex h-[400px] items-center justify-center gap-12">
      <Dropdown.Root>
        <Dropdown.Trigger asChild><Button variant="outline">Top</Button></Dropdown.Trigger>
        <Dropdown.Content side="top">
          <Dropdown.Item>Item 1</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>

      <Dropdown.Root>
        <Dropdown.Trigger asChild><Button variant="outline">Bottom End</Button></Dropdown.Trigger>
        <Dropdown.Content side="bottom" align="end">
          <Dropdown.Item>Item 1</Dropdown.Item>
          <Dropdown.Item>Item 2</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
      
      <Dropdown.Root>
        <Dropdown.Trigger asChild><Button variant="outline">Right</Button></Dropdown.Trigger>
        <Dropdown.Content side="right" align="center">
          <Dropdown.Item>Item 1</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  ),
};
