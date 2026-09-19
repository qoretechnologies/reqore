/**
 * An option that is PRESENT but cannot be CHOSEN — and can still be read.
 *
 * `disabled` removes an item from interaction entirely: reqore renders it with
 * `pointer-events: none`, which also kills its tooltip and any control on the row.
 * That makes it the wrong tool for "you cannot pick this, and here is why",
 * because disabling the option destroys the explanation.
 *
 * `readOnly` is reqore's word for the other state: the row keeps its pointer
 * events and is only marked `cursor: not-allowed`, so its tooltip, description,
 * badge and row actions all still answer — and it is not a choice. These tests
 * measure that difference rather than trusting the props, and cover the two
 * pickers that make a choice out of a list of items.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ReqoreMultiSelect, ReqoreRadioGroup, ReqoreUIProvider } from '../src';
import { IReqoreMultiSelectProps } from '../src/components/MultiSelect';
import { TReqoreSelectItem } from '../src/components/Select';

beforeAll(() => {
  vi.setConfig({ testTimeout: 30000 });
  vi.useFakeTimers();
});

const items: TReqoreSelectItem[] = [
  { label: 'Choosable', value: 'Choosable' },
  {
    label: 'Not licensed',
    value: 'Not licensed',
    readOnly: true,
    tooltip: 'Needs the Enterprise licence',
    description: 'Needs the Enterprise licence',
  },
  {
    label: 'Turned off',
    value: 'Turned off',
    disabled: true,
    tooltip: 'You will never read this',
  },
  { label: 'Also choosable', value: 'Also choosable' },
];

const SelectTestComponent = ({
  onValueChange,
  value,
  ...rest
}: Partial<IReqoreMultiSelectProps>) => {
  const [selected, setSelected] = React.useState<string[] | undefined>(value);

  return (
    <ReqoreUIProvider>
      <ReqoreMultiSelect
        items={items}
        {...rest}
        value={selected}
        onValueChange={(newValue) => {
          setSelected(newValue);
          onValueChange?.(newValue);
        }}
      />
    </ReqoreUIProvider>
  );
};

/** The rendered row for a label, as the menu item element the styles land on. */
const rowFor = (label: string): HTMLElement =>
  screen.getAllByText(label).at(-1)!.closest('.reqore-menu-item') as HTMLElement;

const openList = () => {
  fireEvent.focus(document.querySelector('.reqore-input')!);
  vi.advanceTimersByTime(1);
};

test('A read-only row keeps the pointer events a disabled one loses', () => {
  act(() => {
    render(<SelectTestComponent />);
  });

  openList();

  const readOnlyStyle = getComputedStyle(rowFor('Not licensed'));
  const disabledStyle = getComputedStyle(rowFor('Turned off'));
  const choosableStyle = getComputedStyle(rowFor('Choosable'));

  // The whole point: the row is still there to be hovered, read and pressed on,
  // and it is only the CHOOSING that is refused.
  expect(readOnlyStyle.pointerEvents).toBe('auto');
  expect(readOnlyStyle.cursor).toBe('not-allowed');
  expect(readOnlyStyle.opacity).toBe('1');

  // Disabled is the state that takes all of that away.
  expect(disabledStyle.pointerEvents).toBe('none');
  expect(disabledStyle.cursor).toBe('not-allowed');
  expect(disabledStyle.opacity).toBe('0.4');

  // And a row that CAN be chosen still says so.
  expect(choosableStyle.cursor).toBe('pointer');
  expect(choosableStyle.pointerEvents).toBe('auto');
});

test('Clicking a read-only row selects nothing', () => {
  const onValueChange = vi.fn();

  act(() => {
    render(<SelectTestComponent onValueChange={onValueChange} />);
  });

  openList();

  fireEvent.click(screen.getAllByText('Not licensed').at(-1)!);

  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByText('No items selected')).toBeTruthy();

  // The row next to it is unaffected — the refusal is per item, not a dead list.
  fireEvent.click(screen.getAllByText('Choosable').at(-1)!);

  expect(onValueChange).toHaveBeenNthCalledWith(1, ['Choosable']);
});

test("A read-only row's own onClick does not fire either", () => {
  const onItemClick = vi.fn();

  act(() => {
    render(
      <SelectTestComponent
        items={[{ label: 'Not licensed', value: 'Not licensed', readOnly: true, onClick: onItemClick }]}
      />
    );
  });

  openList();

  fireEvent.click(screen.getAllByText('Not licensed').at(-1)!);

  expect(onItemClick).not.toHaveBeenCalled();
});

