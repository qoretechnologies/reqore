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

beforeEach(() => {
  popper.forceUpdate.mockClear();
  TestResizeObserver.instances = [];
  vi.stubGlobal('ResizeObserver', TestResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('repositions an open popover when asynchronous content changes size', async () => {
  render(<Preview updater={0} />);
  expect(await screen.findByText('Asynchronous preview')).toBeInTheDocument();

  await waitFor(() => expect(TestResizeObserver.instances).toHaveLength(1));
  const observer = TestResizeObserver.instances[0];
  expect(observer.observe).toHaveBeenCalledWith(document.querySelector('.reqore-popover-content'));

  act(() => observer.callback([], observer as unknown as ResizeObserver));
  expect(popper.forceUpdate).toHaveBeenCalled();
});

test('honors the explicit updater prop while the popover is open', async () => {
  const { rerender } = render(<Preview updater={0} />);
  expect(await screen.findByText('Asynchronous preview')).toBeInTheDocument();
  popper.forceUpdate.mockClear();

  rerender(<Preview updater={1} />);
  expect(popper.forceUpdate).toHaveBeenCalled();
});
