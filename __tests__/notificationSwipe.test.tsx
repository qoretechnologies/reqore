/**
 * Swipe-to-dismiss on ReqoreNotification.
 *
 * jsdom has no layout, so the toast is given a width and what is checked is the mechanism:
 * which press starts a swipe, where the toast is translated to, what a release does, and that
 * the timer holds while it is held. The rendered motion is asserted in a real browser by the
 * `Other/Notifications/Item` swipe stories.
 */
import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  IReqoreNotificationProps,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreNotification,
  ReqoreUIProvider,
} from '../src';

const toast = () => document.querySelector('.reqore-notification') as HTMLElement;
const progress = () => toast().querySelector('.reqore-notification-progress');

/** The geometry jsdom does not have: a 400px-wide toast. */
const layOut = () =>
  vi.spyOn(toast(), 'getBoundingClientRect').mockImplementation(
    () =>
      ({ left: 100, top: 100, width: 400, height: 80, right: 500, bottom: 180, x: 100, y: 100 }) as DOMRect
  );

const pointer = (x: number, buttons = 1) => ({
  pointerId: 1,
  pointerType: 'touch',
  isPrimary: true,
  button: 0,
  buttons,
  clientX: x,
  clientY: 140,
});

/**
 * A finger drag from `from` by `dx` on `target`. With `settle`, the finger stops before letting
 * go so the release carries no speed and only the distance counts.
 */
const drag = async (
  target: Element,
  from: number,
  dx: number,
  { release = true, settle = false } = {}
) => {
  fireEvent.pointerDown(target, pointer(from));
  fireEvent.pointerMove(target, pointer(from + dx / 2));
  fireEvent.pointerMove(target, pointer(from + dx));

  if (settle) {
    await new Promise((resolve) => setTimeout(resolve, 30));
    fireEvent.pointerMove(target, pointer(from + dx));
  }

  if (release) {
    fireEvent.pointerUp(target, pointer(from + dx, 0));
  }
};

const Toast = (props: Partial<IReqoreNotificationProps>) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreContent>
        <ReqoreNotification
          title='Saved'
          content='Your changes are in.'
          duration={15000}
          onFinish={() => undefined}
          onClose={() => undefined}
          {...props}
        />
      </ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

describe('ReqoreNotification swipeToDismiss', () => {
  it('is on for a toast with an onClose, and off without one or when turned off', () => {
    const { unmount } = render(<Toast />);
    expect(toast().classList.contains('reqore-notification-swipeable')).toBe(true);
    unmount();

    const { unmount: unmountOff } = render(<Toast swipeToDismiss={false} />);
    expect(toast().classList.contains('reqore-notification-swipeable')).toBe(false);
    unmountOff();

    render(<Toast onClose={undefined} />);
    expect(toast().classList.contains('reqore-notification-swipeable')).toBe(false);
  });

  it('follows the finger sideways and holds the timer while held', async () => {
    render(<Toast />);
    layOut();

    await drag(toast(), 300, 120, { release: false });

    await waitFor(() => expect(toast().style.transform).toContain('translate3d(120px, 0, 0)'));
    expect(toast().classList.contains('reqore-notification-dragging')).toBe(true);
    expect(progress()).toHaveAttribute('data-paused');
  });

  it('closes past 18% of its width, through onClose', async () => {
    const onClose = vi.fn();

    render(<Toast onClose={onClose} />);
    layOut();

    // 100px of a 400px toast: past the 72px threshold.
    await drag(toast(), 300, 100, { settle: true });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('a shorter pull springs back and lets the timer run again', async () => {
    const onClose = vi.fn();

    render(<Toast onClose={onClose} />);
    layOut();

    await drag(toast(), 300, 30, { settle: true });

    expect(onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(toast().style.transform).not.toContain('translate3d'));
    expect(toast().classList.contains('reqore-notification-dragging')).toBe(false);
    await waitFor(() => expect(progress()).not.toHaveAttribute('data-paused'));
  });

  it('does not start on the close button', async () => {
    const onClose = vi.fn();

    render(<Toast onClose={onClose} />);
    layOut();

    const close = toast().querySelector('.reqore-notification-close') as HTMLElement;

    await drag(close, 450, 150, { settle: true });

    expect(onClose).not.toHaveBeenCalled();
    expect(toast().style.transform).not.toContain('translate3d');
  });

  it('a swipe is not a click', async () => {
    const onClick = vi.fn();
    const onClose = vi.fn();

    render(<Toast onClick={onClick} onClose={onClose} />);
    layOut();

    await drag(toast(), 300, 100, { settle: true });
    fireEvent.click(toast());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
