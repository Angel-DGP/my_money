import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Dialog } from './Dialog';
import { Modal, ModalHeader, ModalFooter } from '../Modal/Modal';
import { Button } from '../../core/Button';

describe('Dialog and Modal Composition', () => {
  it('opens modal on trigger click and closes on escape', async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button>Open Modal</Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Modal data-testid="modal">
            <ModalHeader>
              <Dialog.Title>My Title</Dialog.Title>
              <Dialog.Description>My Description</Dialog.Description>
            </ModalHeader>
            <div>Content</div>
            <ModalFooter>
              <Dialog.Close asChild>
                <Button>Cancel</Button>
              </Dialog.Close>
            </ModalFooter>
          </Modal>
        </Dialog.Portal>
      </Dialog.Root>
    );

    // Should not be visible initially
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

    // Click trigger
    fireEvent.click(screen.getByText('Open Modal'));
    
    // Should be visible
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    
    // Check aria linkages
    const modal = screen.getByTestId('modal');
    expect(modal.getAttribute('aria-labelledby')).toBe(screen.getByText('My Title').id);
    expect(modal.getAttribute('aria-describedby')).toBe(screen.getByText('My Description').id);
    
    // Check close via close button
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => expect(screen.queryByTestId('modal')).not.toBeInTheDocument());
  });

  it('closes on escape key', async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Modal data-testid="modal">Content</Modal>
        </Dialog.Portal>
      </Dialog.Root>
    );

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    
    // Simulate escape on body
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => expect(screen.queryByTestId('modal')).not.toBeInTheDocument());
  });
});
