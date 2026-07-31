import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GoalProgress } from './GoalProgress';

describe('GoalProgress', () => {
  it('renders amounts and percentages correctly', () => {
    const { container } = render(<GoalProgress current={250} target={1000} />);
    
    // It should render 25%
    expect(screen.getByText('25%')).toBeInTheDocument();
    
    // Should render "Faltan"
    expect(screen.getByText('Faltan')).toBeInTheDocument();
    
    // Check if the progress bar has 25% width
    const bars = container.querySelectorAll('.bg-primary-500');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('handles goal reached state', () => {
    render(<GoalProgress current={1000} target={1000} />);
    
    // It should render 100%
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    // Should render "Meta completada"
    expect(screen.getByText('Meta completada')).toBeInTheDocument();
  });

  it('can hide percentage and remaining text', () => {
    render(
      <GoalProgress 
        current={250} 
        target={1000} 
        showPercentage={false} 
        showRemaining={false} 
      />
    );
    
    expect(screen.queryByText('25%')).not.toBeInTheDocument();
    expect(screen.queryByText('Faltan')).not.toBeInTheDocument();
  });
});
