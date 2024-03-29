import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ReqoreMultiSelect, ReqoreUIProvider } from '../src';
import { IReqoreMultiSelectProps } from '../src/components/MultiSelect';
import { MultiSelectItems } from '../src/mock/multiSelect';

beforeAll(() => {
  jest.setTimeout(30000);
  jest.useFakeTimers();
});

const MultiSelectItemsTestComponent = ({
  onValueChange,
  value,
  ...rest
}: Partial<IReqoreMultiSelectProps>) => {
  const [selected, setSelected] = React.useState<string[] | undefined>(value);

  return (
    <ReqoreUIProvider>
      <ReqoreMultiSelect
        {...rest}
        value={selected}
        onValueChange={(value) => {
          setSelected(value);
          onValueChange?.(value);
        }}
      />
    </ReqoreUIProvider>
  );
};

test('Renders empty <ReqoreMultiSelect />', () => {
  act(() => {
    render(<MultiSelectItemsTestComponent items={MultiSelectItems} />);
  });

  jest.advanceTimersByTime(1);

  expect(screen.getByText('No items selected')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-input')?.length).toBe(1);
  expect(document.querySelector('.reqore-input')?.getAttribute('disabled')).toBe(null);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
  // No items tag
  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
});

test('Renders <ReqoreMultiSelect /> with default value', () => {
  act(() => {
    render(
      <MultiSelectItemsTestComponent
        items={MultiSelectItems}
        value={['Existing item 1', 'Existing item 3']}
      />
    );
  });

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-tag').length).toBe(2);
  expect(screen.getByText('Existing item 1')).toBeTruthy();
  expect(screen.getByText('Existing item 3')).toBeTruthy();
});

test('Renders <ReqoreMultiSelect /> with default value, items can be removed', () => {
  act(() => {
    render(
      <MultiSelectItemsTestComponent
        items={MultiSelectItems}
        value={['Existing item 1', 'Existing item 3']}
        canRemoveItems
      />
    );
  });

  jest.advanceTimersByTime(1);

  fireEvent.click(document.querySelectorAll('.reqore-tag-remove')[0]!);

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getByText('Existing item 3')).toBeTruthy();
});

test('Renders disabled <ReqoreMultiSelect /> when items are empty and items CANNOT be created', () => {
  act(() => {
    render(<MultiSelectItemsTestComponent />);
  });

  fireEvent.focus(document.querySelector('.reqore-input')!);

  expect(document.querySelector('.reqore-input')?.getAttribute('disabled')).toBe('');
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Renders empty <ReqoreMultiSelect /> when items are empty and items CAN be created', () => {
  act(() => {
    render(<MultiSelectItemsTestComponent canCreateItems />);
  });

  fireEvent.focus(document.querySelector('.reqore-input')!);

  jest.advanceTimersByTime(1);

  expect(document.querySelector('.reqore-input')?.getAttribute('disabled')).toBe(null);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(screen.getAllByText('No items exist')).toBeTruthy();
});

test('Renders <ReqoreMultiSelect /> and selects / deselects items from the list', () => {
  act(() => {
    render(<MultiSelectItemsTestComponent items={MultiSelectItems} />);
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
    render(<MultiSelectItemsTestComponent items={MultiSelectItems} />);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item' },
  });

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  // 4 items + 1 button for clearable input
  expect(document.querySelectorAll('.reqore-button').length).toBe(4);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Nothing' },
  });

  expect(document.querySelectorAll('.reqore-button').length).toBe(1);
  expect(screen.getAllByText('No existing items found')).toBeTruthy();
});

test('Renders <ReqoreMultiSelect /> and items can be searched and created, opens up the list', () => {
  act(() => {
    render(<MultiSelectItemsTestComponent items={MultiSelectItems} canCreateItems />);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item 1' },
  });

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  // 4 items + 1 button for clearable input
  expect(document.querySelectorAll('.reqore-button').length).toBe(1);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item' },
  });

  expect(document.querySelectorAll('.reqore-button').length).toBe(5);
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
  expect(document.querySelectorAll('.reqore-button').length).toBe(5);
});

