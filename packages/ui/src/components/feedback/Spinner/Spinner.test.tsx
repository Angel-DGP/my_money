import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders correctly with default props', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Cargando');
  });

  it('renders with custom label', () => {
    render(<Spinner label="Cargando datos..." />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Cargando datos...');
    const srLabel = screen.getByText('Cargando datos...');
    expect(srLabel).toHaveClass('sr-only');
  });

  it('applies size classes correctly', () => {
    const { container } = render(<Spinner size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-6', 'h-6');
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-class" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-class');
  });
});
