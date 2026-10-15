// Copyright 2026 Qore Technologies, s.r.o.
import { act, fireEvent, render } from '@testing-library/react';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReqoreContent, ReqoreDropdown, ReqoreInput, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

/**
 * A list opened by focus is opened by the field being focused - however it came to be.
 *
 * The popover listened for `focusin` only, so a field focused as it mounts (an editor that opens with the
 * cursor in its field) was focused before the listener was there, and the list of what can go in it (a
 * form's templates) did not appear until the user left the field and came back.
 */

const isOpen = () => document.querySelectorAll('.reqore-popover-content').length === 1;

/** An input focused as it mounts, before the popover's effects run. */
const AutoFocusedInput = forwardRef<HTMLInputElement | null, any>((_props, ref) => {
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current as HTMLInputElement);
  useEffect(() => {
    inner.current?.focus();
  }, []);
  return <input ref={inner} className='auto-focused' />;
});

const items = [
  { label: 'qty', value: '$record:{qty}' },
  { label: 'price', value: '$record:{price}' },
];

const Field = ({ autoFocused }: { autoFocused?: boolean }) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreContent>
        <ReqoreDropdown component={autoFocused ? AutoFocusedInput : ReqoreInput} handler='focus' items={items} />
      </ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

const show = (autoFocused?: boolean) => {
  act(() => {
    render(<Field autoFocused={autoFocused} />);
  });
  vi.advanceTimersByTime(1);
};

const settle = () => {
  act(() => {
    vi.advanceTimersByTime(1);
  });
};

describe('a list opened by focus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens when the field is focused', () => {
    show();
    expect(isOpen()).toBe(false);
    fireEvent.focus(document.querySelector('.reqore-input') as HTMLElement);
    settle();
    expect(isOpen()).toBe(true);
  });

  it('opens for a field focused as it mounts', () => {
    show(true);
    settle();
    expect(document.activeElement?.className).toBe('auto-focused');
    expect(isOpen()).toBe(true);
  });

  it('stays closed after Escape while the field keeps the focus', () => {
    // the focus check is made once per field: the list's own opening and closing re-run the popover's
    // listener effect, and a check on every re-run reopened the list Escape had just closed
    show();
    const field = document.querySelector('.reqore-input') as HTMLInputElement;
    act(() => {
      field.focus();
    });
    settle();
    expect(isOpen()).toBe(true);
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    settle();
    expect(document.activeElement).toBe(field);
    expect(isOpen()).toBe(false);
  });

  it('stays closed for a field nobody is in', () => {
    show();
    settle();
    expect(document.activeElement).toBe(document.body);
    expect(isOpen()).toBe(false);
  });
});
