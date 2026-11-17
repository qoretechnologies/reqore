// Copyright 2026 Qore Technologies, s.r.o.
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef, useState } from 'react';
import { ReqoreDrawer, ReqoreUIProvider } from '../src';
import { useReqoreProperty } from '../src/hooks/useReqoreContext';
import { useFocusTrap } from '../src/hooks/useFocusTrap';

beforeEach(() => {
  // jsdom lays nothing out, so every element reads as not rendered (no offset parent); here a connected one is
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockImplementation(function (this: HTMLElement) {
    return this.isConnected ? this.parentElement : null;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** Two traps, one inside the other's reach: an outer dialog and one opened over it. */
const Nested = () => {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useFocusTrap(outer, { active: true, autoFocus: false, restoreFocus: false });
  useFocusTrap(inner, { active: true, autoFocus: false, restoreFocus: false });

  return (
    <>
      <div ref={outer}>
        <button>Outer first</button>
        <button>Outer last</button>
      </div>
      <div ref={inner}>
        <button>Inner first</button>
        <button>Inner last</button>
      </div>
    </>
  );
};

test('Only the innermost trap holds Tab', () => {
  render(<Nested />);
  const innerLast = screen.getByText('Inner last');
  const outerFocused = vi.fn();

  screen.getByText('Outer first').addEventListener('focus', outerFocused);
  innerLast.focus();
  fireEvent.keyDown(document, { key: 'Tab' });

  // The inner trap wraps to its own first control, and the outer one never takes focus on the way:
  // without the stack it pulled focus to its first control and the inner one pulled it back.
  expect(document.activeElement).toBe(screen.getByText('Inner first'));
  expect(outerFocused).not.toHaveBeenCalled();
});

/** A page with a button that opens a drawer without a backdrop. */
const Page = () => {
  const [open, setOpen] = useState(false);

  return (
    <ReqoreUIProvider>
      <button onClick={() => setOpen(true)}>Open details</button>
      {open ? (
        <ReqoreDrawer isOpen hasBackdrop={false} label='Details' onClose={() => setOpen(false)}>
          <button>Inside</button>
        </ReqoreDrawer>
      ) : null}
    </ReqoreUIProvider>
  );
};

test('A drawer without a backdrop takes focus when it opens and gives it back when it closes', async () => {
  render(<Page />);
  const opener = screen.getByText('Open details');

  opener.focus();
  act(() => {
    opener.click();
  });

  // The drawer as a whole takes focus, not its first control: the page beside it stays usable.
  const wrapper = await waitFor(() => {
    const element = document.querySelector<HTMLElement>('.reqore-drawer-wrapper');
    expect(element).not.toBeNull();
    expect(document.activeElement).toBe(element);
    return element!;
  });
  expect(wrapper.getAttribute('role')).toBe('dialog');
  expect(wrapper.getAttribute('aria-modal')).toBeNull();

  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(document.querySelector('.reqore-drawer-wrapper')).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(opener));
});

/** Opens a confirmation from a button. */
const Asks = () => {
  const confirmAction = useReqoreProperty('confirmAction');

  return (
    <button onClick={() => confirmAction({ title: 'Delete it?', onConfirm: () => undefined })}>
      Ask
    </button>
  );
};

test('A confirmation opens with Cancel focused, not the x in its title bar', async () => {
  render(
    <ReqoreUIProvider>
      <Asks />
    </ReqoreUIProvider>
  );

  fireEvent.click(screen.getByText('Ask'));
  await screen.findByText('Delete it?');

  // The x is there (Escape and it cancel), but focus opens on the least destructive answer.
  const modal = document.querySelector<HTMLElement>('.reqore-confirmation-modal')!;
  const buttons = () => Array.from(modal.querySelectorAll<HTMLButtonElement>('button'));

  expect(modal.querySelector('[aria-label="Close"]')).not.toBeNull();
  await waitFor(() =>
    expect(document.activeElement).toBe(buttons().find((button) => button.textContent?.includes('Cancel')))
  );
});
