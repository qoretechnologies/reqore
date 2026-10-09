import { RefObject, useEffect, useRef } from 'react';

/**
 * How far the pointer must travel before a press becomes a drag.
 *
 * Zero would make every click a one-pixel drag and swallow it; too large and the
 * row feels stuck before it moves. Four pixels is the usual hysteresis for
 * distinguishing a click from a drag.
 */
export const DRAG_TO_SCROLL_THRESHOLD = 4;

/**
 * Elements a drag must never start on.
 *
 * Deliberately NOT "anything interactive". The surfaces this is built for are made
 * OF interactive things - a rail of clickable KPI tiles, a table header of sort
 * buttons - so excluding buttons would leave nowhere to grab and the feature would
 * do nothing. Their clicks are protected instead by suppressing the click that
 * follows a real drag, which is what makes press-and-release still activate a
 * tile while press-and-pull scrolls past it.
 *
 * What IS excluded is text entry, where a press-and-move already means
 * "select within this value" and there is no other way to ask for it, and anything
 * marked `reqore-no-drag-scroll`: a grab handle of its own (a column's resize handle),
 * where a press-and-move already means something else.
 */
export const NON_DRAGGABLE =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], .reqore-no-drag-scroll';

export interface IUseDragToScrollOptions {
  /** What scrolls sideways. */
  scrollRef: RefObject<HTMLElement>;
  /**
   * Where the gesture is taken, when that is not the scroller itself: a table's
   * header, which is scrolled with its body but is not a scroller of its own.
   */
  handleRef?: RefObject<HTMLElement>;
  /** Mouse and pen: press and pull sideways to scroll. */
  mouse?: boolean;
  /**
   * Touch: a sideways swipe on the handle scrolls the scroller. Only for a handle
   * the browser cannot pan by itself (it does not overflow-scroll); on a real
   * scroller touch already pans natively, and taking it over would replace that.
   * The handle's own CSS must leave sideways panning to the page script
   * (`touch-action: pan-y`), or the browser cancels the pointer before it moves.
   */
  touch?: boolean;
  /** Set on the handle while a drag is engaged. */
  draggingClass?: string;
}

/**
 * Press and pull a sideways-scrolling surface to scroll it.
 *
 * Shared by `ReqoreFadeScroller` (`dragToScroll`) and `ReqoreTable` (`dragToScroll`,
 * and its header's touch swipes): one implementation of the gesture, so a fix to it
 * reaches every surface.
 */
export const useDragToScroll = ({
  scrollRef,
  handleRef,
  mouse = false,
  touch = false,
  draggingClass,
}: IUseDragToScrollOptions) => {
  /* What the gesture is bound to. The elements can come and go after the hook
     mounts - a table renders no body until it has rows - so every commit compares
     them with what is bound and rebinds when they changed, instead of binding once
     on mount and silently never seeing a body that appeared later. */
  const bound = useRef<{
    scroller: HTMLElement;
    handle: HTMLElement;
    key: string;
    unbind: () => void;
  }>();

  useEffect(() => {
    const scroller = scrollRef.current;
    const handle = handleRef ? handleRef.current : scroller;
    const key = `${mouse}:${touch}:${draggingClass ?? ''}`;

    if (
      bound.current &&
      bound.current.scroller === scroller &&
      bound.current.handle === handle &&
      bound.current.key === key
    ) {
      return;
    }
    bound.current?.unbind();
    bound.current = undefined;

    if ((!mouse && !touch) || !scroller || !handle) {
      return;
    }
    bound.current = {
      scroller,
      handle,
      key,
      unbind: bind(scroller, handle, mouse, touch, draggingClass),
    };
  });

  // Unbound when the component goes, whatever is bound then.
  useEffect(
    () => () => {
      bound.current?.unbind();
      bound.current = undefined;
    },
    []
  );
};

