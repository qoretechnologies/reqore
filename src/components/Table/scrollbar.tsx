import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getMainBackgroundColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';

export interface IReqoreTableScrollbarProps {
  /** The native-scrollable element this thumb mirrors. */
  targetRef: React.RefObject<HTMLElement>;
  /** Milliseconds of inactivity after which the thumb fades out. Default `1200`. */
  idleTimeoutMs?: number;
}

/** Minimum thumb height so it stays grabbable on very long content. */
const MIN_THUMB_HEIGHT = 24;

interface IStyledTrackProps {
  theme: IReqoreTheme;
}

const StyledTrack = styled.div<IStyledTrackProps>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 10px;
  // The track itself doesn't intercept clicks — only the thumb does — so a
  // user can still interact with cells along the table's right edge.
  pointer-events: none;
  user-select: none;
  z-index: 2;
`;

interface IStyledThumbProps {
  theme: IReqoreTheme;
  $height: number;
  $top: number;
  $dragging: boolean;
  $idle: boolean;
}

const StyledThumb = styled.div<IStyledThumbProps>`
  position: absolute;
  right: 2px;
  width: 6px;
  height: ${({ $height }) => $height}px;
  transform: translateY(${({ $top }) => $top}px);
  border-radius: 3px;
  background-color: ${({ theme }) => changeLightness(getMainBackgroundColor(theme), 0.22)};
  // When idle the thumb is fully invisible AND non-interactive — without
  // 'pointer-events: none' an invisible thumb would still swallow clicks
  // along the body's right edge.
  pointer-events: ${({ $idle }) => ($idle ? 'none' : 'auto')};
  cursor: pointer;
  opacity: ${({ $idle, $dragging }) => ($idle ? 0 : $dragging ? 0.85 : 0.55)};
  transition:
    opacity 0.3s ease-out,
    background-color 0.15s ease-out;

  &:hover {
    opacity: ${({ $idle, $dragging }) => ($idle ? 0 : $dragging ? 0.85 : 0.85)};
  }
