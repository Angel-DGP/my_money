import type { Meta, StoryObj } from '@storybook/react';
import { Dialog } from './Dialog';
import { Modal, ModalHeader, ModalFooter } from '../Modal/Modal';
import { Button } from '../../core/Button';

const meta = {
  title: 'Overlay/Dialog',
  component: Dialog.Root,
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>Open Modal</Button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Modal>
          <ModalHeader>
            <Dialog.Title className="text-xl font-bold">Edit profile</Dialog.Title>
            <Dialog.Description className="text-sm text-text-secondary mt-2">
              Make changes to your profile here. Click save when you're done.
            </Dialog.Description>
          </ModalHeader>
          
          <div className="py-4">
            <div className="bg-surface p-4 rounded-md text-sm">
              Form content goes here...
            </div>
          </div>
          
          <ModalFooter>
            <Dialog.Close asChild>
              <Button variant="ghost">Cancel</Button>
            </Dialog.Close>
            <Button>Save changes</Button>
          </ModalFooter>
        </Modal>
      </Dialog.Portal>
    </Dialog.Root>
  ),
};
