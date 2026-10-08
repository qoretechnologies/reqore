import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SWIPE } from '../helpers/gestures';

/** The axis a drag is on. */
export type TPointerDragAxis = 'x' | 'y' | 'both';

/** Where a drag has got to. */
export interface IPointerDragDelta {
  /** How far the pointer is from where it was pressed, in px. */
  dx: number;
  dy: number;
  /** How fast it moved last, in px per ms; `0` until it has moved twice. */
  vx: number;
  vy: number;
}

/**
 * The controls a press belongs to rather than to the surface around them: a button (a close
 * control, an action), a link, a field, and the control group actions sit in. For a `canStart`
 * that leaves those alone, as the drawer's title bar and a notification do.
 */
export const DRAG_CONTROL_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [contenteditable], .reqore-control-group';

export interface IUsePointerDragOptions {
  /** Off, every handler is inert and a press is just a press. Default `true`. */
  enabled?: boolean;
  /**
   * Along `'x'` or `'y'`, a press that first moves mostly along the OTHER axis is not a drag: it
   * is left to whatever that axis belongs to, which is usually the page or the content
   * scrolling. `'both'` takes any direction. Default `'both'`.
   */
  axis?: TPointerDragAxis;
  /** How far a press moves, in px, before it is a drag and not a click. Default `SWIPE.slop`. */
  slop?: number;
  /**
   * Whether `dragging` is kept as state, so the element re-renders as a drag starts and ends.
   * `false` for a surface that must not re-render mid-gesture — a rail of memoized tiles — which
   * then carries its own drag state in `onStart` / `onEnd`. Default `true`.
   */
  trackDragging?: boolean;
  /** Whether a press on this target may become a drag. Default: any primary-button press. */
  canStart?: (event: React.PointerEvent<HTMLElement>) => boolean;
  /** The press on `element` has moved past `slop` along the axis and is now a drag. */
  onStart?: (element: HTMLElement, event: PointerEvent) => void;
  /** The pointer moved while dragging. */
  onMove?: (delta: IPointerDragDelta, event: PointerEvent) => void;
  /**
   * The drag ended: `committed` when the pointer was let go, not when the browser cancelled it
   * (a touch the system took over), the window lost focus, or a mouse was let go off-window.
   */
  onEnd?: (delta: IPointerDragDelta, committed: boolean) => void;
}

/** The handlers to spread onto the element that takes the drag. */
export interface IPointerDragHandlers {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  /** Swallows the click a drag ends with, so it is not a click on whatever it ended over. */
  onClickCapture: (event: React.MouseEvent<HTMLElement>) => void;
  /** Keeps the browser's own drag-and-drop (an image, a link, selected text) out of a drag. */
  onDragStart: (event: React.DragEvent<HTMLElement>) => void;
}

export interface IUsePointerDrag {
  /** Whether a drag is under way (always `false` with `trackDragging: false`). */
  dragging: boolean;
  handlers: IPointerDragHandlers;
}

interface IPointerGesture {
  pointerId: number;
  /** The element the handlers are on; it captures the pointer once the press is a drag. */
  element: HTMLElement;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  vx: number;
  vy: number;
  dragging: boolean;
}

/**
 * A pointer drag — mouse, touch or pen — on one element: a press becomes a drag once it has
 * moved past `slop` along the right axis, every move reports the distance from the press and
 * the latest velocity, and the click a drag would end with is swallowed. The one gesture a
 * sheet is pushed away with, a modal moved by, a tier stack swiped and a scroller pulled.
 *
 * The live gesture is tracked on the WINDOW, not on the element. A pull leaves a thin handle
 * at once and the release can land anywhere, including outside the browser window; an element
 * listening only to itself would never see that release and would stay stuck to the pointer.
 * Pointer capture alone does not cover it, because capture is taken only once the drag engages
 * and a fast pull is past the element before the first qualifying move. The listeners are
 * bound per gesture, so an idle element adds no global listener, and the gesture also ends on
 * a move with no button held (a release the page never saw) and when the window loses focus.
 *
 * The handlers never change identity; the options are read as they are when an event arrives.
 */
