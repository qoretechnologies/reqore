import { act, fireEvent, render } from '@testing-library/react';
import { useRef } from 'react';
import { useFocusTrap } from '../src/hooks/useFocusTrap';

/* A trap moves focus among the elements Tab can reach. An element with a negative tabindex is
   not one of them, even a button: a radio group (ReqoreSegmentedControl) gives tabindex 0 to its
   checked option only. Counted as tab stops, the group's first option took the trap's first focus
   whatever was checked, and the trap's last element could be an option Tab never reaches, so Tab
   from the real last tab stop left the dialog and Shift+Tab from the first one landed on an option
   out of the tab order. The frames are run by hand. */

let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;

beforeEach(() => {
  frames = new Map();
  nextFrame = 1;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    const id = nextFrame++;
    frames.set(id, callback);
    return id;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
  // jsdom lays nothing out, so every element reads as not rendered (no offset parent); here a connected one is
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockImplementation(function (this: HTMLElement) {
    return this.isConnected ? this.parentElement : null;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const runFrame = () =>
  act(() => {
    const due = Array.from(frames.entries());
    frames.clear();
    due.forEach(([, callback]) => callback(performance.now()));
  });

/** A period picker whose checked option is Week, the only option in the tab order. */
const Period = () => (
  <div role='radiogroup'>
    <button type='button' role='radio' aria-checked='false' tabIndex={-1}>
      Day
    </button>
    <button type='button' role='radio' aria-checked='true' tabIndex={0}>
      Week
    </button>
    <button type='button' role='radio' aria-checked='false' tabIndex={-1}>
      Month
    </button>
  </div>
);

/** A dialog with the period picker and a Save button, the picker first or last. */
const Dialog = ({ pickerFirst }: { pickerFirst: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, { active: true });
  const save = <button type='button'>Save</button>;
  return (
    <>
      <button type='button'>Elsewhere</button>
      <div ref={ref} data-testid='dialog' tabIndex={-1}>
        {pickerFirst ? (
          <>
            <Period />
            {save}
          </>
        ) : (
          <>
            {save}
            <Period />
          </>
        )}
      </div>
    </>
  );
};

const byText = (text: string) =>
  Array.from(document.querySelectorAll<HTMLElement>('button')).find((node) => node.textContent === text)!;

/** Presses Tab (or Shift+Tab) on the focused element; true when the trap moved focus itself. */
const pressTab = (shiftKey = false) => !fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey });

test('the first focus goes to the checked option, not to the first option of its group', () => {
  render(<Dialog pickerFirst />);
  runFrame();
  expect(document.activeElement).toBe(byText('Week'));
});

test('Tab from the last tab stop wraps to the first when options out of the tab order follow it', () => {
  render(<Dialog pickerFirst={false} />);
  runFrame();
  byText('Week').focus();
  expect(pressTab()).toBe(true);
  expect(document.activeElement).toBe(byText('Save'));
});

test('Shift+Tab from the first tab stop wraps to the last tab stop, not to an option out of the tab order', () => {
  render(<Dialog pickerFirst={false} />);
  runFrame();
  expect(document.activeElement).toBe(byText('Save'));
  expect(pressTab(true)).toBe(true);
  expect(document.activeElement).toBe(byText('Week'));
});

test('Tab between two tab stops is left to the browser', () => {
  render(<Dialog pickerFirst />);
  runFrame();
  expect(pressTab()).toBe(false);
  byText('Save').focus();
  expect(pressTab(true)).toBe(false);
});

test('Shift+Tab from the container itself, focused by a click, wraps to the last tab stop', () => {
  render(<Dialog pickerFirst />);
  runFrame();
  document.querySelector<HTMLElement>('[data-testid="dialog"]')!.focus();
  expect(pressTab(true)).toBe(true);
  expect(document.activeElement).toBe(byText('Save'));
});