`;

interface IScrollbarMetrics {
  thumbHeight: number;
  thumbTop: number;
  visible: boolean;
}

/**
 * Overlay scrollbar for the virtualized table body.
 *
 * The native scrollbar is hidden via CSS on the scroll container so it does
 * not eat inline space — that way the header and body always render at the
 * same width and no measurement chain is needed to keep them aligned. This
 * component then renders a thumb absolutely over the right edge, driven by
 * the body's scroll state.
 *
 * Scrolling itself still uses the browser's native overflow behaviour — the
 * thumb is purely visual + a drag handle. Wheel, trackpad, touch and
 * keyboard scrolling all keep working without us re-implementing them.
 *
 * Macos-style auto-hide: the thumb appears on scroll / drag / hover and
 * fades out after `idleTimeoutMs` of no activity.
 */
export const ReqoreTableScrollbar = memo(
  ({ targetRef, idleTimeoutMs = 1200 }: IReqoreTableScrollbarProps) => {
    const theme = useReqoreTheme();
    const trackRef = useRef<HTMLDivElement>(null);
    const [metrics, setMetrics] = useState<IScrollbarMetrics>({
      thumbHeight: 0,
      thumbTop: 0,
      visible: false,
    });
    const [dragging, setDragging] = useState(false);
    const [idle, setIdle] = useState(true);
    const idleTimerRef = useRef<number | null>(null);
    // Mirror the dragging state in a ref so handlers can read it without
    // re-creating themselves on every drag-state change.
    const draggingRef = useRef(false);
    // Snapshot of where the drag started so we can scroll by deltaY each move.
    const dragState = useRef<{ startY: number; startScrollTop: number } | null>(null);

    const clearIdleTimer = useCallback(() => {
      if (idleTimerRef.current !== null) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    }, []);

    const scheduleHide = useCallback(() => {
      clearIdleTimer();
      idleTimerRef.current = window.setTimeout(() => {
        setIdle(true);
        idleTimerRef.current = null;
      }, idleTimeoutMs);
    }, [clearIdleTimer, idleTimeoutMs]);

    const wakeUp = useCallback(() => {
      clearIdleTimer();
      setIdle(false);
    }, [clearIdleTimer]);

    const computeMetrics = useCallback(() => {
      const el = targetRef.current;
      const track = trackRef.current;

      if (!el || !track) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = el;

      if (scrollHeight <= clientHeight) {
        setMetrics((prev) =>
          prev.visible ? { thumbHeight: 0, thumbTop: 0, visible: false } : prev
        );
        return;
      }

      const trackHeight = track.clientHeight;
      const rawThumbHeight = (clientHeight / scrollHeight) * trackHeight;
      const thumbHeight = Math.max(MIN_THUMB_HEIGHT, rawThumbHeight);
      const maxScrollTop = scrollHeight - clientHeight;
      const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
      const thumbTop = maxScrollTop === 0 ? 0 : (scrollTop / maxScrollTop) * maxThumbTop;

      setMetrics((prev) =>
        prev.visible && prev.thumbHeight === thumbHeight && prev.thumbTop === thumbTop
          ? prev
          : { thumbHeight, thumbTop, visible: true }
      );
    }, [targetRef]);

    // Initial measurement after mount (the track ref needs a layout pass).
    useLayoutEffect(() => {
      computeMetrics();
    }, [computeMetrics]);

    // Watch scroll on the body and content/container size changes via
    // ResizeObserver. Observing the inner sized div (react-window's content
    // element) catches itemCount changes; observing the outer catches
    // container resizes. Together they cover every cause of a size change.
    useEffect(() => {
      const el = targetRef.current;

      if (!el) {
        return undefined;
      }

      const handleScroll = () => {
        computeMetrics();
        wakeUp();
        scheduleHide();
      };
      el.addEventListener('scroll', handleScroll, { passive: true });

      if (typeof ResizeObserver === 'undefined') {
        return () => el.removeEventListener('scroll', handleScroll);
      }

      const observer = new ResizeObserver(() => computeMetrics());
      observer.observe(el);
      if (el.firstElementChild) {
        observer.observe(el.firstElementChild);
      }

      return () => {
        el.removeEventListener('scroll', handleScroll);
        observer.disconnect();
      };
    }, [targetRef, computeMetrics, wakeUp, scheduleHide]);

    // Clear pending idle timer on unmount.
    useEffect(() => clearIdleTimer, [clearIdleTimer]);

    const handlePointerDown = useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        const el = targetRef.current;
        if (!el) {
          return;
        }

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragState.current = { startY: event.clientY, startScrollTop: el.scrollTop };
        draggingRef.current = true;
        setDragging(true);
        wakeUp();
      },
      [targetRef, wakeUp]
    );

    const handlePointerMove = useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current) {
          return;
        }

        const el = targetRef.current;
        const track = trackRef.current;
        if (!el || !track) {
          return;
        }

        const deltaY = event.clientY - dragState.current.startY;
        const maxScrollTop = el.scrollHeight - el.clientHeight;
        const maxThumbTop = Math.max(0, track.clientHeight - metrics.thumbHeight);

        if (maxThumbTop <= 0 || maxScrollTop <= 0) {
          return;
        }

        const scrollDelta = (deltaY / maxThumbTop) * maxScrollTop;
        el.scrollTop = dragState.current.startScrollTop + scrollDelta;
      },
      [metrics.thumbHeight, targetRef]
    );

    const handlePointerUp = useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        dragState.current = null;
        draggingRef.current = false;
        setDragging(false);
        scheduleHide();
      },
      [scheduleHide]
    );

    // Hover keeps the thumb visible while the cursor is on it, so the user
    // has time to grab it. On leave, schedule another hide unless mid-drag
    // (pointer-up will handle hiding once the drag ends).
    const handlePointerEnter = useCallback(() => {
      wakeUp();
    }, [wakeUp]);

    const handlePointerLeave = useCallback(() => {
      if (!draggingRef.current) {
        scheduleHide();
      }
    }, [scheduleHide]);

    return (
      <StyledTrack ref={trackRef} theme={theme} className='reqore-table-scrollbar' aria-hidden>
        {metrics.visible && (
          <StyledThumb
            theme={theme}
            $height={metrics.thumbHeight}
            $top={metrics.thumbTop}
            $dragging={dragging}
            $idle={idle}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            className='reqore-table-scrollbar-thumb'
          />
        )}
      </StyledTrack>
    );
  }
);

export default ReqoreTableScrollbar;