export const usePointerDrag = (options: IUsePointerDragOptions): IUsePointerDrag => {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const gestureRef = useRef<IPointerGesture | null>(null);
  const suppressClickRef = useRef(false);
  // Takes down the live gesture's window listeners; `null` while none is live.
  const stopTrackingRef = useRef<(() => void) | null>(null);
  const [dragging, setDragging] = useState(false);

  const finish = useCallback((committed: boolean) => {
    const gesture = gestureRef.current;

    gestureRef.current = null;
    stopTrackingRef.current?.();
    stopTrackingRef.current = null;

    if (!gesture?.dragging) {
      return;
    }

    if (gesture.element.hasPointerCapture?.(gesture.pointerId)) {
      gesture.element.releasePointerCapture(gesture.pointerId);
    }

    // The click that ends a drag is not a click on whatever it ended over. A mouse's click
    // follows its release at once; a touch drag produces none, so the flag is dropped on the
    // next turn of the event loop rather than left armed for a later, unrelated click.
    suppressClickRef.current = true;
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);

    if (optionsRef.current.trackDragging !== false) {
      setDragging(false);
    }

    optionsRef.current.onEnd?.(
      {
        dx: gesture.lastX - gesture.startX,
        dy: gesture.lastY - gesture.startY,
        vx: gesture.vx,
        vy: gesture.vy,
      },
      committed
    );
  }, []);

  const track = useCallback(() => {
    const onMove = (event: PointerEvent) => {
      const gesture = gestureRef.current;

      if (!gesture || gesture.pointerId !== event.pointerId) {
        return;
      }

      // Nothing is held, so the button came up somewhere this page could never observe it —
      // off the edge of the window, the usual way. `buttons` is what is pressed RIGHT NOW, so
      // during a real drag it can only be non-zero.
      if (event.buttons === 0) {
        finish(false);

        return;
      }

      const dx = event.clientX - gesture.startX;
      const dy = event.clientY - gesture.startY;

      if (!gesture.dragging) {
        const { axis = 'both', slop = SWIPE.slop } = optionsRef.current;

        if (Math.abs(dx) < slop && Math.abs(dy) < slop) {
          return;
        }

        // Mostly along the other axis: whatever that axis belongs to takes the press.
        if (
          (axis === 'x' && Math.abs(dy) >= Math.abs(dx)) ||
          (axis === 'y' && Math.abs(dx) >= Math.abs(dy))
        ) {
          finish(false);

          return;
        }

        gesture.dragging = true;

        // Capture keeps the moves addressed to the element while the pointer is over others;
        // the window listeners are what make the drag survive leaving it.
        try {
          gesture.element.setPointerCapture(event.pointerId);
        } catch {
          // Capture is a nicety, not the mechanism.
        }

        if (optionsRef.current.trackDragging !== false) {
          setDragging(true);
        }

        optionsRef.current.onStart?.(gesture.element, event);
      }

      const elapsed = event.timeStamp - gesture.lastTime;

      if (elapsed > 0) {
        gesture.vx = (event.clientX - gesture.lastX) / elapsed;
        gesture.vy = (event.clientY - gesture.lastY) / elapsed;
      }

      gesture.lastX = event.clientX;
      gesture.lastY = event.clientY;
      gesture.lastTime = event.timeStamp;

      optionsRef.current.onMove?.({ dx, dy, vx: gesture.vx, vy: gesture.vy }, event);
    };
    const onEnd = (event: PointerEvent) => {
      if (gestureRef.current?.pointerId === event.pointerId) {
        finish(event.type === 'pointerup');
      }
    };
    // Alt-tabbing mid-drag: the release happens in another window.
    const onBlur = () => finish(false);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    window.addEventListener('lostpointercapture', onEnd);
    window.addEventListener('blur', onBlur);

    stopTrackingRef.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      window.removeEventListener('lostpointercapture', onEnd);
      window.removeEventListener('blur', onBlur);
    };
  }, [finish]);

  // A gesture live at unmount would otherwise leave its window listeners behind.
  useEffect(
    () => () => {
      gestureRef.current = null;
      stopTrackingRef.current?.();
      stopTrackingRef.current = null;
    },
    []
  );

  const handlers = useMemo<IPointerDragHandlers>(
    () => ({
      onPointerDown: (event) => {
        // A fresh press ends a gesture whose release the page never saw, and makes its click
        // moot — INCLUDING a press this handler goes on to decline: pressing a field must not
        // inherit a swallow from a drag that ended somewhere the page did not see.
        if (gestureRef.current) {
          finish(false);
        }

        suppressClickRef.current = false;

        const { enabled = true, canStart } = optionsRef.current;

        if (
          !enabled ||
          (event.pointerType === 'mouse' && event.button !== 0) ||
          (canStart && !canStart(event))
        ) {
          return;
        }

        gestureRef.current = {
          pointerId: event.pointerId,
          element: event.currentTarget,
          startX: event.clientX,
          startY: event.clientY,
          lastX: event.clientX,
          lastY: event.clientY,
          lastTime: event.timeStamp,
          vx: 0,
          vy: 0,
          dragging: false,
        };
        track();
      },
      onClickCapture: (event) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          event.preventDefault();
          event.stopPropagation();
        }
      },
      // A native drag beats pointer events to the punch on links and images; one that starts
      // after the press became a drag is ours.
      onDragStart: (event) => {
        if (gestureRef.current?.dragging) {
          event.preventDefault();
        }
      },
    }),
    [finish, track]
  );

  return { dragging, handlers };
};
