import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } from './Table';

describe('Table', () => {
  it('renders a complete table correctly', () => {
    render(
      <Table data-testid="table">
        <TableCaption data-testid="caption">A list of your recent invoices.</TableCaption>
        <TableHeader data-testid="header">
          <TableRow data-testid="header-row">
            <TableHead data-testid="head-1">Invoice</TableHead>
            <TableHead data-testid="head-2" align="right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid="body">
          <TableRow data-testid="body-row">
            <TableCell data-testid="cell-1">INV001</TableCell>
            <TableCell data-testid="cell-2" align="right">$250.00</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter data-testid="footer">
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell align="right">$250.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(screen.getByTestId('caption')).toHaveTextContent('A list of your recent invoices.');
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('body')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    
    // Check align prop logic
    expect(screen.getByTestId('head-2').className).toContain('text-right');
    expect(screen.getByTestId('cell-2').className).toContain('text-right');
  });
});
