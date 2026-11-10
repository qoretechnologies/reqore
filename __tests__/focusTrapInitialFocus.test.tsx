import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { useFocusTrap } from '../src/hooks/useFocusTrap';

/* A trap focuses its first focusable element on its first frame, or the container when there is none yet. A drawer
   whose content arrives later then kept focus on the container, so which of the two it ended with depended on
   whether its content had rendered by that frame (qorus#646: a drawer captured with its first tab focused on one
   run and with the drawer focused on the next). Content that arrives later now takes focus when it appears, unless
   the user has moved focus by then. The frames are run by hand. */

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

/** Lets the MutationObserver callbacks run. */
const flushMutations = () => act(() => Promise.resolve());

const Drawer = ({ loaded }: { loaded: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, { active: true });
  return (
    <div ref={ref} data-testid='drawer'>
      {loaded ? (
        <button type='button'>First tab</button>
      ) : (
        <span>Loading…</span>
      )}
    </div>
  );
};

const Page = ({ loaded }: { loaded: boolean }) => (
  <>
    <button type='button'>Elsewhere</button>
    <Drawer loaded={loaded} />
  </>
);

const byText = (text: string) =>
  text === 'drawer'
    ? document.querySelector<HTMLElement>('[data-testid="drawer"]')!
    : Array.from(document.querySelectorAll<HTMLElement>('button')).find((node) => node.textContent === text)!;

test('content that is there on the first frame takes focus then', () => {
  render(<Page loaded />);
  runFrame();
  expect(document.activeElement).toBe(byText('First tab'));
});

test('content that arrives after the first frame takes focus when it appears', async () => {
  const { rerender } = render(<Page loaded={false} />);
  runFrame();
  expect(document.activeElement).toBe(byText('drawer'));

  rerender(<Page loaded />);
  await flushMutations();
  expect(document.activeElement).toBe(byText('First tab'));
});

test('focus the user moved away before the content arrived is left where they put it', async () => {
  const { rerender } = render(<Page loaded={false} />);
  runFrame();
  expect(document.activeElement).toBe(byText('drawer'));

  act(() => byText('Elsewhere').focus());
  await flushMutations();
  rerender(<Page loaded />);
  await flushMutations();
  expect(document.activeElement).toBe(byText('Elsewhere'));
});

test('a trap that ends before its content arrives no longer waits for it', async () => {
  const Toggle = ({ active, loaded }: { active: boolean; loaded: boolean }) => {
    const ref = useRef<HTMLDivElement>(null);
    useFocusTrap(ref, { active });
    return (
      <>
        <button type='button'>Elsewhere</button>
        <div ref={ref} data-testid='drawer'>
          {loaded ? <button type='button'>First tab</button> : <span>Loading…</span>}
        </div>
      </>
    );
  };
  const { rerender } = render(<Toggle active loaded={false} />);
  runFrame();
  act(() => byText('Elsewhere').focus());
  rerender(<Toggle active={false} loaded={false} />);
  runFrame();
  rerender(<Toggle active={false} loaded />);
  await flushMutations();
  expect(document.activeElement).not.toBe(byText('First tab'));
});
