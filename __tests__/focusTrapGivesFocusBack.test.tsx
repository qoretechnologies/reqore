import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { useFocusTrap } from '../src/hooks/useFocusTrap';

/* A dialog or drawer traps focus while it is open and gives it back to what had it when it closes. The give-back
   read its saved element one frame after clearing it, so it never happened: focus fell to the page when the dialog
   went away, or stayed on the opener only when the dialog closed before its first frame (qorus#646, where a story
   ended with its tab focused on one run and with nothing focused on the next). The frames are run by hand, so
   each test says exactly which frame does what. */

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

/** Runs the frames asked for so far, as the browser's next frame would. */
const runFrame = () =>
  act(() => {
    const due = Array.from(frames.entries());
    frames.clear();
    due.forEach(([, callback]) => callback(performance.now()));
  });

const Trap = ({ active, mounted = true }: { active: boolean; mounted?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, { active });
  return mounted ? (
    <div ref={ref} data-testid='trap'>
      <button type='button'>Inside</button>
    </div>
  ) : null;
};

const Page = ({ active, mounted }: { active: boolean; mounted?: boolean }) => (
  <>
    <button type='button'>Opener</button>
    <button type='button'>Elsewhere</button>
    <Trap active={active} mounted={mounted} />
  </>
);

const button = (name: string) =>
  Array.from(document.querySelectorAll('button')).find((node) => node.textContent === name)!;

test('a trap that closes gives focus back to the element that had it', () => {
  const { rerender } = render(<Page active={false} />);
  button('Opener').focus();

  rerender(<Page active />);
  runFrame();
  expect(document.activeElement).toBe(button('Inside'));

  // the dialog goes away, and with it the focused element
  rerender(<Page active={false} mounted={false} />);
  runFrame();

  expect(document.activeElement).toBe(button('Opener'));
});

test('a trap that closes while its container stays gives focus back from inside it', () => {
  const { rerender } = render(<Page active={false} />);
  button('Opener').focus();

  rerender(<Page active />);
  runFrame();
  expect(document.activeElement).toBe(button('Inside'));

  // a hidden drawer that stays mounted: focus is still inside a container that no longer traps it
  rerender(<Page active={false} />);
  runFrame();

  expect(document.activeElement).toBe(button('Opener'));
});

test('a trap that ends before its first frame does not pull focus into its container later', () => {
  const { rerender } = render(<Page active={false} />);
  button('Opener').focus();

  rerender(<Page active />);
  // closed again before the browser drew a frame, its container still mounted
  rerender(<Page active={false} />);
  runFrame();

  expect(document.activeElement).toBe(button('Opener'));
});

test('focus the app moved elsewhere while the trap closed is left where it is', () => {
  const { rerender } = render(<Page active={false} />);
  button('Opener').focus();

  rerender(<Page active />);
  runFrame();
  expect(document.activeElement).toBe(button('Inside'));

  // the dialog's action sends the reader on to another control, then the dialog closes
  button('Elsewhere').focus();
  rerender(<Page active={false} mounted={false} />);
  runFrame();

  expect(document.activeElement).toBe(button('Elsewhere'));
});
