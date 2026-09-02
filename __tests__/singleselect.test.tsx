import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ReqoreSingleSelect, ReqoreUIProvider } from '../src';
import { IReqoreSingleSelectProps } from '../src/components/SingleSelect';
import { MultiSelectItems } from '../src/mock/multiSelect';

beforeAll(() => {
  vi.setConfig({ testTimeout: 30000 });
  vi.useFakeTimers();
});

const SingleSelectTestComponent = ({
  onValueChange,
  value,
  ...rest
}: Partial<IReqoreSingleSelectProps>) => {
  const [selected, setSelected] = React.useState<string | undefined>(value);

  return (
    <ReqoreUIProvider>
      <ReqoreSingleSelect
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

test('Renders empty <ReqoreSingleSelect />', () => {
  act(() => {
    render(<SingleSelectTestComponent items={MultiSelectItems} />);
  });

  vi.advanceTimersByTime(1);

  expect(screen.getByText('No value selected')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-input')?.length).toBe(1);
  expect(document.querySelector('.reqore-input')?.getAttribute('disabled')).toBe(null);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
  // The "nothing selected" tag
  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
});

test('Renders <ReqoreSingleSelect /> with a value as a single chip', () => {
  act(() => {
    render(<SingleSelectTestComponent items={MultiSelectItems} value='Existing item 3' />);
  });

  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getByText('Existing item 3')).toBeTruthy();
  expect(screen.queryByText('No value selected')).toBe(null);
});

test('Renders <ReqoreSingleSelect /> with a value that is not among the items', () => {
  act(() => {
    render(<SingleSelectTestComponent items={MultiSelectItems} value='$.create.body.sku' />);
  });

  vi.advanceTimersByTime(1);

  // A value with no matching item still gets a chip; without it the value is
  // held but nothing is drawn, which reads as "nothing is selected".
  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getByText('$.create.body.sku')).toBeTruthy();
});

test('Renders <ReqoreSingleSelect /> and clears the value by removing the chip', () => {
  const onValueChange = vi.fn();

  act(() => {
    render(
      <SingleSelectTestComponent
        items={MultiSelectItems}
        value='Existing item 3'
        onValueChange={onValueChange}
      />
    );
  });

  vi.advanceTimersByTime(1);

  // The chip is removable by default, unlike the multi select's
  fireEvent.click(document.querySelector('.reqore-tag-remove')!);

  expect(onValueChange).toHaveBeenNthCalledWith(1, undefined);
  expect(screen.getByText('No value selected')).toBeTruthy();
});

test('Renders <ReqoreSingleSelect /> and REPLACES the value when another item is picked', () => {
  const onValueChange = vi.fn();

  act(() => {
    render(
      <SingleSelectTestComponent
        items={MultiSelectItems}
        value='Existing item 3'
        onValueChange={onValueChange}
      />
    );
  });

  fireEvent.focus(document.querySelector('.reqore-input')!);

  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.click(screen.getAllByText('Existing item 1').at(-1)!);

  // A scalar, not a list, and the previous value is gone
  expect(onValueChange).toHaveBeenNthCalledWith(1, 'Existing item 1');
  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getByText('Existing item 1')).toBeTruthy();
  // The list closes once a value is picked, unlike the multi select's
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Renders <ReqoreSingleSelect /> and deselects the value by picking it again', () => {
  const onValueChange = vi.fn();

  act(() => {
    render(
      <SingleSelectTestComponent
        items={MultiSelectItems}
        value='Existing item 3'
        onValueChange={onValueChange}
      />
    );
  });

  fireEvent.focus(document.querySelector('.reqore-input')!);

  vi.advanceTimersByTime(1);

  fireEvent.click(screen.getAllByText('Existing item 3').at(-1)!);

  expect(onValueChange).toHaveBeenNthCalledWith(1, undefined);
  expect(screen.getByText('No value selected')).toBeTruthy();
});

