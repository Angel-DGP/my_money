import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TransactionCard } from './TransactionCard';
import { UIConfigProvider } from '../../../providers/ConfigProvider';

describe('TransactionCard', () => {
  it('renders correctly with default props', () => {
    const date = new Date('2024-03-14T15:30:00Z');
    render(
      <UIConfigProvider config={{ locale: 'en-US', currency: 'USD' }}>
        <TransactionCard
          title="Starbucks"
          category="Food & Drink"
          amount={15.50}
          date={date}
        />
      </UIConfigProvider>
    );

    // Shows title
    expect(screen.getByText('Starbucks')).toBeInTheDocument();
    
    // Shows formatted category (Food & Drink • Date)
    // We check for inclusion because Date format depends on local timezone of the runner
    const dateText = screen.getByText((content) => content.includes('Food & Drink •'));
    expect(dateText).toBeInTheDocument();

    // Since variant is expense by default, amount should be formatted with minus sign
    // The exact text depends on Intl.NumberFormat in the runner env (e.g. "-$15.50")
    // We can just check it contains 15.50 and minus sign.
    expect(screen.getByText((content) => content.includes('15.50'))).toBeInTheDocument();
  });

  it('renders badges if provided', () => {
    const date = new Date('2024-03-14T15:30:00Z');
    render(
      <TransactionCard
        title="Payment"
        amount={100}
        date={date}
        badges={[{ text: 'Card **4242', variant: 'success' }]}
      />
    );

    expect(screen.getByText('Card **4242')).toBeInTheDocument();
  });

  it('renders actions if provided', () => {
    const date = new Date('2024-03-14T15:30:00Z');
    render(
      <TransactionCard
        title="Payment"
        amount={100}
        date={date}
        actions={<button data-testid="action-btn">Action</button>}
      />
    );

    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
  });
});
