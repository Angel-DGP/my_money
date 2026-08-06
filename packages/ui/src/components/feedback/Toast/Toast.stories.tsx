import type { Meta, StoryObj } from '@storybook/react';
import { Toaster, toast } from './Toast';
import { Button } from '../../core/Button';

const ToastDemo = () => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => {
          toast({
            title: 'Scheduled: Catch up',
            description: 'Friday, February 10, 2024 at 5:57 PM',
            action: {
              label: 'Undo',
              onClick: () => console.log('Undo'),
            },
          });
        }}
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: 'Operation successful',
            description: 'The changes have been saved.',
            variant: 'success',
          });
        }}
      >
        Success
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          toast({
            title: 'Error processing payment',
            description: 'Please check your card details.',
            variant: 'error',
          });
        }}
      >
        Error
      </Button>
      
      {/* Required to render toasts in Storybook */}
      <Toaster />
    </div>
  );
};

const meta = {
  title: 'Feedback/Toast',
  component: ToastDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof ToastDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
