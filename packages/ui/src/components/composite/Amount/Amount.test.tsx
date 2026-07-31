import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Amount } from './Amount';
import { UIConfigProvider } from '../../../providers/ConfigProvider';

describe('Amount', () => {
  it('formats amount correctly with default config (USD/en-US)', () => {
    render(<Amount value={1500.5} data-testid="amount" />);
    const el = screen.getByTestId('amount');
    
    // In en-US, currency is $1,500.50
    // But depending on the node environment, it might have a narrow non-breaking space or standard
    // We can do a string inclusion check
    expect(el.textContent).toContain('1,500.50');
    expect(el.textContent).toContain('$');
  });

  it('respects UIConfigProvider context', () => {
    render(
      <UIConfigProvider config={{ locale: 'es-EC', currency: 'USD' }}>
        <Amount value={1500.5} data-testid="amount" />
      </UIConfigProvider>
    );
    const el = screen.getByTestId('amount');
    // es-EC format is typically $1.500,50 or US$1.500,50 depending on node version
    expect(el.textContent).toContain('1500,50');
  });

  it('overrides context when props are provided', () => {
    render(
      <UIConfigProvider config={{ locale: 'en-US', currency: 'USD' }}>
        <Amount value={1500.5} locale="de-DE" currency="EUR" data-testid="amount" />
      </UIConfigProvider>
    );
    const el = screen.getByTestId('amount');
    // de-DE format: 1.500,50 €
    expect(el.textContent).toContain('1.500,50');
    expect(el.textContent).toContain('€');
  });

  it('handles signDisplay="always"', () => {
    render(<Amount value={1500} signDisplay="always" data-testid="amount" />);
    const el = screen.getByTestId('amount');
    expect(el.textContent).toContain('+');
  });

  it('handles signDisplay="never" for negative numbers', () => {
    render(<Amount value={-1500} signDisplay="never" data-testid="amount" />);
    const el = screen.getByTestId('amount');
    expect(el.textContent).not.toContain('-');
  });

  it('applies semantic variants', () => {
    const { rerender } = render(<Amount value={100} variant="income" data-testid="amount" />);
    expect(screen.getByTestId('amount').className).toContain('text-success-600');

    rerender(<Amount value={-100} variant="expense" data-testid="amount" />);
    expect(screen.getByTestId('amount').className).toContain('text-error-600');
  });
});
