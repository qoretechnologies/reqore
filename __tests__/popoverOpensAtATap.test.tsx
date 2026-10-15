/**
 * A popover meant to be reached opens at a tap.
 *
 * A finger cannot hover, so the hover gate turns away the `mouseenter` a browser emulates after a
 * tap (`createHoverGate`). For a plain hover tooltip that is the point: it does not pop open under
 * the finger, `hoverStay` or not. But a hover popover that is a way in (`opensOnTap`: a tab bar's,
 * a segmented control's or a breadcrumb trail's More menu, any dropdown) and one held open while
 * hovered (`keepOpenOnHover`) opened on nothing else, so on a phone the hidden tabs, segments and
 * crumbs could not be reached. They open on the tap's click now, and close as a click popover's do.
 * `keepOpenOnHover` with `handler: 'click'` (or `'focus'`) listens to its own event as well as to
 * the hover: before, it heard only the hover, and a tap opened nothing (qorus-ide: `handler =
 * isHoverCapable ? 'hover' : 'click'` with `keepOpenOnHover`).
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReqoreLayoutContent, ReqorePopover, ReqoreTabs, ReqoreUIProvider } from '../src/index';

/**
 * A finger's tap on `el`, as a browser sends it: its pointer events, the mouse events it emulates
 * and its click.
 */
const tapWithAFinger = (el: Element) => {
  fireEvent.pointerOver(el, { pointerType: 'touch', buttons: 1 });
  fireEvent.pointerEnter(el, { pointerType: 'touch', buttons: 1 });
  fireEvent.pointerDown(el, { pointerType: 'touch', buttons: 1 });
  fireEvent.pointerUp(el, { pointerType: 'touch', buttons: 0 });
  fireEvent.pointerOut(el, { pointerType: 'touch', buttons: 0 });
  fireEvent.pointerLeave(el, { pointerType: 'touch', buttons: 0 });
  fireEvent.mouseOver(el);
  fireEvent.mouseEnter(el);
  fireEvent.mouseMove(el);
  fireEvent.mouseDown(el);
  fireEvent.mouseUp(el);
  fireEvent.click(el);
};

/** A mouse coming to rest on `el`. */
const mouseOnto = (el: Element) => {
  fireEvent.pointerEnter(el, { pointerType: 'mouse', buttons: 0 });
  fireEvent.mouseEnter(el);
};

/** A mouse's click on `el` it rests on. */
const mouseClick = (el: Element) => {
  fireEvent.pointerDown(el, { pointerType: 'mouse', buttons: 1 });
  fireEvent.mouseDown(el);
  fireEvent.pointerUp(el, { pointerType: 'mouse', buttons: 0 });
  fireEvent.mouseUp(el);
  fireEvent.click(el);
};

const popovers = () => document.querySelectorAll('.reqore-popover-content');

