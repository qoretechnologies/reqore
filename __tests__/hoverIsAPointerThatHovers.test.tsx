/**
 * A hover is a pointer that hovers: a mouse, or a pen held above the screen. Never a finger.
 *
 * A tap is followed by the mouse events a browser emulates - `mouseenter` among them - with nothing in them to
 * tell them from a mouse's, so whatever opened on `mouseenter` opened at a tap: a hover tooltip until the click
 * closed it (on a touch laptop, whose mouse is its primary pointer), a panel's floating actions until the next
 * tap elsewhere. A browser sends an input's pointer events before the mouse events it makes of it, and the
 * pointer event says what the pointer is: that decides, event by event.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createHoverGate,
  isHoveringPointer,
  ReqorePanel,
  ReqorePopover,
  ReqoreUIProvider,
} from '../src/index';

/** A finger's tap on `el`, as a browser sends it: its pointer events, then the mouse events it emulates. */
const tapWithAFinger = (el: Element) => {
  fireEvent.pointerEnter(el, { pointerType: 'touch', buttons: 1 });
  fireEvent.pointerDown(el, { pointerType: 'touch', buttons: 1 });
  fireEvent.pointerUp(el, { pointerType: 'touch', buttons: 0 });
  fireEvent.pointerLeave(el, { pointerType: 'touch', buttons: 0 });
  fireEvent.mouseEnter(el);
};

/** A mouse coming to rest on `el`. */
const mouseOnto = (el: Element) => {
  fireEvent.pointerEnter(el, { pointerType: 'mouse', buttons: 0 });
  fireEvent.mouseEnter(el);
};

/** A pen held above the screen, over `el`. */
const penAbove = (el: Element) => {
  fireEvent.pointerEnter(el, { pointerType: 'pen', buttons: 0 });
  fireEvent.mouseEnter(el);
};

const popovers = () => document.querySelectorAll('.reqore-popover-content').length;

describe('isHoveringPointer', () => {
  it('is a mouse, pressed or not', () => {
    expect(isHoveringPointer({ pointerType: 'mouse', buttons: 0 })).toBe(true);
    expect(isHoveringPointer({ pointerType: 'mouse', buttons: 1 })).toBe(true);
  });

  it('is a pen held above the screen, not one pressed to it', () => {
    expect(isHoveringPointer({ pointerType: 'pen', buttons: 0 })).toBe(true);
    expect(isHoveringPointer({ pointerType: 'pen', buttons: 1 })).toBe(false);
  });

  it('is never a finger, nor a pointer the browser does not name', () => {
    expect(isHoveringPointer({ pointerType: 'touch', buttons: 0 })).toBe(false);
    expect(isHoveringPointer({ pointerType: 'touch', buttons: 1 })).toBe(false);
    expect(isHoveringPointer({ pointerType: '', buttons: 0 })).toBe(false);
  });
});

describe('createHoverGate', () => {
  it("reads a mouse event as its pointer's: a mouse hovers, a finger does not", () => {
    const gate = createHoverGate();
    gate.notePointer({ pointerType: 'mouse', buttons: 0 });
    expect(gate.isHover()).toBe(true);

    gate.notePointer({ pointerType: 'touch', buttons: 1 });
    expect(gate.isHover()).toBe(false);
  });

  it('reads a mouse event no pointer event came before as a mouse', () => {
    expect(createHoverGate().isHover()).toBe(true);
  });

  it("reads what was noted once: a mouse event after a finger's is not taken for the finger's", () => {
    const gate = createHoverGate();
    gate.notePointer({ pointerType: 'touch', buttons: 0 });
    expect(gate.isHover()).toBe(false);
    // a test's `mouseenter` alone, or a browser without pointer events
    expect(gate.isHover()).toBe(true);
  });
});

