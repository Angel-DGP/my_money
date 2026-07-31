import { render } from '@testing-library/react';
import { Label } from './Label';

describe('Label Component', () => {
  it('renders correctly with htmlFor', () => {
    const { getByText } = render(<Label htmlFor="test-input">Test Label</Label>);
    const labelElement = getByText('Test Label');
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveAttribute('for', 'test-input');
  });

  it('applies custom className', () => {
    const { container } = render(<Label htmlFor="test" className="custom-class">Label</Label>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
