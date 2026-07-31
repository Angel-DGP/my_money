import { render, fireEvent } from '@testing-library/react';
import { Input } from './Input';
import { vi } from 'vitest';

describe('Input Component', () => {
  it('renders correctly with required props', () => {
    const { getByRole } = render(<Input id="test-input" name="test" />);
    const input = getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('name', 'test');
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('renders a label when provided', () => {
    const { getByLabelText } = render(<Input id="test-input" name="test" label="Email Address" />);
    const input = getByLabelText('Email Address');
    expect(input).toBeInTheDocument();
  });

  it('displays helper text and assigns aria-describedby', () => {
    const { getByText, getByRole } = render(
      <Input id="test-input" name="test" helperText="Enter your email" />
    );
    const helper = getByText('Enter your email');
    expect(helper).toBeInTheDocument();
    expect(helper).toHaveAttribute('id', 'test-input-helper');
    
    const input = getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
  });

  it('displays error text, marks as invalid, and overrides helper text', () => {
    const { getByText, getByRole, queryByText } = render(
      <Input id="test-input" name="test" helperText="Helper" error="Invalid email" />
    );
    const error = getByText('Invalid email');
    expect(error).toBeInTheDocument();
    expect(queryByText('Helper')).not.toBeInTheDocument();
    
    const input = getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
  });

  it('renders icons when provided', () => {
    const { container } = render(
      <Input id="test-input" name="test" leftIcon="search" rightIcon="check" />
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(2);
  });
});
