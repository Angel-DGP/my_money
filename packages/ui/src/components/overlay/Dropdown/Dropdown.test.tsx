import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Dropdown } from './Dropdown';

describe('Dropdown', () => {
  it('opens and closes content on trigger click', async () => {
    render(
      <Dropdown.Root>
        <Dropdown.Trigger>Open Menu</Dropdown.Trigger>
        <Dropdown.Content data-testid="content">
          <Dropdown.Item>Item 1</Dropdown.Item>
          <Dropdown.Item>Item 2</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByTestId('content')).toBeInTheDocument();

    // Clicking trigger again should close it
    fireEvent.click(screen.getByText('Open Menu'));
    await waitFor(() => expect(screen.queryByTestId('content')).not.toBeInTheDocument());
  });

  it('closes when clicking an item', async () => {
    render(
      <Dropdown.Root>
        <Dropdown.Trigger>Open Menu</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item data-testid="item">Action</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
    );

    fireEvent.click(screen.getByText('Open Menu'));
    const item = screen.getByTestId('item');
    expect(item).toBeInTheDocument();

    fireEvent.click(item);
    await waitFor(() => expect(screen.queryByTestId('item')).not.toBeInTheDocument());
  });
});
