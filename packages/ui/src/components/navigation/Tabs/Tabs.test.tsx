import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

describe('Tabs', () => {
  it('renders tabs and controls selection correctly', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="content-1">Content 1</TabsContent>
        <TabsContent value="tab2" data-testid="content-2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByTestId('content-1')).toBeInTheDocument();
    expect(screen.queryByTestId('content-2')).not.toBeInTheDocument();

    const tab2 = screen.getByText('Tab 2');
    fireEvent.click(tab2);

    expect(screen.queryByTestId('content-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('content-2')).toBeInTheDocument();
  });

  it('handles keyboard navigation (horizontal)', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">C1</TabsContent>
        <TabsContent value="tab2">C2</TabsContent>
      </Tabs>
    );

    const tab1 = screen.getByText('Tab 1');
    const tab2 = screen.getByText('Tab 2');

    tab1.focus();
    fireEvent.keyDown(tab1, { key: 'ArrowRight' });
    
    // In automatic mode, arrow key also selects
    expect(tab2).toHaveFocus();
    expect(screen.getByText('C2')).toBeInTheDocument();
  });

  it('supports manual activation mode', () => {
    render(
      <Tabs defaultValue="tab1" activationMode="manual">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">C1</TabsContent>
        <TabsContent value="tab2">C2</TabsContent>
      </Tabs>
    );

    const tab1 = screen.getByText('Tab 1');
    const tab2 = screen.getByText('Tab 2');

    tab1.focus();
    fireEvent.keyDown(tab1, { key: 'ArrowRight' });
    
    // Focus changes, but content doesn't update until enter/click
    expect(tab2).toHaveFocus();
    expect(screen.getByText('C1')).toBeInTheDocument();
    expect(screen.queryByText('C2')).not.toBeInTheDocument();

    fireEvent.click(tab2);
    expect(screen.getByText('C2')).toBeInTheDocument();
  });

  it('renders vertically', () => {
    render(
      <Tabs defaultValue="tab1" orientation="vertical" data-testid="tabs">
        <TabsList data-testid="tablist">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">C1</TabsContent>
      </Tabs>
    );
    
    expect(screen.getByTestId('tablist').getAttribute('aria-orientation')).toBe('vertical');
    expect(screen.getByTestId('tabs').className).toContain('flex-row gap-4');
  });
});
