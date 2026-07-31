import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MoneyInput } from './MoneyInput';
import { UIConfigProvider } from '../../../providers/ConfigProvider';

describe('MoneyInput', () => {
  it('formats initial value correctly', () => {
    render(<MoneyInput value={1500.5} data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toContain('1,500.50');
    expect(input.value).toContain('$');
  });

  it('updates parsed value on change', () => {
    const handleChange = vi.fn();
    render(<MoneyInput value={1500.5} onValueChange={handleChange} data-testid="input" />);
    
    const input = screen.getByTestId('input') as HTMLInputElement;
    
    // Simulate user focusing and typing
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '2000.75' } });
    
    expect(handleChange).toHaveBeenCalledWith(2000.75);
  });

  it('strips formatting on focus for easier editing', () => {
    render(<MoneyInput value={1500.5} data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    
    fireEvent.focus(input);
    // Should remove currency symbol but keep decimal structure
    expect(input.value).toBe('1,500.50');
  });

  it('restores formatting on blur', () => {
    render(<MoneyInput value={1500.5} data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '2500' } });
    fireEvent.blur(input);
    
    expect(input.value).toContain('2,500.00');
    expect(input.value).toContain('$');
  });

  it('supports decimal format', () => {
    render(<MoneyInput value={1500.5} format="decimal" data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('1,500.50');
  });

  it('supports percent format', () => {
    // 50 means 50%
    render(<MoneyInput value={50} format="percent" precision={0} data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toContain('50%');
  });

  it('respects UI config context', () => {
    render(
      <UIConfigProvider config={{ locale: 'es-EC', currency: 'USD' }}>
        <MoneyInput value={1500.5} data-testid="input" />
      </UIConfigProvider>
    );
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toContain('1500,50');
  });
});
