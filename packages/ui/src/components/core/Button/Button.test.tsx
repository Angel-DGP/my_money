import { render, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { vi } from 'vitest';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
    expect(button).not.toBeDisabled();
  });

  it('handles variants and sizes correctly', () => {
    const { getByRole } = render(<Button variant="destructive" size="lg">Destructive</Button>);
    const button = getByRole('button');
    expect(button).toHaveClass('bg-[var(--color-error)]');
    expect(button).toHaveClass('h-11'); // lg size class
  });

  it('triggers onClick event when not disabled', () => {
    const onClickMock = vi.fn();
    const { getByRole } = render(<Button onClick={onClickMock}>Click</Button>);
    fireEvent.click(getByRole('button'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClick when disabled', () => {
    const onClickMock = vi.fn();
    const { getByRole } = render(<Button onClick={onClickMock} disabled>Click</Button>);
    fireEvent.click(getByRole('button'));
    expect(onClickMock).not.toHaveBeenCalled();
    expect(getByRole('button')).toBeDisabled();
  });

  it('does not trigger onClick when loading', () => {
    const onClickMock = vi.fn();
    const { getByRole } = render(<Button onClick={onClickMock} loading>Click</Button>);
    fireEvent.click(getByRole('button'));
    expect(onClickMock).not.toHaveBeenCalled();
    expect(getByRole('button')).toBeDisabled();
  });

  it('renders icons when provided', () => {
    const { container } = render(<Button leftIcon="plus" rightIcon="chevron-right">Action</Button>);
    const svgs = container.querySelectorAll('svg');
    // Expect 2 SVGs for left and right icons
    expect(svgs.length).toBe(2);
  });
});
