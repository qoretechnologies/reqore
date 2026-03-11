import { fireEvent, render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreSegmentedControl,
  ReqoreUIProvider,
} from '../src';

const defaultItems = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

const renderControl = (props = {}) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSegmentedControl items={defaultItems} value='day' {...props} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('Renders <SegmentedControl /> with correct number of items', () => {
  renderControl();

  expect(document.querySelectorAll('.reqore-segmented-control').length).toBe(1);
  expect(document.querySelectorAll('.reqore-segmented-control-item').length).toBe(4);
});

test('Renders nothing when items array is empty', () => {
  renderControl({ items: [] });

  expect(document.querySelectorAll('.reqore-segmented-control').length).toBe(0);
});

test('Has correct ARIA attributes', () => {
  renderControl();

  const container = document.querySelector('.reqore-segmented-control')!;
  expect(container.getAttribute('role')).toBe('radiogroup');

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  items.forEach((item) => {
    expect(item.getAttribute('role')).toBe('radio');
  });

  // First item is selected
  expect(items[0].getAttribute('aria-checked')).toBe('true');
  expect(items[1].getAttribute('aria-checked')).toBe('false');
});

test('All enabled items are focusable', () => {
  renderControl();

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  items.forEach((item) => {
    expect(item.getAttribute('tabindex')).toBe('0');
  });
});

test('Calls onChange when clicking an item', () => {
  const onChange = jest.fn();
  renderControl({ onChange });

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  fireEvent.click(items[2]); // Click "Month"
  expect(onChange).toHaveBeenCalledWith('month');
});

test('Does not call onChange when disabled', () => {
  const onChange = jest.fn();
  renderControl({ onChange, disabled: true });

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  fireEvent.click(items[2]);
  expect(onChange).not.toHaveBeenCalled();
});

test('Does not call onChange when readOnly', () => {
  const onChange = jest.fn();
  renderControl({ onChange, readOnly: true });

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  fireEvent.click(items[2]);
  expect(onChange).not.toHaveBeenCalled();
});

test('Skips disabled items in keyboard navigation', () => {
  const onChange = jest.fn();
  renderControl({
    onChange,
    items: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' },
    ],
    value: 'a',
  });

  const container = document.querySelector('.reqore-segmented-control')!;
  fireEvent.keyDown(container, { key: 'ArrowRight' });
  // Should skip 'b' (disabled) and select 'c'
  expect(onChange).toHaveBeenCalledWith('c');
});

test('Keyboard ArrowRight wraps to first item', () => {
  const onChange = jest.fn();
  renderControl({ onChange, value: 'year' });

  const container = document.querySelector('.reqore-segmented-control')!;
  fireEvent.keyDown(container, { key: 'ArrowRight' });
  expect(onChange).toHaveBeenCalledWith('day');
});

test('Keyboard ArrowLeft wraps to last item', () => {
  const onChange = jest.fn();
  renderControl({ onChange, value: 'day' });

  const container = document.querySelector('.reqore-segmented-control')!;
  fireEvent.keyDown(container, { key: 'ArrowLeft' });
  expect(onChange).toHaveBeenCalledWith('year');
});

test('Keyboard Home selects first enabled item', () => {
  const onChange = jest.fn();
  renderControl({ onChange, value: 'month' });

  const container = document.querySelector('.reqore-segmented-control')!;
  fireEvent.keyDown(container, { key: 'Home' });
  expect(onChange).toHaveBeenCalledWith('day');
});

test('Keyboard End selects last enabled item', () => {
  const onChange = jest.fn();
  renderControl({ onChange, value: 'day' });

  const container = document.querySelector('.reqore-segmented-control')!;
  fireEvent.keyDown(container, { key: 'End' });
  expect(onChange).toHaveBeenCalledWith('year');
});

test('allowDeselect clears value when clicking active item', () => {
  const onChange = jest.fn();
  renderControl({ onChange, value: 'day', allowDeselect: true });

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  fireEvent.click(items[0]); // Click currently selected "Day"
  expect(onChange).toHaveBeenCalledWith(undefined);
});

test('Renders with different sizes', () => {
  renderControl({ size: 'small' });
  expect(document.querySelectorAll('.reqore-segmented-control').length).toBe(1);
});

test('Renders with intent', () => {
  renderControl({ intent: 'success' });
  expect(document.querySelectorAll('.reqore-segmented-control').length).toBe(1);
});

test('Renders with pill shape', () => {
  renderControl({ pill: true });
  expect(document.querySelectorAll('.reqore-segmented-control').length).toBe(1);
});

test('Per-item disabled prevents clicking that item', () => {
  const onChange = jest.fn();
  renderControl({
    onChange,
    items: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' },
    ],
    value: 'a',
  });

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  fireEvent.click(items[1]); // Click disabled "B"
  expect(onChange).not.toHaveBeenCalled();
});

test('Selects first item by default when no value or defaultValue provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSegmentedControl items={defaultItems} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  expect(items[0].getAttribute('aria-checked')).toBe('true');
});

test('Shows "More" dropdown when items overflow container width', () => {
  renderControl({
    _testWidth: 150,
    items: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year' },
    ],
    value: 'day',
  });

  // Should have a "More" button
  expect(document.querySelectorAll('.reqore-segmented-control-more').length).toBe(1);
  // Should have fewer visible items than total
  const visibleItems = document.querySelectorAll('.reqore-segmented-control-item');
  expect(visibleItems.length).toBeLessThan(4);
});

test('Shows selected item label in "More" button when active item is hidden', () => {
  renderControl({
    _testWidth: 150,
    items: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year' },
    ],
    value: 'year', // This item will be hidden in the "More" group
  });

  const moreButton = document.querySelector('.reqore-segmented-control-more');
  expect(moreButton).toBeTruthy();
  // The "More" button should display the hidden selected item's label
  expect(moreButton!.textContent).toContain('Year');
});
