import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ReqorePopover, ReqoreUIProvider } from '../src';

const popper = vi.hoisted(() => ({
  forceUpdate: vi.fn(),
}));

vi.mock('react-popper', () => ({
  usePopper: () => ({
    styles: { popper: {}, arrow: {} },
    attributes: { popper: {} },
    forceUpdate: popper.forceUpdate,
    state: {},
  }),
}));

class TestResizeObserver {
  static instances: TestResizeObserver[] = [];

  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(readonly callback: ResizeObserverCallback) {
    TestResizeObserver.instances.push(this);
  }
}

const Preview = ({ updater }: { updater: number }) => (
  <ReqoreUIProvider>
    <ReqorePopover
      component='span'
      content={<div>Asynchronous preview</div>}
      openOnMount
      updater={updater}
    >
      Preview trigger
    </ReqorePopover>
  </ReqoreUIProvider>
);

// The frames the popover asks for, run by the test.
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;

const runFrames = () => {
  const due = [...frames.values()];
  frames.clear();
  due.forEach((frame) => frame(0));
};

beforeEach(() => {
  popper.forceUpdate.mockClear();
  TestResizeObserver.instances = [];
  vi.stubGlobal('ResizeObserver', TestResizeObserver);
  frames = new Map();
  nextFrame = 0;
  vi.stubGlobal('requestAnimationFrame', (frame: FrameRequestCallback) => {
    frames.set(++nextFrame, frame);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const openObserver = async () => {
  expect(await screen.findByText('Asynchronous preview')).toBeInTheDocument();
  await waitFor(() => expect(TestResizeObserver.instances).toHaveLength(1));
  const observer = TestResizeObserver.instances[0];
  expect(observer.observe).toHaveBeenCalledWith(document.querySelector('.reqore-popover-content'));
  // what opening asked for already
  act(() => runFrames());
  popper.forceUpdate.mockClear();
  return observer;
};

test('repositions an open popover when asynchronous content changes size, at the next frame', async () => {
  render(<Preview updater={0} />);
  const observer = await openObserver();

  act(() => observer.callback([], observer as unknown as ResizeObserver));
  act(() => observer.callback([], observer as unknown as ResizeObserver));
  // not inside the observer's callback: Popper's new position can resize the popover, a layout change the
  // browser would leave unreported ("ResizeObserver loop completed with undelivered notifications")
  expect(popper.forceUpdate).not.toHaveBeenCalled();

  act(() => runFrames());
  // once, however many reports came in during the frame
  expect(popper.forceUpdate).toHaveBeenCalledTimes(1);
});

test('repositions an open popover when its target changes size, at the next frame', async () => {
  render(<Preview updater={0} />);
  const observer = await openObserver();

  // the target is observed with the popover: a target that grows or shrinks with no scroll and no window
  // resize (its container resized, a label or a font that loaded) moves the edge the popover is placed by
  const target = screen
    .getByText('Preview trigger')
    .closest('.reqore-popover-wrapper') as HTMLElement;
  expect(observer.observe).toHaveBeenCalledWith(target);

  act(() =>
    observer.callback(
      [{ target } as unknown as ResizeObserverEntry],
      observer as unknown as ResizeObserver
    )
  );
  expect(popper.forceUpdate).not.toHaveBeenCalled();

  act(() => runFrames());
  expect(popper.forceUpdate).toHaveBeenCalledTimes(1);
});

test('a frame asked for by a popover that has since closed does not run', async () => {
  const { unmount } = render(<Preview updater={0} />);
  const observer = await openObserver();

  act(() => observer.callback([], observer as unknown as ResizeObserver));
  unmount();
  runFrames();

  expect(popper.forceUpdate).not.toHaveBeenCalled();
  expect(observer.disconnect).toHaveBeenCalled();
});

test('honors the explicit updater prop while the popover is open', async () => {
  const { rerender } = render(<Preview updater={0} />);
  expect(await screen.findByText('Asynchronous preview')).toBeInTheDocument();
  popper.forceUpdate.mockClear();

  rerender(<Preview updater={1} />);
  expect(popper.forceUpdate).toHaveBeenCalled();
});
