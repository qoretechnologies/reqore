import { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from 'react';

export interface IReqoreScrollFadeMeasurement {
  /** Content is scrolled out of view past the start edge (left / top). */
  start: boolean;
  /** Content is scrolled out of view past the end edge (right / bottom). */
  end: boolean;
  /** The content is wider / taller than the scroll box at all. */
  overflows: boolean;
  /** The scroll box that was measured. */
  element: HTMLElement;
}

export interface IReqoreScrollFadeOptions {
  /** The box that scrolls. */
  scrollRef: RefObject<HTMLElement | null | undefined>;
  /**
   * The element that carries the edge classes — normally the overlay wrapper
   * whose `::before` / `::after` paint the fades. Defaults to the scroll box.
   */
  targetRef?: RefObject<HTMLElement | null | undefined>;
  /**
   * Which axis scrolls.
   * @default x
   */
  axis?: 'x' | 'y';
  /** Class toggled on the target while content is hidden past the start edge (left / top). */
  startClassName: string;
  /** Class toggled on the target while content is hidden past the end edge (right / bottom). */
  endClassName: string;
  /**
   * When `false` both classes are cleared regardless of the measurement (the
   * fades are off). `onMeasure` still fires.
   * @default true
   */
  enabled?: boolean;
  /**
   * Runs after every measurement with the raw result, for anything else that
   * should follow the same pass (a drag cursor, a "more" hint) — so it can never
   * disagree with the fades about whether the box overflows.
   */
  onMeasure?: (measurement: IReqoreScrollFadeMeasurement) => void;
}

/**
 * Measures which edges of a scroll box still have content out of view and carries
 * the answer as CLASSES on a target element — never as React state.
 *
 * A fade is a measurement. Routing a measurement through state means a layout
 * effect that runs after every render and calls `setState`, guarded only by
 * comparing booleans: correct while the measurement is stable, and an unbreakable
 * render loop the moment it is not. Toggling a class cannot re-enter the render at
 * all, and that is what lets the pass run after EVERY render — which it must,
 * because children change size without the scroll box resizing (a label loads, an
 * item is removed).
 *
 * Re-measures on scroll, on resize (`ResizeObserver`, degrading gracefully where it
 * is unavailable) and after every render. Shared by `ReqoreFadeScroller` (x) and
 * the expanded, scrolling `ReqoreNavRail` (y).
 *
 * @returns the measurement pass, for callers that need to trigger it by hand.
 */
export const useScrollFade = ({
  scrollRef,
  targetRef,
  axis = 'x',
  startClassName,
  endClassName,
  enabled = true,
  onMeasure,
}: IReqoreScrollFadeOptions): (() => void) => {
  // Read inside `update`, which is deliberately dependency-free so it can be
  // handed to listeners and observers once and never rebuilt.
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const onMeasureRef = useRef(onMeasure);
  onMeasureRef.current = onMeasure;
  const classNamesRef = useRef({ startClassName, endClassName });
  classNamesRef.current = { startClassName, endClassName };

  const update = useCallback(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const vertical = axis === 'y';
    const position = vertical ? element.scrollTop : element.scrollLeft;
    const viewport = vertical ? element.clientHeight : element.clientWidth;
    const total = vertical ? element.scrollHeight : element.scrollWidth;
    const start = position > 1;
    const end = position + viewport < total - 1;
    const target = targetRef?.current ?? element;
    const on = enabledRef.current;

    target.classList.toggle(classNamesRef.current.startClassName, on && start);
    target.classList.toggle(classNamesRef.current.endClassName, on && end);

    onMeasureRef.current?.({ start, end, overflows: total > viewport, element });
  }, [scrollRef, targetRef, axis]);

  // After every render: it only writes classes, so there is no state for it to
  // feed back into and nothing to guard.
  useLayoutEffect(update);

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return undefined;
    }

    element.addEventListener('scroll', update, { passive: true });

    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);

    observer?.observe(element);

    return () => {
      element.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [scrollRef, update]);

  return update;
};
