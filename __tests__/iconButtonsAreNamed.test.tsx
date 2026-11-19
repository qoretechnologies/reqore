// Copyright 2026 Qore Technologies, s.r.o.
import { render } from '@testing-library/react';
import {
  DatePicker,
  ReqoreContent,
  ReqoreDrawer,
  ReqoreLayoutContent,
  ReqoreTabs,
  ReqoreTree,
  ReqoreUIProvider,
} from '../src';
import ReqoreDropdownList from '../src/components/Dropdown/list';

/**
 * A button that is an icon alone says what it does, as a tooltip and to a screen reader: the tree's
 * edit / delete / add / copy, a tab's close, a date picker's clear, a nested list's back and a
 * drawer's hide were read as "button" (in an app's list editor, and the table toolbar's too). Each
 * render also checks that no button on the page is left without a name.
 */
const mount = (ui: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const nameOf = (button: Element) =>
  button.getAttribute('aria-label') ||
  button.getAttribute('title') ||
  button.textContent?.trim() ||
  '';

const expectEveryButtonNamed = () => {
  const unnamed = Array.from(document.querySelectorAll('button'))
    .filter((button) => !nameOf(button))
    .map((button) => button.className);

  expect(unnamed).toEqual([]);
};

const nameIn = (selector: string) => nameOf(document.querySelector(selector)!);

test("an editable tree's row buttons say what they do", () => {
  mount(
    <ReqoreTree
      data={{ name: 'Order sync', retries: 3, tags: { region: 'eu' } }}
      editable
      withLabelCopy
      expanded
    />
  );

  expect(nameIn('.reqore-tree-edit')).toBe('Edit');
  expect(nameIn('.reqore-tree-delete')).toBe('Delete');
  expect(nameIn('.reqore-tree-add')).toBe('Add an item');
  expect(nameIn('.reqore-tree-copy')).toBe('Copy the value');
  expectEveryButtonNamed();
});

test('their names can be translated', () => {
  mount(
    <ReqoreTree
      data={{ name: 'Order sync' }}
      editable
      editLabel='Upravit'
      deleteLabel='Smazat'
      addLabel='Přidat'
    />
  );

  expect(nameIn('.reqore-tree-edit')).toBe('Upravit');
  expect(nameIn('.reqore-tree-delete')).toBe('Smazat');
  expect(nameIn('.reqore-tree-add')).toBe('Přidat');
});

test("a tab's close button says which tab it closes", () => {
  mount(
    <ReqoreTabs
      tabs={[
        { id: 'one', label: 'Overview', onCloseClick: () => undefined },
        { id: 'two', label: 'History', onCloseClick: () => undefined, closeLabel: 'Zavřít' },
      ]}
    />
  );

  const names = Array.from(document.querySelectorAll('.reqore-tabs-list-item-close')).map(nameOf);

  expect(names).toEqual(['Close Overview', 'Zavřít']);
  expectEveryButtonNamed();
});

test("a clearable date picker's clear button says so", () => {
  // The picker drawn as a button (`selectOnly`) shows its clear beside it; the field form clears
  // through its input's own named button.
  mount(
    <DatePicker selectOnly isClearable value='2026-11-17T10:00:00Z' onChange={() => undefined} />
  );

  expect(nameIn('.reqore-datepicker-clear')).toBe('Clear');
});

test("an opened level's back button says so", () => {
  mount(
    <ReqoreDropdownList
      items={[{ label: 'Daily' }, { label: 'Weekly' }]}
      _onBackClick={() => undefined}
      _level={1}
    />
  );

  expect(nameIn('.reqore-dropdown-back-button')).toBe('Back');
  expectEveryButtonNamed();
});

test("a hidable drawer's hide button says so", () => {
  mount(
    <ReqoreDrawer isOpen hidable hasBackdrop={false} label='Details' onClose={() => undefined}>
      Details
    </ReqoreDrawer>
  );

  expect(nameIn('.reqore-drawer-hide-button')).toBe('Hide');
});
