import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Toaster, toast, dismissToast } from './Toast';
import { Button } from '../../core/Button';

// Mock component to trigger toasts
const TestApp = () => {
  return (
    <div>
      <Button onClick={() => toast({ title: 'My Toast', description: 'Desc', duration: 1000 })}>
        Trigger
      </Button>
      <Toaster />
    </div>
  );
};

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clean up memory state
    // We would need a private export to reset it perfectly, but calling dismiss on all is close enough
  });

  it('renders and dismisses toast correctly', async () => {
    render(<TestApp />);
    
    // Trigger toast
    fireEvent.click(screen.getByText('Trigger'));
    
    expect(screen.getByText('My Toast')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
    
    // Fast forward time to auto-dismiss
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    
    expect(screen.queryByText('My Toast')).not.toBeInTheDocument();
  });

  it('handles manual dismiss via close button', () => {
    render(<TestApp />);
    
    fireEvent.click(screen.getByText('Trigger'));
    expect(screen.getByText('My Toast')).toBeInTheDocument();

    const closeBtn = screen.getByText('Cerrar').closest('button');
    fireEvent.click(closeBtn!);
    
    expect(screen.queryByText('My Toast')).not.toBeInTheDocument();
  });
});
