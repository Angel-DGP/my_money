import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardBody, CardFooter } from './Card';

describe('Card', () => {
  it('renders children and subcomponents correctly', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">Header</CardHeader>
        <CardBody data-testid="body">Body</CardBody>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeDefined();
    expect(screen.getByTestId('header')).toHaveTextContent('Header');
    expect(screen.getByTestId('body')).toHaveTextContent('Body');
    expect(screen.getByTestId('footer')).toHaveTextContent('Footer');
  });

  it('applies padding variants correctly via Context', () => {
    render(
      <Card padding="none">
        <CardBody data-testid="body">No Padding</CardBody>
      </Card>
    );
    // the body should receive p-0 due to padding="none"
    expect(screen.getByTestId('body').className).toContain('p-0');
  });

  it('renders as a custom element using asChild', () => {
    render(
      <Card asChild data-testid="card-section">
        <section>Section Card</section>
      </Card>
    );
    const card = screen.getByTestId('card-section');
    expect(card.tagName.toLowerCase()).toBe('section');
    // it should still have the card classes
    expect(card.className).toContain('rounded-xl');
  });
});
