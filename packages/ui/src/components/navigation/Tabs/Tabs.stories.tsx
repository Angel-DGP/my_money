import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    activationMode: {
      control: 'radio',
      options: ['automatic', 'manual'],
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 'account',
    orientation: 'horizontal',
    activationMode: 'automatic',
  },
  render: (args) => (
    <Tabs {...args} className="w-[400px]">
      <TabsList className="w-full">
        <TabsTrigger className="w-full" value="account">Account</TabsTrigger>
        <TabsTrigger className="w-full" value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="p-4 border border-border-subtle rounded-md mt-2">
          Make changes to your account here.
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="p-4 border border-border-subtle rounded-md mt-2">
          Change your password here.
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  args: {
    defaultValue: 'general',
    orientation: 'vertical',
  },
  render: (args) => (
    <Tabs {...args} className="w-[600px]">
      <TabsList className="w-48">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="general">
          <h3 className="text-lg font-medium">General Settings</h3>
          <p className="text-sm text-text-muted mt-2">Update your primary preferences.</p>
        </TabsContent>
        <TabsContent value="billing">
          <h3 className="text-lg font-medium">Billing Information</h3>
          <p className="text-sm text-text-muted mt-2">Manage your payment methods.</p>
        </TabsContent>
        <TabsContent value="notifications">
          <h3 className="text-lg font-medium">Notifications</h3>
          <p className="text-sm text-text-muted mt-2">Configure email alerts.</p>
        </TabsContent>
      </div>
    </Tabs>
  ),
};