describe('a hover popover', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderTrigger = (props: Record<string, unknown> = {}) =>
    render(
      <ReqoreUIProvider>
        <ReqorePopover component='span' content='What it does' {...props}>
          Trigger
        </ReqorePopover>
      </ReqoreUIProvider>
    );

  const settle = () =>
    act(() => {
      vi.advanceTimersByTime(1000);
    });

  /** What the popover listens on: the wrapper around what it is the popover of. */
  const trigger = () =>
    screen.getByText('Trigger').closest('.reqore-popover-wrapper') as HTMLElement;

  it('opens for a mouse', () => {
    renderTrigger();
    mouseOnto(trigger());
    settle();

    expect(popovers()).toBe(1);
  });

  it('opens for a pen held above the screen', () => {
    renderTrigger();
    penAbove(trigger());
    settle();

    expect(popovers()).toBe(1);
  });

  it("opens for nothing at a finger's tap, nor at the mouseenter emulated after it", () => {
    renderTrigger();
    tapWithAFinger(trigger());
    settle();

    expect(popovers()).toBe(0);
  });

  it('opens for a mouse after a tap, as it did before it', () => {
    renderTrigger();
    const target = trigger();
    tapWithAFinger(target);
    fireEvent.mouseLeave(target);
    mouseOnto(target);
    settle();

    expect(popovers()).toBe(1);
  });

  it('opens at a mouseenter no pointer event came before (a test that fires it alone)', () => {
    renderTrigger();
    fireEvent.mouseEnter(trigger());
    settle();

    expect(popovers()).toBe(1);
  });

  it("that stays (hoverStay) opens for nothing at a finger's tap", () => {
    renderTrigger({ handler: 'hoverStay' });
    tapWithAFinger(trigger());
    settle();

    expect(popovers()).toBe(0);
  });

  it("kept open while hovered (keepOpenOnHover) opens for nothing at a finger's tap, and for a mouse", () => {
    renderTrigger({ keepOpenOnHover: true });
    const target = trigger();
    tapWithAFinger(target);
    settle();
    expect(popovers()).toBe(0);

    fireEvent.mouseLeave(target);
    mouseOnto(target);
    settle();
    expect(popovers()).toBe(1);
  });
});

describe('a popover opened by a tap or by focus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens at a tap where it is opened by a click, as touch-first tooltips are', () => {
    render(
      <ReqoreUIProvider>
        <ReqorePopover component='span' content='What it does' handler='click'>
          Trigger
        </ReqorePopover>
      </ReqoreUIProvider>
    );
    const trigger = screen.getByText('Trigger').closest('.reqore-popover-wrapper') as HTMLElement;
    tapWithAFinger(trigger);
    fireEvent.click(trigger);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(popovers()).toBe(1);
  });

  it('opens when the keyboard brings the focus to it', () => {
    render(
      <ReqoreUIProvider>
        <ReqorePopover component='span' content='What it does' handler='focus'>
          <input aria-label='Field' />
        </ReqorePopover>
      </ReqoreUIProvider>
    );
    act(() => {
      screen.getByLabelText('Field').focus();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(popovers()).toBe(1);
  });
});

describe("a panel's floating actions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom lays nothing out: the panel's top-right corner, where the actions float, is the panel's
    (document as any).elementFromPoint = () => document.querySelector('.with-floating-actions');
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (document as any).elementFromPoint;
  });

  const renderPanel = () =>
    render(
      <ReqoreUIProvider>
        <ReqorePanel
          className='with-floating-actions'
          label='Expression'
          floatingActions
          actions={[{ icon: 'DeleteBinLine', label: 'Remove', show: 'hover' }]}
        >
          content
        </ReqorePanel>
      </ReqoreUIProvider>
    );

  const panel = () => document.querySelector('.with-floating-actions') as HTMLElement;
  const floating = () => document.querySelector('.reqore-panel-floating-actions');
  const settle = () =>
    act(() => {
      vi.advanceTimersByTime(300);
    });

  it('float for a mouse', () => {
    renderPanel();
    mouseOnto(panel());
    settle();

    expect(floating()).not.toBeNull();
  });

  it("float for nothing at a finger's tap", () => {
    renderPanel();
    tapWithAFinger(panel());
    settle();

    expect(floating()).toBeNull();
  });
});
