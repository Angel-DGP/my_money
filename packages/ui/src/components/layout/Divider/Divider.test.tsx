import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders correctly as horizontal by default', () => {
    const { container } = render(<Divider />);
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveClass('h-px', 'w-full');
    expect(divider).toHaveAttribute('role', 'none');
  });

  it('renders vertically', () => {
    const { container } = render(<Divider orientation="vertical" />);
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveClass('h-full', 'w-px');
  });

  it('renders with separator role when not decorative', () => {
    render(<Divider decorative={false} />);
    const divider = screen.getByRole('separator');
    expect(divider).toBeInTheDocument();
  });

  it('sets aria-orientation when vertical and not decorative', () => {
    render(<Divider orientation="vertical" decorative={false} />);
    const divider = screen.getByRole('separator');
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('applies custom className', () => {
    const { container } = render(<Divider className="custom-class" />);
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveClass('custom-class');
  });
});
