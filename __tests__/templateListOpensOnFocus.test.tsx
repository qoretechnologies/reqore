// Copyright 2026 Qore Technologies, s.r.o.
import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTextarea, ReqoreUIProvider } from '../src';

/**
 * A field that offers templates lists them when the author comes into it, by a click, a tap or the keyboard
 * (qorus#646, David: a value's field, tabbed into, offered nothing). The list a click opens is the click's:
 * the focus the click brings does not open it a second time, which would close it again. And focus that
 * comes back to the field from the list - a template picked - does not open it again.
 */

const isOpen = () => document.querySelectorAll('.reqore-popover-content').length === 1;

const items = [
  { label: 'qty', value: '$record:{qty}' },
  { label: 'price', value: '$record:{price}' },
];

const show = () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <button className='before'>before</button>
          <ReqoreTextarea templates={{ items }} onChange={() => undefined} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  return {
    field: document.querySelector('.reqore-textarea') as HTMLElement,
    before: document.querySelector('.before') as HTMLElement,
  };
};

describe('a template list', () => {
  it('opens when the field is come into from the keyboard', () => {
    const { field, before } = show();
    act(() => {
      fireEvent.focusIn(field, { relatedTarget: before });
    });
    expect(isOpen()).toBe(true);
  });

  it('opens once for a click, which brings the focus too', () => {
    const { field, before } = show();
    act(() => {
      fireEvent.pointerDown(field);
      fireEvent.focusIn(field, { relatedTarget: before });
      fireEvent.click(field);
    });
    expect(isOpen()).toBe(true);
  });

  it('opens from the keyboard after a click on the field while it had the focus', () => {
    const { field, before } = show();
    act(() => {
      field.focus();
    });
    // a click on the field that already has the focus brings no focus: it lists the templates, as a click does
    act(() => {
      fireEvent.pointerDown(field);
      fireEvent.click(field);
    });
    expect(isOpen()).toBe(true);
    act(() => {
      fireEvent.keyDown(field, { key: 'Escape' });
    });
    expect(isOpen()).toBe(false);
    // away and back by the keyboard: that focus is the keyboard's
    act(() => {
      before.focus();
    });
    act(() => {
      fireEvent.focusIn(field, { relatedTarget: before });
    });
    expect(isOpen()).toBe(true);
  });

  it('opens from the keyboard after a click that brought no focus', () => {
    const { field, before } = show();
    // a press whose focus the page held back (its default prevented): the click still ends it
    act(() => {
      fireEvent.pointerDown(field);
      fireEvent.click(document.body);
    });
    act(() => {
      fireEvent.focusIn(field, { relatedTarget: before });
    });
    expect(isOpen()).toBe(true);
  });

  it('does not open for focus that comes back from the list', () => {
    const { field } = show();
    act(() => {
      fireEvent.focusIn(field, { relatedTarget: null });
    });
    expect(isOpen()).toBe(false);
  });
});
