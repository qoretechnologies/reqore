import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ReqoreMultiSelect, ReqoreUIProvider } from '../src';
import { MultiSelectItems } from '../src/mock/multiSelect';

beforeAll(() => {
  jest.setTimeout(30000);
  jest.useFakeTimers();
});

test('Renders empty <ReqoreMultiSelect />', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMultiSelect items={MultiSelectItems} />
      </ReqoreUIProvider>
    );
  });

  jest.advanceTimersByTime(1);

  expect(screen.getByText('No items selected')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-input')?.length).toBe(1);
  expect(document.querySelector('.reqore-input')?.getAttribute('disabled')).toBe(null);
  // Because input is clearable
  expect(document.querySelectorAll('.reqore-button').length).toBe(1);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
  // No items tag
  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
});

test('Renders <ReqoreMultiSelect /> with default value', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMultiSelect
          items={MultiSelectItems}
          value={['Existing item 1', 'Existing item 2']}
        />
      </ReqoreUIProvider>
    );
  });

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-tag').length).toBe(2);
  expect(screen.getByText('Existing item 1')).toBeTruthy();
  expect(screen.getByText('Existing item 2')).toBeTruthy();
});

test('Renders <ReqoreMultiSelect /> with default value, items can be removed', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMultiSelect
          items={MultiSelectItems}
          value={['Existing item 1', 'Existing item 2']}
          canRemoveItems
        />
      </ReqoreUIProvider>
    );
  });

  jest.advanceTimersByTime(1);

  fireEvent.click(document.querySelectorAll('.reqore-tag-remove')[0]!);

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getByText('Existing item 2')).toBeTruthy();
});

test('Renders disabled <ReqoreMultiSelect /> when items are empty and items CANNOT be created', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMultiSelect />
      </ReqoreUIProvider>
    );
  });

  fireEvent.focus(document.querySelector('.reqore-input')!);

  expect(document.querySelector('.reqore-input')?.getAttribute('disabled')).toBe('');
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Renders empty <ReqoreMultiSelect /> when items are empty and items CAN be created', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMultiSelect canCreateItems />
      </ReqoreUIProvider>
    );
  });

  fireEvent.focus(document.querySelector('.reqore-input')!);

  jest.advanceTimersByTime(1);

  expect(document.querySelector('.reqore-input')?.getAttribute('disabled')).toBe(null);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(screen.getAllByText('No items exist')).toBeTruthy();
});

test('Renders <ReqoreMultiSelect /> and selects / deselects items from the list', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMultiSelect items={MultiSelectItems} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.focus(document.querySelector('.reqore-input')!);

  jest.advanceTimersByTime(1);

  fireEvent.click(screen.getAllByText('Existing item 3')[1]);

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getAllByText('Existing item 3')).toBeTruthy();
  // Keeps the list open
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.click(screen.getAllByText('Disabled item')[1]);

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);

  // Deselect an item from the list
  fireEvent.click(screen.getAllByText('Existing item 3')[1]);
  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getAllByText('No items selected')).toBeTruthy();
});

test('Renders <ReqoreMultiSelect /> and items can be searched, opens up the list', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMultiSelect items={MultiSelectItems} />
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item' },
  });

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  // 4 items + 1 button for clearable input
  expect(document.querySelectorAll('.reqore-button').length).toBe(5);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Nothing' },
  });

  expect(document.querySelectorAll('.reqore-button').length).toBe(2);
  expect(screen.getAllByText('No existing items found')).toBeTruthy();
});