test('A read-only row can still be read: its tooltip opens on hover', () => {
  act(() => {
    render(<SelectTestComponent />);
  });

  openList();

  // The list itself is a popover, so the tooltip is the SECOND one.
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.mouseEnter(rowFor('Not licensed'));
  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(2);
  expect(screen.getAllByText('Needs the Enterprise licence').length).toBeGreaterThan(1);
});

test("A read-only row's action still answers, so the reason can carry a control", () => {
  const onActionClick = vi.fn();

  act(() => {
    render(
      <SelectTestComponent
        items={[
          {
            label: 'Not licensed',
            value: 'Not licensed',
            readOnly: true,
            rightAction: { icon: 'QuestionLine', onClick: onActionClick },
          },
        ]}
      />
    );
  });

  openList();

  fireEvent.click(document.querySelector('.reqore-menu-item-right-action')!);

  expect(onActionClick).toHaveBeenCalledTimes(1);
});

test('Keyboard navigation walks past a read-only row', () => {
  const onValueChange = vi.fn();

  act(() => {
    render(<SelectTestComponent onValueChange={onValueChange} />);
  });

  openList();

  // Down once lands on the first choosable row, down again SKIPS both the
  // read-only and the disabled row and lands on the last one.
  fireEvent.keyDown(document, { key: 'ArrowDown' });
  fireEvent.keyDown(document, { key: 'ArrowDown' });
  fireEvent.keyDown(document, { key: 'Enter' });

  expect(onValueChange).toHaveBeenNthCalledWith(1, ['Also choosable']);
});

test("The chip for a read-only value reads as one, and does not publish `readonly` to the DOM", () => {
  act(() => {
    render(<SelectTestComponent value={['Not licensed']} canRemoveItems />);
  });

  vi.advanceTimersByTime(1);

  const tag = document.querySelector('.reqore-tag')!;

  // `readOnly` is a real DOM attribute name, so an unconsumed prop would be
  // written onto the span as `readonly=""` — item data published as markup.
  expect(tag.hasAttribute('readonly')).toBe(false);

  const style = getComputedStyle(tag);

  expect(style.cursor).toBe('not-allowed');
  expect(style.pointerEvents).toBe('auto');

  // Still removable: not being choosable is not the same as being stuck.
  expect(document.querySelector('.reqore-tag-remove')).toBeTruthy();
});

test("Reqore's own placeholder row no longer selects an empty value", () => {
  const onValueChange = vi.fn();

  act(() => {
    render(<SelectTestComponent canCreateItems onValueChange={onValueChange} />);
  });

  // A query nothing matches: the list falls back to the read-only "nothing found"
  // row, which is not an item and must never become the value.
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'nothing matches this' },
  });

  vi.advanceTimersByTime(1);

  fireEvent.click(screen.getAllByText('No existing items found').at(-1)!);

  expect(onValueChange).not.toHaveBeenCalled();
});

test('A read-only row that has a submenu is still opened, because that is not a choice', () => {
  const onValueChange = vi.fn();

  act(() => {
    render(
      <SelectTestComponent
        onValueChange={onValueChange}
        items={[
          {
            label: 'Group',
            readOnly: true,
            items: [{ label: 'Inside', value: 'Inside' }],
          },
        ]}
      />
    );
  });

  openList();

  // One item with a submenu opens on its own, so the child is already on screen.
  expect(screen.getAllByText('Inside').length).toBeGreaterThan(0);

  fireEvent.click(screen.getAllByText('Inside').at(-1)!);

  expect(onValueChange).toHaveBeenNthCalledWith(1, ['Inside']);
});

test('A read-only radio option is readable and not selectable', () => {
  const onSelectClick = vi.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreRadioGroup
          onSelectClick={onSelectClick}
          items={[
            { label: 'Pick me', value: 'pick' },
            { label: 'Not licensed', value: 'locked', readOnly: true },
          ]}
        />
      </ReqoreUIProvider>
    );
  });

  vi.advanceTimersByTime(1);

  const option = screen.getByText('Not licensed').closest('.reqore-checkbox') as HTMLElement;
  const style = getComputedStyle(option);

  expect(style.pointerEvents).toBe('auto');
  expect(style.cursor).toBe('not-allowed');

  fireEvent.click(option);

  expect(onSelectClick).not.toHaveBeenCalled();

  fireEvent.click(screen.getByText('Pick me').closest('.reqore-checkbox')!);

  expect(onSelectClick).toHaveBeenNthCalledWith(1, 'pick');
});
