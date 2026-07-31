import { render } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon Component', () => {
  it('renders successfully with default props', () => {
    const { container } = render(<Icon name="plus" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies decorative correctly', () => {
    const { container } = render(<Icon name="plus" decorative={true} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('aria-label');
  });

  it('applies title and accessible properties when not decorative', () => {
    const { container } = render(<Icon name="plus" decorative={false} title="Add item" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'false');
    expect(svg).toHaveAttribute('aria-label', 'Add item');
  });

  it('applies the correct size', () => {
    const { container } = render(<Icon name="plus" size="lg" />);
    const svg = container.querySelector('svg');
    // lg size maps to 32
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });
});
