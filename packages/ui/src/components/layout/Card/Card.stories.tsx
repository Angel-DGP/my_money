import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody, CardFooter } from './Card';
import { Button } from '../../core/Button';

const meta = {
  title: 'Layout/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    padding: 'md',
  },
  render: (args) => (
    <Card className="max-w-sm" {...args}>
      <CardHeader>
        <h3 className="text-lg font-semibold leading-none tracking-tight">Project Update</h3>
        <p className="text-sm text-text-secondary">Review the latest changes to the project.</p>
      </CardHeader>
      <CardBody>
        <p className="text-sm">
          The new design system architecture has been finalized. We are now moving onto Level 3 layout primitives.
        </p>
      </CardBody>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

export const PaddingVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
        <Card key={padding} padding={padding} className="max-w-sm">
          <CardHeader><h3 className="font-semibold">Padding: {padding}</h3></CardHeader>
          <CardBody>
            <div className="bg-surface p-2 rounded text-sm">Content area</div>
          </CardBody>
        </Card>
      ))}
    </div>
  ),
};

export const AsChild: Story = {
  render: () => (
    <Card asChild className="max-w-sm cursor-pointer hover:bg-surface transition-colors block">
      <a href="https://example.com" target="_blank" rel="noreferrer">
        <CardHeader>
          <h3 className="font-semibold">Clickable Card</h3>
        </CardHeader>
        <CardBody>
          <p className="text-sm">This entire card is an anchor tag due to asChild.</p>
        </CardBody>
      </a>
    </Card>
  ),
};
