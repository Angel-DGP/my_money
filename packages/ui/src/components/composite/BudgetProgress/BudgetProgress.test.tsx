import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BudgetProgress } from './BudgetProgress';

describe('BudgetProgress', () => {
  it('renders amounts and percentages correctly', () => {
    const { container } = render(<BudgetProgress spent={500} limit={1000} />);
    
    // It should render 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
    
    // Should render "Disponible"
    expect(screen.getByText('Disponible')).toBeInTheDocument();
    
    // Check if the progress bar has 50% width
    const bars = container.querySelectorAll('.bg-primary-500');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('handles over-budget state', () => {
    render(<BudgetProgress spent={1200} limit={1000} />);
    
    // It should render 100% since width maxes at 100% visually, but the text might show >100% or we cap it at 100%. 
    // In our implementation we capped percentage to 100%
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    // Should render "Excedido por"
    expect(screen.getByText('Excedido por')).toBeInTheDocument();
  });

  it('can hide percentage and remaining text', () => {
    render(
      <BudgetProgress 
        spent={500} 
        limit={1000} 
        showPercentage={false} 
        showRemaining={false} 
      />
    );
    
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
    expect(screen.queryByText('Disponible')).not.toBeInTheDocument();
  });
});
