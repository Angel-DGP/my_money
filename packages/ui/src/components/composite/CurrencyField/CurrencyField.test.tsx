import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CurrencyField } from './CurrencyField';

describe('CurrencyField', () => {
  it('renders label and input correctly', () => {
    render(<CurrencyField label="Amount" value={150} />);
    
    // Label should be in the document
    expect(screen.getByText('Amount')).toBeInTheDocument();
    
    // The input should be implicitly labelled by the Label (because of id linking)
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toContain('150.00');
  });

  it('renders description if provided', () => {
    render(<CurrencyField label="Amount" description="Enter the total amount" />);
    expect(screen.getByText('Enter the total amount')).toBeInTheDocument();
  });

  it('renders helper text if provided and no error', () => {
    render(<CurrencyField label="Amount" helperText="Helper info" />);
    expect(screen.getByText('Helper info')).toBeInTheDocument();
  });

  it('renders error and overrides helper text', () => {
    render(
      <CurrencyField 
        label="Amount" 
        helperText="Helper info" 
        error="Invalid amount" 
      />
    );
    expect(screen.getByText('Invalid amount')).toBeInTheDocument();
    expect(screen.queryByText('Helper info')).not.toBeInTheDocument();
  });

  it('sets aria-invalid on the input when error is present', () => {
    render(<CurrencyField label="Amount" error="Invalid" />);
    const input = screen.getByLabelText('Amount');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('links aria-describedby correctly', () => {
    render(
      <CurrencyField 
        label="Amount" 
        description="Desc" 
        error="Err" 
      />
    );
    const input = screen.getByLabelText('Amount');
    const descId = screen.getByText('Desc').id;
    const errId = screen.getByText('Err').id;
    
    expect(input.getAttribute('aria-describedby')).toContain(descId);
    expect(input.getAttribute('aria-describedby')).toContain(errId);
  });
});
