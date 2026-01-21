import { fireEvent, render, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { act } from 'react-dom/test-utils';
import {
  ReqoreContent,
  ReqoreDropdown,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';
import { IReqoreInputProps } from '../src/components/Input';

beforeAll(() => {
  jest.setTimeout(30000);
});

test('Renders <Dropdown /> properly', () => {
  jest.useFakeTimers();
  act(() => {
    jest.advanceTimersByTime(1);
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                  metadata: {
                    some: 'data',
                  },
                },
                {
                  label: 'How are ya',
                  value: 'howareya',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
                  value: 'disabled',
                  icon: 'StopCircleLine',
                },
              ]}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelector('.reqore-button')!);
  jest.advanceTimersByTime(1);

  expect(document.querySelector('.reqore-button')?.getAttribute('disabled')).toBe(null);
  expect(document.querySelectorAll('.reqore-button').length).toBe(4);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(3);
});

test('Renders disabled <Dropdown /> when items are empty', () => {
  jest.useFakeTimers();
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelector('.reqore-button')!);

  expect(document.querySelector('.reqore-button')?.getAttribute('disabled')).toBe('');
});

test('Renders disabled <Dropdown /> when items are not empty & disabled prop is true', () => {
  jest.useFakeTimers();
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              label='Disabled with items'
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  value: 'howareya',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
                  value: 'disabled',
                  icon: 'StopCircleLine',
                },
              ]}
              disabled
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelector('.reqore-button')?.getAttribute('disabled')).toBe('');
});

test('Renders <Dropdown /> with custom component and custom handler', () => {
  jest.useFakeTimers();
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              component={ReqoreInput}
              handler='focus'
              useTargetWidth
              width={500}
              placeholder='Focus me to see some crazy stuff'
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  value: 'asg',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
                  value: 'hhhhh',
                  icon: 'StopCircleLine',
                },
              ]}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  const component = document.querySelector('.reqore-input');

  if (component) {
    fireEvent.focus(component);
    jest.advanceTimersByTime(1);
  }

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(3);
});

test('Renders <Dropdown /> is opened by default', () => {
  jest.useFakeTimers();
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown<IReqoreInputProps>
              component={ReqoreInput}
              handler='focus'
              isDefaultOpen
              useTargetWidth
              width={500}
              placeholder='Focus me to see some crazy stuff'
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  value: 'asg',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
                  value: 'hhhhh',
                  icon: 'StopCircleLine',
                },
              ]}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(3);
});

test('Renders <Dropdown /> and calls a function on item click, closes the dropdown', () => {
  jest.useFakeTimers();
  const onClick = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                  metadata: {
                    some: 'data',
                  },
                  onClick,
                },
              ]}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  fireEvent.click(document.querySelector('.reqore-button')!);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(1);

  fireEvent.click(document.querySelector('.reqore-menu-item')!);
  expect(onClick).toHaveBeenCalledWith(
    expect.objectContaining({
      selected: true,
      label: 'Hello',
      value: 'hello',
      icon: 'SunCloudyLine',
      metadata: {
        some: 'data',
      },
      onClick,
    }),
    expect.anything()
  );

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Renders filterable <Dropdown /> and filters items correctly', () => {
  jest.useFakeTimers();
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              filterable
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  value: 'howareya',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
                  value: 'disabled',
                  icon: 'StopCircleLine',
                },
                {
                  value: 'onlyvalue',
                  icon: 'StopCircleLine',
                },
              ]}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelector('.reqore-button')!);
  jest.advanceTimersByTime(1);
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'how' },
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(1);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: '' },
  });

  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(4);

  // Search in value only
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'onlyvalue' },
  });

  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(1);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'asfd' },
  });

  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(0);
});

const MultiSelectDropdown = ({ onChange }) => {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  return (
    <ReqoreDropdown
      multiSelect
      onItemSelect={({ value }) => setSelected([...selected, value])}
      items={[
        {
          label: 'Item 1',
          value: 'item-1',
          selected: selected.includes('item-1'),
        },
        {
          label: 'Item 2',
          value: 'item-2',
          selected: selected.includes('item-2'),
        },
      ]}
    />
  );
};

test('Renders <Dropdown /> and updates its items when state changes, does not close dropdown', () => {
  const fn = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <MultiSelectDropdown onChange={fn} />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelector('.reqore-button')!);

  expect(document.querySelectorAll('.reqore-button').length).toBe(3);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(2);

  fireEvent.click(document.querySelectorAll('.reqore-menu-item')[0]);
  expect(fn).toHaveBeenNthCalledWith(2, ['item-1']);

  fireEvent.click(document.querySelectorAll('.reqore-menu-item')[1]);
  expect(fn).toHaveBeenNthCalledWith(3, ['item-1', 'item-2']);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});