describe('a popover meant to be reached', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderTrigger = (props: Record<string, unknown> = {}) =>
    render(
      <ReqoreUIProvider>
        <ReqorePopover component='span' content='What it holds' {...props}>
          Trigger
        </ReqorePopover>
        <span>Elsewhere</span>
      </ReqoreUIProvider>
    );

  const settle = () =>
    act(() => {
      vi.advanceTimersByTime(1000);
    });

  /** What the popover listens on: the wrapper around what it is the popover of. */
  const trigger = () =>
    screen.getByText('Trigger').closest('.reqore-popover-wrapper') as HTMLElement;

  it('that stays (hoverStay) opens at a tap, and a tap elsewhere closes it', () => {
    renderTrigger({ handler: 'hoverStay', opensOnTap: true });
    tapWithAFinger(trigger());
    settle();
    expect(popovers()).toHaveLength(1);

    tapWithAFinger(screen.getByText('Elsewhere'));
    settle();
    expect(popovers()).toHaveLength(0);
  });

  it('that stays (hoverStay) opens at once at a tap, without the delay a hover waits', () => {
    renderTrigger({ handler: 'hoverStay', opensOnTap: true, delay: 500 });
    tapWithAFinger(trigger());

    expect(popovers()).toHaveLength(1);
  });

  it('that stays (hoverStay) opens for a mouse on its hover, and its click closes nothing', () => {
    renderTrigger({ handler: 'hoverStay', opensOnTap: true });
    mouseOnto(trigger());
    settle();
    expect(popovers()).toHaveLength(1);

    mouseClick(trigger());
    settle();
    expect(popovers()).toHaveLength(1);
  });

  it('that stays (hoverStay) opens for nothing at a mouse click no hover came before', () => {
    renderTrigger({ handler: 'hoverStay', opensOnTap: true });
    mouseClick(trigger());
    settle();

    expect(popovers()).toHaveLength(0);
  });

  it('kept open while hovered (keepOpenOnHover) opens at a tap', () => {
    renderTrigger({ keepOpenOnHover: true });
    tapWithAFinger(trigger());
    settle();

    expect(popovers()).toHaveLength(1);
  });

  it('kept open while hovered, opened by a click, opens at a tap; a second tap closes it', () => {
    renderTrigger({ keepOpenOnHover: true, handler: 'click' });
    tapWithAFinger(trigger());
    settle();
    expect(popovers()).toHaveLength(1);

    // the emulated mouse is still on the trigger: the second tap sends no mouseenter
    fireEvent.pointerDown(trigger(), { pointerType: 'touch', buttons: 1 });
    fireEvent.pointerUp(trigger(), { pointerType: 'touch', buttons: 0 });
    fireEvent.click(trigger());
    settle();
    expect(popovers()).toHaveLength(0);
  });

  it('kept open while hovered, opened by a click, opens for a mouse; its click keeps it', () => {
    renderTrigger({ keepOpenOnHover: true, handler: 'click' });
    mouseOnto(trigger());
    settle();
    expect(popovers()).toHaveLength(1);

    mouseClick(trigger());
    settle();
    expect(popovers()).toHaveLength(1);
  });

  it('kept open while hovered, opened by focus, opens when the keyboard brings the focus', () => {
    render(
      <ReqoreUIProvider>
        <ReqorePopover component='span' content='What it holds' handler='focus' keepOpenOnHover>
          <input aria-label='Field' />
        </ReqorePopover>
      </ReqoreUIProvider>
    );
    act(() => {
      screen.getByLabelText('Field').focus();
    });
    settle();

    expect(popovers()).toHaveLength(1);
  });
});

describe('a plain hover tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('that stays (hoverStay) but is no way in opens for nothing at a tap', () => {
    render(
      <ReqoreUIProvider>
        <ReqorePopover component='span' content='What it does' handler='hoverStay'>
          Trigger
        </ReqorePopover>
      </ReqoreUIProvider>
    );
    tapWithAFinger(screen.getByText('Trigger').closest('.reqore-popover-wrapper') as HTMLElement);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(popovers()).toHaveLength(0);
  });

  it('opens for nothing at a tap, its click included', () => {
    render(
      <ReqoreUIProvider>
        <ReqorePopover component='span' content='What it does'>
          Trigger
        </ReqorePopover>
      </ReqoreUIProvider>
    );
    tapWithAFinger(screen.getByText('Trigger').closest('.reqore-popover-wrapper') as HTMLElement);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(popovers()).toHaveLength(0);
  });
});

describe("a tab bar's More menu", () => {
  it('opens at a tap and lists the tabs it hides', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            _testWidth={300}
            tabs={[
              { label: 'Tab 1', icon: 'Home3Line', id: 'tab1' },
              { label: 'Tab 2', icon: 'Home3Line', id: 'tab2' },
              { label: 'Tab 3', icon: 'Home3Line', id: 'tab3' },
              { label: 'Tab 4', icon: 'Home3Line', id: 'tab4' },
              { label: 'Tab 5', icon: 'Home3Line', id: 'tab5' },
            ]}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    tapWithAFinger(document.querySelector('.reqore-tabs-list-item-menu')!);

    expect(popovers()).toHaveLength(1);
    expect(document.querySelectorAll('.reqore-menu-item')).toHaveLength(3);
  });
});