test('Renders <ReqoreSingleSelect /> and does not select a disabled item', () => {
  const onValueChange = vi.fn();

  act(() => {
    render(<SingleSelectTestComponent items={MultiSelectItems} onValueChange={onValueChange} />);
  });

  fireEvent.focus(document.querySelector('.reqore-input')!);

  vi.advanceTimersByTime(1);

  fireEvent.click(screen.getAllByText('Disabled item').at(-1)!);

  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByText('No value selected')).toBeTruthy();
});

test('Renders disabled <ReqoreSingleSelect /> when there are no items and none can be created', () => {
  act(() => {
    render(<SingleSelectTestComponent />);
  });

  fireEvent.focus(document.querySelector('.reqore-input')!);

  expect(document.querySelector('.reqore-input')?.getAttribute('disabled')).toBe('');
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Renders <ReqoreSingleSelect /> that can create a value outside the item list', () => {
  const onValueChange = vi.fn();

  act(() => {
    render(
      <SingleSelectTestComponent
        items={MultiSelectItems}
        canCreateItems
        onValueChange={onValueChange}
      />
    );
  });

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: '$.create.body.sku' },
  });

  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(screen.getAllByText('Create new "$.create.body.sku"')).toBeTruthy();

  fireEvent.click(screen.getAllByText('Create new "$.create.body.sku"').at(-1)!);

  expect(onValueChange).toHaveBeenNthCalledWith(1, '$.create.body.sku');
  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(screen.getByText('$.create.body.sku')).toBeTruthy();
});

test('Renders <ReqoreSingleSelect /> without a divider when nothing matched', () => {
  act(() => {
    render(<SingleSelectTestComponent items={MultiSelectItems} canCreateItems />);
  });

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'nothing matches this' },
  });

  vi.advanceTimersByTime(1);

  expect(screen.getAllByText('Create new "nothing matches this"')).toBeTruthy();
  expect(screen.getAllByText('No existing value found')).toBeTruthy();
  // The divider would head a section whose only content says it is empty
  expect(screen.queryByText('Values matching your query')).toBe(null);
});

test('Renders <ReqoreSingleSelect /> with a divider above the values that DID match', () => {
  act(() => {
    render(<SingleSelectTestComponent items={MultiSelectItems} canCreateItems />);
  });

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'Existing item' },
  });

  vi.advanceTimersByTime(1);

  expect(screen.getAllByText('Create new "Existing item"')).toBeTruthy();
  expect(screen.getByText('Values matching your query')).toBeTruthy();
});

test('Renders <ReqoreSingleSelect /> that creates a value with the ENTER key', () => {
  const onValueChange = vi.fn();

  act(() => {
    render(
      <SingleSelectTestComponent
        items={MultiSelectItems}
        canCreateItems
        enterKeySelects
        onValueChange={onValueChange}
      />
    );
  });

  fireEvent.focus(document.querySelector('.reqore-input')!);
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: '$.create.status' },
  });

  vi.advanceTimersByTime(1);

  fireEvent.keyDown(document.querySelector('.reqore-input')!, { key: 'Enter' });

  expect(onValueChange).toHaveBeenNthCalledWith(1, '$.create.status');
  expect(screen.getByText('$.create.status')).toBeTruthy();
});

test('Renders <ReqoreSingleSelect /> with an empty string as no selection', () => {
  act(() => {
    render(<SingleSelectTestComponent items={MultiSelectItems} value='' />);
  });

  vi.advanceTimersByTime(1);

  // An empty value cannot be seen and cannot be removed, so it must not read
  // as a selection
  expect(screen.getByText('No value selected')).toBeTruthy();
});

test('Renders <ReqoreSingleSelect /> with a non-removable chip', () => {
  act(() => {
    render(
      <SingleSelectTestComponent
        items={MultiSelectItems}
        value='Existing item 3'
        canRemoveItems={false}
      />
    );
  });

  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-tag').length).toBe(1);
  expect(document.querySelectorAll('.reqore-tag-remove').length).toBe(0);
});