test('Renders <Dropdown /> with nested items, closes only on leaf item click', () => {
  jest.useFakeTimers();
  const onItemSelect = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              onItemSelect={onItemSelect}
              items={[
                {
                  label: 'Parent Item',
                  value: 'parent',
                  items: [
                    {
                      label: 'Child Item 1',
                      value: 'child1',
                    },
                    {
                      label: 'Child Item 2',
                      value: 'child2',
                    },
                  ],
                },
                {
                  label: 'Leaf Item',
                  value: 'leaf',
                },
              ]}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  // Open the dropdown
  fireEvent.click(document.querySelector('.reqore-button')!);
  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(2);

  // Click on parent item with sub-items - should NOT close
  fireEvent.click(document.querySelectorAll('.reqore-menu-item')[0]);
  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(2);
  expect(onItemSelect).not.toHaveBeenCalled();

  // Now we should see child items
  expect(document.querySelectorAll('.reqore-menu-item')[0].textContent).toContain('Child Item 1');

  // Click on leaf item - should close
  fireEvent.click(document.querySelectorAll('.reqore-menu-item')[0]);
  jest.advanceTimersByTime(1);

  expect(onItemSelect).toHaveBeenCalledWith(
    expect.objectContaining({
      label: 'Child Item 1',
      value: 'child1',
    }),
    expect.anything()
  );
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Keyboard navigation with arrow keys works end-to-end', () => {
  jest.useFakeTimers();
  const onItemSelect = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              label='Keyboard navigation test'
              onItemSelect={onItemSelect}
              items={[
                {
                  label: 'Item 1',
                  value: 'item1',
                },
                {
                  label: 'Item 2',
                  value: 'item2',
                },
                {
                  label: 'Item 3',
                  value: 'item3',
                },
              ]}
              keyboardNavigation={true}
              filterable={true}
              isDefaultOpen={true}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  const filterInput = document.querySelector('.reqore-input') as HTMLInputElement;
  expect(filterInput).toBeTruthy();

  let menuItems = document.querySelectorAll('.reqore-menu-item');
  expect(menuItems.length).toBe(3);

  // Arrow down to first item
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);

  // Arrow down to second item
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);

  // Arrow up back to first item
  fireEvent.keyDown(filterInput, { key: 'ArrowUp' });
  jest.advanceTimersByTime(1);

  // Test wrapping: arrow up again should go to last item
  fireEvent.keyDown(filterInput, { key: 'ArrowUp' });
  jest.advanceTimersByTime(1);

  // Arrow down from last should go to first
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);

  menuItems = document.querySelectorAll('.reqore-menu-item');
  expect(menuItems.length).toBe(3);
  expect(onItemSelect).not.toHaveBeenCalled(); // Nothing selected yet
});

test('Keyboard navigation with enter key selects the correct item based on navigation', () => {
  jest.useFakeTimers();
  const onItemSelect = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              label='Keyboard enter test'
              onItemSelect={onItemSelect}
              items={[
                {
                  label: 'First Item',
                  value: 'item1',
                },
                {
                  label: 'Second Item',
                  value: 'item2',
                },
                {
                  label: 'Third Item',
                  value: 'item3',
                },
              ]}
              keyboardNavigation={true}
              filterable={true}
              isDefaultOpen={true}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  const filterInput = document.querySelector('.reqore-input') as HTMLInputElement;
  expect(filterInput).toBeTruthy();

  // Navigate to second item and select it
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);

  fireEvent.keyDown(filterInput, { key: 'Enter' });
  jest.advanceTimersByTime(1);

  // Should select Second Item, NOT First Item
  expect(onItemSelect).toHaveBeenCalledWith(
    expect.objectContaining({
      label: 'Second Item',
      value: 'item2',
    }),
    expect.anything()
  );
  expect(onItemSelect).not.toHaveBeenCalledWith(
    expect.objectContaining({
      label: 'First Item',
      value: 'item1',
    }),
    expect.anything()
  );

  // Dropdown should be closed
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Keyboard navigation skips disabled items correctly', () => {
  jest.useFakeTimers();
  const onItemSelect = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              label='Disabled items test'
              onItemSelect={onItemSelect}
              items={[
                {
                  label: 'Enabled 1',
                  value: 'enabled1',
                },
                {
                  label: 'Disabled',
                  value: 'disabled',
                  disabled: true,
                },
                {
                  label: 'Enabled 2',
                  value: 'enabled2',
                },
                {
                  label: 'Also Disabled',
                  value: 'also_disabled',
                  disabled: true,
                },
                {
                  label: 'Enabled 3',
                  value: 'enabled3',
                },
              ]}
              keyboardNavigation={true}
              filterable={true}
              isDefaultOpen={true}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  const filterInput = document.querySelector('.reqore-input') as HTMLInputElement;

  // Navigate down twice - should skip disabled items
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);

  // Press enter - should select Enabled 2, skipping Disabled
  fireEvent.keyDown(filterInput, { key: 'Enter' });
  jest.advanceTimersByTime(1);

  expect(onItemSelect).toHaveBeenCalledWith(
    expect.objectContaining({
      label: 'Enabled 2',
      value: 'enabled2',
    }),
    expect.anything()
  );
  // Should NOT have selected Enabled 1 or any disabled item
  expect(onItemSelect).toHaveBeenCalledTimes(1);
});

