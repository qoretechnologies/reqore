// Copyright 2026 Qore Technologies, s.r.o.
import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReqoreContent, ReqoreDropdown, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { IReqoreDropdownItem } from '../src/components/Dropdown/list';

/**
 * Back at a level with the left arrow, the row the keys opened is the one highlighted, so the right arrow
 * opens it again and Enter acts on it (qorus#646, Foxhoundn's review of Dropdown · Keyboard Navigation With
 * Left Arrow Navigates Back). The level cleared its highlight when it opened the row; it looked highlighted
 * after Left only while it also heard the keys pressed in the level it showed, which it no longer does.
 */

const rows = () => Array.from(document.querySelectorAll<HTMLElement>('.reqore-menu-item'));
// a row's label as it is read: the marquee draws it again for its scroll, hidden from assistive technology
const rowTexts = () =>
  rows().map(
    (row) => row.querySelector('[data-reqore-marquee="text"]:not([aria-hidden])')?.textContent
  );
// the list hears the arrow keys on the document, wherever the focus is
const press = (key: string) =>
  act(() => {
    fireEvent.keyDown(document.body, { key });
  });

const open = (items: IReqoreDropdownItem[]) =>
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown label='Menu' items={items} keyboardNavigation isDefaultOpen />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

describe('a dropdown level the keys go back to', () => {
  it('highlights the row they opened, so the right arrow opens it again', () => {
    open([
      { label: 'Fruit', value: 'fruit', items: [{ label: 'Apple', value: 'apple' }] },
      {
        label: 'Vegetables',
        value: 'vegetables',
        items: [
          { label: 'Carrot', value: 'carrot' },
          { label: 'Leek', value: 'leek' },
        ],
      },
    ]);
    expect(rowTexts()).toEqual(['Fruit', 'Vegetables']);

    press('ArrowDown');
    press('ArrowDown');
    press('ArrowRight');
    expect(rowTexts()).toEqual(['Carrot', 'Leek']);

    press('ArrowLeft');
    expect(rowTexts()).toEqual(['Fruit', 'Vegetables']);

    // the keys pick up where they were: Vegetables, not the first row and not nothing
    press('ArrowRight');
    expect(rowTexts()).toEqual(['Carrot', 'Leek']);
  });

  it('highlights a lone row the list opened by itself', () => {
    // a list of one row with rows of its own opens on that row's level
    open([
      {
        label: 'Item with Submenu',
        value: 'item1',
        items: [
          { label: 'Submenu Item 1', value: 'subitem1' },
          { label: 'Submenu Item 2', value: 'subitem2' },
        ],
      },
    ]);
    expect(rowTexts()).toEqual(['Submenu Item 1', 'Submenu Item 2']);

    press('ArrowLeft');
    expect(rowTexts()).toEqual(['Item with Submenu']);

    press('ArrowRight');
    expect(rowTexts()).toEqual(['Submenu Item 1', 'Submenu Item 2']);
  });

  it('highlights nothing after a click back: a click says nothing of the keys', () => {
    open([
      { label: 'Fruit', value: 'fruit', items: [{ label: 'Apple', value: 'apple' }] },
      { label: 'Vegetables', value: 'vegetables', items: [{ label: 'Carrot', value: 'carrot' }] },
    ]);

    press('ArrowDown');
    press('ArrowDown');
    press('ArrowRight');
    expect(rowTexts()).toEqual(['Carrot']);

    act(() => {
      fireEvent.click(document.querySelector('.reqore-dropdown-back-button') as Element);
    });
    expect(rowTexts()).toEqual(['Fruit', 'Vegetables']);

    // no row is highlighted, so the right arrow opens none
    press('ArrowRight');
    expect(rowTexts()).toEqual(['Fruit', 'Vegetables']);
  });
});