test('Renders <ReqoreMultiSelect /> and items can be searched and created, opens up the list', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMultiSelect items={MultiSelectItems} canCreateItems />
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item 1' },
  });

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  // 4 items + 1 button for clearable input
  expect(document.querySelectorAll('.reqore-button').length).toBe(2);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item' },
  });

  expect(document.querySelectorAll('.reqore-button').length).toBe(6);
  expect(screen.getAllByText('Create new "Existing item"')).toBeTruthy();

  // This has to fail because we do not allow creating items with ENTER key
  fireEvent.keyDown(document.querySelector('.reqore-input')!, {
    key: 'Enter',
  });

  expect(screen.getByText('No items selected')).toBeTruthy();

  // Create the item by clicking
  fireEvent.click(screen.getAllByText('Create new "Existing item"')[1]);

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getAllByText('Existing item')).toBeTruthy();

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item' },
  });

  // 6 again because the item is already created, so the Create button is not there
  expect(document.querySelectorAll('.reqore-button').length).toBe(6);
});

test('Renders <ReqoreMultiSelect /> and items can be searched and created using the ENTER key, opens up the list', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMultiSelect items={MultiSelectItems} canCreateItems enterKeySelects />
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item 1' },
  });

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  // 4 items + 1 button for clearable input
  expect(document.querySelectorAll('.reqore-button').length).toBe(2);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item' },
  });

  expect(document.querySelectorAll('.reqore-button').length).toBe(6);
  expect(screen.getAllByText('Create new "Existing item"')).toBeTruthy();

  // Create the item by pressing ENTER key
  fireEvent.keyDown(document.querySelector('.reqore-input')!, {
    key: 'Enter',
  });

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getAllByText('Existing item')).toBeTruthy();

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item' },
  });

  // 6 again because the item is already created, so the Create button is not there
  expect(document.querySelectorAll('.reqore-button').length).toBe(6);
});

test('Renders <ReqoreMultiSelect /> and deselects an item using the ENTER key', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMultiSelect
          items={MultiSelectItems}
          canCreateItems
          enterKeySelects
          value={['Existing item 3']}
        />
      </ReqoreUIProvider>
    );
  });

  // The item is already selected
  expect(screen.getAllByText('Existing item 3')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item 3' },
  });

  jest.advanceTimersByTime(1);

  // Deselect the item by pressing ENTER key
  fireEvent.keyDown(document.querySelector('.reqore-input')!, {
    key: 'Enter',
  });

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getAllByText('No items selected')).toBeTruthy();
});

test('Renders <ReqoreMultiSelect /> and calls onValueChange when value changes', () => {
  const onValueChange = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMultiSelect
          items={MultiSelectItems}
          canCreateItems
          enterKeySelects
          onValueChange={onValueChange}
          value={['Existing item 3']}
        />
      </ReqoreUIProvider>
    );
  });

  // The item is already selected
  expect(screen.getAllByText('Existing item 3')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item 3' },
  });

  jest.advanceTimersByTime(1);

  // Deselect the item by pressing ENTER key
  fireEvent.keyDown(document.querySelector('.reqore-input')!, {
    key: 'Enter',
  });

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getAllByText('No items selected')).toBeTruthy();
  expect(onValueChange).toHaveBeenNthCalledWith(1, []);

  fireEvent.click(screen.getAllByText('Existing item 1')[1]);

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getAllByText('Existing item 1')).toBeTruthy();
  expect(onValueChange).toHaveBeenNthCalledWith(2, ['Existing item 1']);
});

test('Renders <ReqoreMultiSelect /> and calls onItemClick when an item is clicked', () => {
  const onItemClick = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMultiSelect
          items={MultiSelectItems}
          canCreateItems
          enterKeySelects
          onItemClick={onItemClick}
          value={['Existing item 3', 'Disabled item']}
        />
      </ReqoreUIProvider>
    );
  });

  // The item is already selected
  fireEvent.click(screen.getByText('Existing item 3'));

  expect(onItemClick).toHaveBeenNthCalledWith(
    1,
    MultiSelectItems.find((item) => item.value === 'Existing item 3')
  );

  fireEvent.click(screen.getByText('Disabled item'));

  expect(onItemClick).toHaveBeenCalledTimes(1);
});