test('Keyboard navigation resets focus when filtering changes', () => {
  jest.useFakeTimers();
  const onItemSelect = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              label='Filter keyboard test'
              onItemSelect={onItemSelect}
              items={[
                {
                  label: 'Apple',
                  value: 'apple',
                },
                {
                  label: 'Banana',
                  value: 'banana',
                },
                {
                  label: 'Cherry',
                  value: 'cherry',
                },
                {
                  label: 'Date',
                  value: 'date',
                },
              ]}
              filterable={true}
              keyboardNavigation={true}
              isDefaultOpen={true}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  const filterInput = document.querySelector('.reqore-input') as HTMLInputElement;

  // Navigate down twice to reach Banana
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);

  // Type in filter - this should reset focus
  fireEvent.change(filterInput, { target: { value: 'a' } });
  jest.advanceTimersByTime(1);

  // Now items are filtered to [Apple, Banana, Date]
  // Focus should be reset to null, so first down arrow goes to first item (Apple)
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);

  fireEvent.keyDown(filterInput, { key: 'Enter' });
  jest.advanceTimersByTime(1);

  // Should select Apple (first item in filtered list), not Banana
  expect(onItemSelect).toHaveBeenCalledWith(
    expect.objectContaining({
      label: 'Apple',
      value: 'apple',
    }),
    expect.anything()
  );
});

test('Keyboard navigation with submenu - arrow right opens submenu', () => {
  jest.useFakeTimers();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              label='Submenu test'
              items={[
                {
                  label: 'Parent with children',
                  value: 'parent',
                  items: [
                    {
                      label: 'Child 1',
                      value: 'child1',
                    },
                    {
                      label: 'Child 2',
                      value: 'child2',
                    },
                  ],
                },
                {
                  label: 'Leaf Item',
                  value: 'leaf',
                },
              ]}
              keyboardNavigation={true}
              filterable={true}
              isDefaultOpen={true}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  const filterInput = document.querySelector('.reqore-input') as HTMLInputElement;

  // Initially should see parent items
  let menuItems = document.querySelectorAll('.reqore-menu-item');
  expect(menuItems.length).toBe(2);

  // Navigate to first item (Parent) and press right arrow
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);
  fireEvent.keyDown(filterInput, { key: 'ArrowRight' });
  jest.advanceTimersByTime(1);

  // Now should see child items
  menuItems = document.querySelectorAll('.reqore-menu-item');
  expect(menuItems.length).toBe(2); // Two children
  expect(menuItems[0].textContent).toContain('Child');
  expect(menuItems[1].textContent).toContain('Child');

  // Back button should exist
  const backButton = document.querySelector('.reqore-dropdown-back-button');
  expect(backButton).toBeTruthy();
});

test('Keyboard navigation with submenu - arrow left navigates back', () => {
  jest.useFakeTimers();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              label='Back navigation test'
              items={[
                {
                  label: 'Parent Item',
                  value: 'parent',
                  items: [
                    {
                      label: 'Child Item 1',
                      value: 'child1',
                    },
                    {
                      label: 'Child Item 2',
                      value: 'child2',
                    },
                  ],
                },
              ]}
              keyboardNavigation={true}
              filterable={true}
              isDefaultOpen={true}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  const filterInput = document.querySelector('.reqore-input') as HTMLInputElement;

  // Open submenu
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);
  fireEvent.keyDown(filterInput, { key: 'ArrowRight' });
  jest.advanceTimersByTime(1);

  // Should now show children
  let menuItems = document.querySelectorAll('.reqore-menu-item');
  expect(menuItems.length).toBe(2);
  expect(menuItems[0].textContent).toContain('Child');

  // Press left arrow to go back
  fireEvent.keyDown(filterInput, { key: 'ArrowLeft' });
  jest.advanceTimersByTime(1);

  // Should be back at parent level
  menuItems = document.querySelectorAll('.reqore-menu-item');
  expect(menuItems[0].textContent).toContain('Parent Item');

  // Back button should be gone
  expect(document.querySelector('.reqore-dropdown-back-button')).toBeFalsy();
});