test('Renders <ReqoreMultiSelect /> and items can be searched and created using the ENTER key, opens up the list', () => {
  act(() => {
    render(
      <MultiSelectItemsTestComponent items={MultiSelectItems} canCreateItems enterKeySelects />
    );
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item 1' },
  });

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  // 4 items + 1 button for clearable input
  expect(document.querySelectorAll('.reqore-button').length).toBe(1);

  fireEvent.focus(document.querySelector('.reqore-input')!);
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item' },
  });

  expect(document.querySelectorAll('.reqore-button').length).toBe(5);
  expect(screen.getAllByText('Create new "Existing item"')).toBeTruthy();

  // Create the item by pressing ENTER key
  fireEvent.keyDown(document.querySelector('.reqore-input')!, {
    key: 'Enter',
  });

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getAllByText('Existing item')).toBeTruthy();

  fireEvent.focus(document.querySelector('.reqore-input')!);
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item' },
  });

  // 6 again because the item is already created, so the Create button is not there
  expect(document.querySelectorAll('.reqore-button').length).toBe(5);

  fireEvent.focus(document.querySelector('.reqore-input')!);
  // Does not create new item if the query is empty
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: '' },
  });

  fireEvent.keyDown(document.querySelector('.reqore-input')!, {
    key: 'Enter',
  });

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
});

test('Renders <ReqoreMultiSelect /> and does not create new item on ENTER when not focused', () => {
  act(() => {
    render(
      <MultiSelectItemsTestComponent items={MultiSelectItems} canCreateItems enterKeySelects />
    );
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.focus(document.querySelector('.reqore-input')!);
  // Add some text
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'New item' },
  });

  // Blur the input
  fireEvent.blur(document.querySelector('.reqore-input')!);

  jest.advanceTimersByTime(1);

  // Try and create the item by pressing ENTER key
  fireEvent.keyDown(document.querySelector('.reqore-input')!, {
    key: 'Enter',
  });

  expect(screen.getByText('No items selected')).toBeTruthy();
});

test('Renders <ReqoreMultiSelect /> and deselects an item using the ENTER key', () => {
  act(() => {
    render(
      <MultiSelectItemsTestComponent
        items={MultiSelectItems}
        canCreateItems
        enterKeySelects
        value={['Existing item 3']}
      />
    );
  });

  // The item is already selected
  expect(screen.getAllByText('Existing item 3')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.focus(document.querySelector('.reqore-input')!);
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
      <MultiSelectItemsTestComponent
        items={MultiSelectItems}
        canCreateItems
        enterKeySelects
        onValueChange={onValueChange}
        value={['Existing item 3']}
      />
    );
  });

  // The item is already selected
  expect(screen.getAllByText('Existing item 3')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.focus(document.querySelector('.reqore-input')!);
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
      <MultiSelectItemsTestComponent
        items={MultiSelectItems}
        canCreateItems
        enterKeySelects
        onItemClick={onItemClick}
        value={['Existing item 3', 'Disabled item']}
      />
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

test('Renders <ReqoreMultiSelect /> and calls onItemAdded when an item is added', () => {
  const onItemAdd = jest.fn();

  act(() => {
    render(
      <MultiSelectItemsTestComponent
        items={MultiSelectItems}
        canCreateItems
        enterKeySelects
        onItemAdded={onItemAdd}
      />
    );
  });

  const item = MultiSelectItems.find((item) => item.value === 'Existing item 3');

  fireEvent.focus(document.querySelector('.reqore-input')!);
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item 3' },
  });

  jest.advanceTimersByTime(1);

  // Select the item by pressing ENTER key
  fireEvent.keyDown(document.querySelector('.reqore-input')!, {
    key: 'Enter',
  });

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(onItemAdd).toHaveBeenNthCalledWith(1, item!.value);

  // Add completely new item
  fireEvent.focus(document.querySelector('.reqore-input')!);
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Some new item' },
  });

  jest.advanceTimersByTime(1);

  // Create the item by clicking
  fireEvent.click(screen.getAllByText('Create new "Some new item"')[1]);

  expect(document.querySelectorAll('.reqore-tag').length).toBe(2);
  expect(onItemAdd).toHaveBeenNthCalledWith(2, 'Some new item');
});

test('Renders <ReqoreMultiSelect /> and calls onItemRemoved when an item is removed', () => {
  const onItemRemove = jest.fn();

  act(() => {
    render(
      <MultiSelectItemsTestComponent
        items={MultiSelectItems}
        canCreateItems
        enterKeySelects
        canRemoveItems
        onItemRemoved={onItemRemove}
        value={['Existing item 3']}
      />
    );
  });

  const item = MultiSelectItems.find((item) => item.value === 'Existing item 3');

  fireEvent.click(document.querySelectorAll('.reqore-tag-remove')[0]!);

  expect(onItemRemove).toHaveBeenNthCalledWith(1, item!.value);
});
