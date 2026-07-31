import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta = {
  title: 'Primitives/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px', height: '200px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <div>
      <div>Content Above</div>
      <Divider {...args} className="my-4" />
      <div>Content Below</div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div style={{ display: 'flex', height: '100px', alignItems: 'center' }}>
      <div>Left Content</div>
      <Divider {...args} className="mx-4" />
      <div>Right Content</div>
    </div>
  ),
};

export const SemanticSeparator: Story = {
  args: {
    orientation: 'horizontal',
    decorative: false,
  },
  render: (args) => (
    <div>
      <h3 className="text-lg font-bold">Section 1</h3>
      <p className="text-text-secondary mb-4">Description of section 1.</p>
      
      <Divider {...args} />
      
      <h3 className="text-lg font-bold mt-4">Section 2</h3>
      <p className="text-text-secondary">Description of section 2.</p>
    </div>
  ),
};