test('Auto-enter submenu resets after dropdown close', async () => {
  jest.useRealTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreDropdown
            items={[
              {
                label: 'Parent',
                value: 'parent',
                items: [
                  { label: 'Child 1', value: 'child1' },
                  { label: 'Child 2', value: 'child2' },
                ],
              },
            ]}
            isDefaultOpen
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // Auto-enter shows children
  await waitFor(() => expect(document.querySelectorAll('.reqore-menu-item').length).toBe(2));

  // Close dropdown
  fireEvent.click(document.querySelector('.reqore-button')!);
  await waitFor(() => expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0));

  // Reopen and auto-enter again
  fireEvent.click(document.querySelector('.reqore-button')!);
  await waitFor(() => expect(document.querySelectorAll('.reqore-menu-item').length).toBe(2));
});

test('Keyboard navigation can be disabled completely', () => {
  jest.useFakeTimers();
  const onItemSelect = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              label='Keyboard nav disabled test'
              onItemSelect={onItemSelect}
              items={[
                {
                  label: 'Item 1',
                  value: 'item1',
                },
                {
                  label: 'Item 2',
                  value: 'item2',
                },
              ]}
              keyboardNavigation={false}
              filterable={true}
              isDefaultOpen={true}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  const filterInput = document.querySelector('.reqore-input') as HTMLInputElement;
  expect(filterInput).toBeTruthy();

  // Try arrow down - should do nothing with keyboard nav disabled
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);

  // Try enter - should not select anything
  fireEvent.keyDown(filterInput, { key: 'Enter' });
  jest.advanceTimersByTime(1);

  expect(onItemSelect).not.toHaveBeenCalled();

  // Menu should still be open
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});

test('Auto-selected parent item - clicking subitem selects subitem not parent', async () => {
  jest.useRealTimers();
  const onItemSelect = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreDropdown
            items={[
              {
                label: 'Parent (auto-selected)',
                value: 'parent',
                items: [
                  { label: 'Subitem 1', value: 'subitem1' },
                  { label: 'Subitem 2', value: 'subitem2' },
                ],
              },
            ]}
            onItemSelect={onItemSelect}
            isDefaultOpen
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // Auto-select should show subitems
  await waitFor(() => expect(document.querySelectorAll('.reqore-menu-item').length).toBe(2));

  // Click on first subitem
  const subitems = document.querySelectorAll('.reqore-menu-item');
  fireEvent.click(subitems[0]);

  // Should have selected Subitem 1, not Parent
  await waitFor(() =>
    expect(onItemSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Subitem 1',
        value: 'subitem1',
      }),
      expect.anything()
    )
  );

  // Should NOT have selected the parent
  expect(onItemSelect).not.toHaveBeenCalledWith(
    expect.objectContaining({
      label: 'Parent (auto-selected)',
      value: 'parent',
    }),
    expect.anything()
  );
});

test('Keyboard navigation skips disabled items and empty-items items', () => {
  jest.useFakeTimers();
  const onItemSelect = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              label='Mixed items test'
              onItemSelect={onItemSelect}
              items={[
                { label: 'Item 1', value: 'item1' },
                { label: 'Disabled Item', value: 'disabled', disabled: true },
                { label: 'Item with empty items', value: 'empty', items: [] },
                { label: 'Item 2', value: 'item2' },
              ]}
              keyboardNavigation={true}
              filterable={true}
              isDefaultOpen={true}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  const filterInput = document.querySelector('.reqore-input') as HTMLInputElement;
  expect(filterInput).toBeTruthy();

  // Check initial state - should show 4 items (all visible, including disabled)
  let menuItems = document.querySelectorAll('.reqore-menu-item');
  expect(menuItems.length).toBe(4);

  // Press down once - should select Item 1
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);

  // Press down twice - should skip Disabled and Empty items, select Item 2
  fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
  jest.advanceTimersByTime(1);

  fireEvent.keyDown(filterInput, { key: 'Enter' });
  jest.advanceTimersByTime(1);

  // Should have selected Item 2, NOT disabled or empty items
  expect(onItemSelect).toHaveBeenCalledWith(
    expect.objectContaining({
      label: 'Item 2',
      value: 'item2',
    }),
    expect.anything()
  );

  // Verify it was not called with disabled or empty items
  expect(onItemSelect).not.toHaveBeenCalledWith(
    expect.objectContaining({
      label: 'Disabled Item',
      value: 'disabled',
    }),
    expect.anything()
  );

  expect(onItemSelect).not.toHaveBeenCalledWith(
    expect.objectContaining({
      label: 'Item with empty items',
      value: 'empty',
    }),
    expect.anything()
  );
});