/** Binds the gesture; returns what unbinds it. */
const bind = (
  scroller: HTMLElement,
  handle: HTMLElement,
  mouse: boolean,
  touch: boolean,
  draggingClass: string | undefined
): (() => void) => {
  {
    let activePointer: number | undefined;
    let startX = 0;
    let startScrollLeft = 0;
    let engaged = false;
    // Set when a drag actually moved the surface, and consumed by the click that
    // the browser fires next. Without it, pulling sideways and letting go on top
    // of a clickable tile ALSO activates that tile.
    let swallowNextClick = false;

    /* The live gesture is tracked on the WINDOW, not on the handle.
     *
     * A pull leaves the handle almost immediately - the edges are where you are
     * pulling TO - and the release can land anywhere, including outside the
     * browser window entirely. Listening on the handle alone meant a release it
     * never saw left `activePointer` set: the next move over it resumed the drag
     * with no button held, and there was no way to let go.
     *
     * Pointer capture alone does not cover this - it is taken only once the drag
     * ENGAGES, and a fast pull can be past the edge before the first qualifying
     * move arrives.
     *
     * Bound per-gesture rather than permanently, so an idle surface adds no global
     * pointermove listener. */
    const stopTracking = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      window.removeEventListener('lostpointercapture', onPointerEnd);
      window.removeEventListener('blur', endGesture);
    };

    const startTracking = () => {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerEnd);
      window.addEventListener('pointercancel', onPointerEnd);
      window.addEventListener('lostpointercapture', onPointerEnd);
      // Alt-tabbing mid-pull: the release happens in another window.
      window.addEventListener('blur', endGesture);
    };

    /* Ends the gesture however it got here - a normal release, a release the page
     * never saw, a cancelled pointer, or the window losing focus. Idempotent:
     * `activePointer` is cleared before the capture is released, so the
     * `lostpointercapture` our own release fires re-enters and returns. */
    const endGesture = () => {
      if (activePointer === undefined) {
        return;
      }

      const pointerId = activePointer;

      activePointer = undefined;
      stopTracking();

      if (handle.hasPointerCapture?.(pointerId)) {
        handle.releasePointerCapture(pointerId);
      }

      if (engaged) {
        engaged = false;
        if (draggingClass) {
          handle.classList.remove(draggingClass);
        }
      }
    };

    const onPointerEnd = (event: PointerEvent) => {
      if (activePointer === undefined || event.pointerId !== activePointer) {
        return;
      }
      /* Only the capture THIS gesture took ends it. A finger's pointer is captured by
         the element it lands on (implicit touch capture); taking the capture for the
         handle moves it away from that element, which then reports losing it - and
         that is the drag starting, not ending. Ending there stopped a swipe on a
         table's header after its first few pixels. */
      if (event.type === 'lostpointercapture' && event.target !== handle) {
        return;
      }
      endGesture();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (activePointer === undefined || event.pointerId !== activePointer) {
        return;
      }

      /* Nothing is held down, so the button came up somewhere this page could
       * never observe it - off the edge of the window, the usual way. Recover on
       * the first move back rather than wait for a pointerup that is never coming;
       * `buttons` is a bitmask of what is CURRENTLY pressed, so during a real drag
       * (or a finger on the screen) it can only be non-zero. */
      if (event.buttons === 0) {
        endGesture();
        return;
      }

      const distance = event.clientX - startX;

      if (!engaged) {
        // Below the threshold this is still a click, so do nothing at all - not
        // even preventDefault, which would break focus on the target.
        if (Math.abs(distance) < DRAG_TO_SCROLL_THRESHOLD) {
          return;
        }
        engaged = true;
        swallowNextClick = true;
        if (draggingClass) {
          handle.classList.add(draggingClass);
        }
        // Capture keeps the moves addressed to the handle while the pointer is over
        // other elements. The window listeners are what make the drag survive
        // leaving it; this is what keeps hover states elsewhere quiet.
        try {
          handle.setPointerCapture(event.pointerId);
        } catch {
          // Capture is a nicety, not the mechanism.
        }
      }

      // Stops the browser starting a native text/image drag mid-pull.
      event.preventDefault();
      scroller.scrollLeft = startScrollLeft - distance;
    };

    const onPointerDown = (event: PointerEvent) => {
      /* Before any guard. A previous gesture whose click never arrived - released
       * off-window, so nothing followed it - leaves this armed, and the next
       * genuine click would be eaten. A fresh press always makes the previous
       * gesture's click moot, INCLUDING a press this handler goes on to decline. */
      swallowNextClick = false;

      if (event.pointerType === 'touch') {
        // A real scroller pans natively under a finger, and long-press selects.
        if (!touch) {
          return;
        }
      } else {
        if (!mouse) {
          return;
        }
        // Middle/right are paste and context menu.
        if (event.button !== 0) {
          return;
        }
        // Shift is the documented escape hatch to "select instead of drag".
        if (event.shiftKey) {
          return;
        }
      }
      if ((event.target as HTMLElement | null)?.closest?.(NON_DRAGGABLE)) {
        return;
      }
      // Nothing to scroll: leave the press alone entirely so a click on a surface
      // that happens to fit behaves exactly as it did before.
      if (scroller.scrollWidth <= scroller.clientWidth) {
        return;
      }

      activePointer = event.pointerId;
      startX = event.clientX;
      startScrollLeft = scroller.scrollLeft;
      engaged = false;
      startTracking();
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!swallowNextClick) {
        return;
      }
      swallowNextClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    // A native drag beats pointer events to the punch on links and images.
    const onDragStart = (event: DragEvent) => {
      if (engaged) {
        event.preventDefault();
      }
    };

    handle.addEventListener('pointerdown', onPointerDown);
    handle.addEventListener('dragstart', onDragStart);
    // Capture phase: the click has to be stopped before it reaches the tile.
    handle.addEventListener('click', onClickCapture, true);

    return () => {
      handle.removeEventListener('pointerdown', onPointerDown);
      handle.removeEventListener('dragstart', onDragStart);
      handle.removeEventListener('click', onClickCapture, true);
      // A gesture live at unmount would otherwise leave window listeners behind.
      stopTracking();
      if (draggingClass) {
        handle.classList.remove(draggingClass);
      }
    };
  }
};
