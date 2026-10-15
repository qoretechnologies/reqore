// Copyright 2026 Qore Technologies, s.r.o.
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReqoreContent, ReqoreDropdown, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { IReqoreDropdownItem } from '../src/components/Dropdown/list';

/**
 * Every row a dropdown's list draws has a key of its own.
 *
 * The list keyed an item by its label or value, and a divider by its place. The control group the
 * rows are drawn in joined each row's place to that key, so two items that said the same thing, or
 * an item whose value was a divider's place, still had keys apart. The control group now keeps a
 * row's own key (so a row keeps its state when one is added before it), and those keys met: React
 * warned, and may drop or repeat a row whose key another row has.
 */

const wrap = (node: React.ReactNode) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreContent>{node}</ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

const keyWarnings = () =>
  vi
    .mocked(console.error)
    .mock.calls.filter((args) => String(args[0]).includes('two children with the same key'))
    .map((args) => String(args[1] ?? args[0]));

const rows = () => Array.from(document.querySelectorAll('.reqore-menu-item'));

// A button draws its label more than once (for its hover animation); the first copy is its text.
const rowText = (row: Element) => row.querySelector('.reqore-button-text-content')?.textContent;

const rowTexts = () => rows().map(rowText);

const List = ({ items }: { items: IReqoreDropdownItem[] }) => (
  <ReqoreDropdown label='Open' isDefaultOpen items={items} />
);

describe("a dropdown list's rows", () => {
  beforeEach(() => {
    vi.mocked(console.error).mockClear();
  });

  it('are told apart when two items say the same thing', () => {
    render(
      wrap(
        <List
          items={[
            { value: 'Hello' },
            { value: 'How are ya' },
            { divider: true, label: 'More' },
            { value: 'Hello' },
            { label: 'Same label', value: 'one' },
            { label: 'Same label', value: 'two' },
          ]}
        />
      )
    );

    expect(keyWarnings()).toEqual([]);
    expect(rowTexts()).toEqual(['Hello', 'How are ya', 'Hello', 'Same label', 'Same label']);
  });

  it("are told apart when an item's value is a divider's place", () => {
    render(
      wrap(
        <List
          items={[
            { value: 'Zero' },
            { divider: true, label: 'One' },
            { value: 'Two' },
            { value: 1, label: undefined },
          ]}
        />
      )
    );

    expect(keyWarnings()).toEqual([]);
    expect(rowTexts()).toEqual(['Zero', 'Two', '1']);
  });

  it('keep the row an item had when an item is added before it', () => {
    const { rerender } = render(wrap(<List items={[{ value: 'First' }, { value: 'Second' }]} />));
    const second = rows().find((row) => rowText(row) === 'Second');
    expect(second).toBeDefined();

    rerender(wrap(<List items={[{ value: 'New' }, { value: 'First' }, { value: 'Second' }]} />));

    const secondAfter = rows().find((row) => rowText(row) === 'Second');
    expect(rowTexts()).toEqual(['New', 'First', 'Second']);
    // The same DOM node: the item kept its key, so React kept its row rather than redrawing it.
    expect(secondAfter).toBe(second);
    expect(keyWarnings()).toEqual([]);
  });

  it('keep the rows of repeated items when a different item is added before them', () => {
    const { rerender } = render(wrap(<List items={[{ value: 'Same' }, { value: 'Same' }]} />));
    const before = rows();
    expect(before).toHaveLength(2);

    rerender(wrap(<List items={[{ value: 'Other' }, { value: 'Same' }, { value: 'Same' }]} />));

    const after = rows();
    expect(rowTexts()).toEqual(['Other', 'Same', 'Same']);
    expect(after[1]).toBe(before[0]);
    expect(after[2]).toBe(before[1]);
    expect(keyWarnings()).toEqual([]);
  });
});
