import { Placement } from '@popperjs/core';
import React, { forwardRef, memo, MutableRefObject, useCallback, useEffect, useRef } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';
import styled from 'styled-components';
import { useReqoreProperty } from '../..';
import type { IReqoreOptions } from '../../containers/UIProvider';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import type {
  IReqoreComponent,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFlat,
  IWithReqoreMinimal,
} from '../../types/global';
import type { IReqoreIconName } from '../../types/icons';
import InternalPopover from '../InternalPopover';

export interface IReqorePopoverProps
  extends IReqoreComponent,
    IWithReqoreCustomTheme,
    IPopoverOptions {
  component: any;
  componentProps?: any;
  children?: any;
  isReqoreComponent?: boolean;
  wrapperTag?: string;
  wrapperStyle?: React.CSSProperties;
}

export interface IPopoverControls {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
}

export interface IPopover
  extends IReqoreIntent,
    IWithReqoreMinimal,
    IWithReqoreEffect,
    IWithReqoreFlat {
  content?: JSX.Element | string | undefined;
  handler?: 'hover' | 'click' | 'focus' | 'hoverStay';
  placement?: Placement;
  show?: boolean;
  openOnMount?: boolean;
  noArrow?: boolean;
  noWrapper?: boolean;
  useTargetWidth?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnAnyClick?: boolean;
  closeOnInsideClick?: boolean;
  closeOnTargetClick?: boolean;
  delay?: number;
  keepOpenOnHover?: boolean;
  offsetX?: number;
  offsetY?: number;
  blur?: boolean;
  /**
   * Whether the popover's own surface takes the pointer.
   *
   * Defaults to `true` for every popover the pointer can actually reach — one
   * opened by `click` or `focus`, one held open with `keepOpenOnHover`, one
   * that stays open after a hover (`hoverStay`) — and to `false` for a plain
   * hover tooltip, which it cannot.
   *
   * A plain hover popover closes as soon as the pointer is off it, so a pointer
   * moving onto it unmounts it on the way: nothing inside one has ever been
   * clickable, hoverable or scrollable. What its surface CAN do is sit in
   * the pointer's path — over the thing the tooltip describes, or over the
   * trigger itself — and take the hover away from what it covers, which reads
   * as a tooltip flickering out mid-sentence and as an element that cannot be
   * clicked while its neighbour's tooltip is up. So it does not take the
   * pointer, and the pointer lands on what is underneath.
   *
   * Set it explicitly to override either default: `true` for a hover popover
   * that must catch the pointer for its own reasons, `false` for a click or
   * focus popover that must let it through.
   *
   * Not to be confused with `keepOpenOnHover`, which is what actually makes a
   * hover popover reachable — and which turns this on by itself.
   */
  interactive?: boolean;
  transparent?: boolean;
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;
  icon?: IReqoreIconName;
  title?: string;
  updater?: string | number;
  uiScale?: IReqoreOptions['uiScale'];
  backgroundBlur?: number;

  id?: string;

  onBeforeOpen?: (popoverData: IPopover, e?: MouseEvent | KeyboardEvent) => boolean;
  onBeforeClose?: (popoverData: IPopover, e?: MouseEvent | KeyboardEvent) => boolean;
  onToggleChange?: (isOpen: boolean, popoverData?: IPopover) => void;
  onUpdate?: (popoverData: IPopover) => void;
}

export interface IPopoverOptions extends IPopover {
  targetElement?: HTMLElement;
  passPopoverData?: (data: IPopoverControls) => void;
}

export interface IPopoverData extends IPopoverOptions {
  popperRef?: MutableRefObject<any>;
}

export const StyledPopover = styled.span`
  overflow: hidden;
`;

/**
 * How long a `keepOpenOnHover` close waits before it decides.
 *
 * The pointer needs time to cross the gap popper leaves between a trigger and
 * its surface, so leaving the trigger only schedules the close and arriving on
 * the surface cancels it. Exported so a test asserting "it is still up" can be
 * written against the real window instead of a copy of the number.
 */
export const DEFERRED_CLOSE_DELAY = 50;

const startEvents = {
  hover: 'mouseenter',
  hoverStay: 'mouseenter',
  click: 'click',
  focus: 'focusin',
};

const endEvents = {
  hover: 'mouseleave',
  hoverStay: null,
  click: null,
  focus: null,
};

export const ReqorePopover = memo(
  forwardRef(
    (
      {
        component: Component,
        componentProps,
        children,
        isReqoreComponent,
        wrapperTag = 'span',
        wrapperStyle = {},
        passPopoverData,
        content,
        blur,
        closeOnOutsideClick = true,
        closeOnInsideClick = true,
        closeOnTargetClick,
        handler = 'hover',
        delay,
        offsetX,
        offsetY,
        noArrow,
        noWrapper,
        useTargetWidth,
        placement,
        openOnMount,
        keepOpenOnHover,
        interactive,
        transparent,
        maxWidth,
        minWidth,
        maxHeight,
        icon,
        title,
        onBeforeClose,
        onBeforeOpen,
        onToggleChange,
        onUpdate,
        effect,
        flat,
        minimal,
        intent,
        id,
        updater,
        backgroundBlur,
        // `customTheme` is picked up so it can be forwarded to the
        // trigger `Component` below. Historically the popover's own
        // props were dropped on the floor, which meant a Popover
        // rendered inside a panel/action slot with a themed context
        // (e.g. an accent-themed toolbar) did NOT paint its trigger
        // with the surrounding theme — the sibling buttons inherited
        // the theme via `<Component customTheme={theme} />` in Panel,
        // but Popover swallowed it. Forwarding it here lets Popover
        // participate in the same theme cascade as every other
        // panel-action item without callers having to duplicate the
        // theme on `componentProps`.
        customTheme,
      }: IReqorePopoverProps,
      ref
    ) => {
      const tooltips = useReqoreProperty('tooltips');
      const closePopoversOnEscPress = useReqoreProperty('closePopoversOnEscPress');

      const { targetRef } = useCombinedRefs(ref);
      const [componentRef, setComponentRef] = React.useState(null);
      const popperRef = useRef(null);

      const [isOpen, setIsOpen] = React.useState(false);
      const timeoutRef = useRef<number | null>(null);
      const isTargetHovered = useRef(false);
      const isPopoverHovered = useRef(false);
      /** Whether the pointer is what opened this. See `open`, and the reconciliation. */
      const openedByPointer = useRef(false);
      const closeTimeoutRef = useRef<number | null>(null);

      const startEvent = startEvents[handler];
      const endEvent = endEvents[handler];

      /**
       * A popover takes the pointer only if the pointer can get to it.
       *
       * A plain `hover` popover closes the moment the pointer is off it, so its
       * surface unmounts as the pointer arrives — all it can do with the
       * pointer is take it away from whatever it is covering. Every other
       * handler, and `keepOpenOnHover` on this one, describes a popover meant
       * to be reached, and those keep it. See `interactive`.
       */
      const isInteractive = interactive ?? (handler !== 'hover' || !!keepOpenOnHover);

      const cancelTimeout = useCallback(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
      }, []);

      const attemptClose = useCallback(
        (e?: MouseEvent | KeyboardEvent) => {
          if (keepOpenOnHover) {
            // Add a small delay before checking to allow hover state to update
            closeTimeoutRef.current = window.setTimeout(() => {
              /* The handle is spent the moment it fires, so it is dropped
                 rather than left for a later `cancelTimeout` to "cancel".

                 One ref cannot describe several timers, and the reconciliation
                 arms one per pointer transition, so this may well discard a
                 LATER timer's handle and leave the ref claiming nothing is
                 pending while something is. That is tolerable only because the
                 handle is not what decides anything: every armed callback
                 re-reads `isTargetHovered` / `isPopoverHovered` before closing,
                 so a timer nobody can cancel can still only close early, never
                 wrongly. */
              closeTimeoutRef.current = null;

              if (!isTargetHovered.current && !isPopoverHovered.current) {
                setIsOpen(false);
              }
            }, DEFERRED_CLOSE_DELAY);
          } else {
            if (onBeforeClose) {
              const shouldClose = onBeforeClose({ content }, e);

              if (!shouldClose) {
                return;
              }
            }

            setIsOpen(false);
          }
        },
        [keepOpenOnHover, onBeforeClose, content]
      );

      const close = useCallback(
        (e?: MouseEvent | KeyboardEvent) => {
          if (onBeforeClose) {
            const shouldClose = onBeforeClose({ content }, e);

            if (!shouldClose) {
              return;
            }
          }

          cancelTimeout();
          isTargetHovered.current = false;
          isPopoverHovered.current = false;
          setIsOpen(false);
        },
        [cancelTimeout, onBeforeClose, content]
      );

      const open = useCallback(
        (e?: MouseEvent | KeyboardEvent) => {
          if (onBeforeOpen) {
            const shouldOpen = onBeforeOpen({ content }, e);

            if (!shouldOpen) {
              return;
            }
          }

          /* Did the POINTER put this here? Every open driven by the trigger
             carries the event that drove it — `handleTargetMouseEnter`, and the
             `startEvent` listener, both pass one through. The `openOnMount`
             effect calls this with nothing, because nothing about a pointer is
             true of it. That distinction is what the reconciliation below is
             gated on; see the note there. */
          openedByPointer.current = !!e;

          // Cancel any pending close timeout when opening
          cancelTimeout();

          if (isOpen) {
            if (handler !== 'hoverStay' && handler !== 'focus') {
              if (closeOnInsideClick) {
                close();
              }
            }
          } else {
            const globalDelay =
              handler === 'hover' || handler === 'hoverStay' ? delay ?? tooltips.delay : delay;

            if (globalDelay) {
              timeoutRef.current = window.setTimeout(() => {
                setIsOpen(true);
              }, globalDelay);
            } else {
              setIsOpen(true);
            }
          }
        },
        [
          isOpen,
          handler,
          closeOnInsideClick,
          delay,
          tooltips.delay,
          close,
          onBeforeOpen,
          content,
          cancelTimeout,
        ]
      );

      /**
       * A hover popover closes when the pointer is no longer on it.
       *
       * Closing used to depend entirely on the trigger's own `mouseleave`, and
       * that event is not guaranteed to arrive. When one is missed the popover
       * has no way back: `isTargetHovered` stays true, the deferred close checks
       * it and declines, and since the pointer is already elsewhere no second
       * `mouseleave` is ever coming. The tooltip then stays up for the life of
       * the page — and a reader sweeping a row of them collects one per trigger,
       * stacked over the content they describe.
       *
       * So the trigger's `mouseleave` is no longer the only way out. Whenever
       * the pointer enters ANY element, this asks the DOM where it actually is:
       * if it is neither on the trigger nor on the popover, the popover closes.
       * `mouseover` fires once per element transition — it is the browser
       * telling us the pointer moved, not a poll — so one missed event costs a
       * moment, not the rest of the session.
       */
      useEffect(() => {
        /* Scoped to the popovers that actually depend on `mouseleave`.
           `click` and `focus` have no `endEvent` at all and are dismissed by the
           document click capture or Esc, so they were never exposed. Plain
           `hoverStay` is the same — `endEvents.hoverStay` is null. But the
           `keepOpenOnHover` branch below REPLACES the handler's own bindings
           with `mouseenter`/`mouseleave`, so ANY handler paired with it opens and
           closes as a hover popover and carries the identical hole - which is why
           the guard admits `keepOpenOnHover` whatever the handler, not only
           alongside `hoverStay`. */
        /* And only for a popover the POINTER opened.

           This asks where the pointer is and closes when the answer is "not
           here" — which is evidence of anything only if the pointer is what put
           the popover here in the first place. An `openOnMount` popover was put
           here by the component; the pointer was never on its trigger, so the
           pointer being elsewhere is not news about it, and closing on that
           reading takes it down on the first mouse movement anywhere on the
           page. Three of reqore's own stories lost their auto-opened popovers
           to exactly that, and two live surfaces do the same thing: the Qorus
           IDE's FSM error tooltip, and reqraft's LSP hover documentation, whose
           anchor is a 1x1 `pointer-events: none` span and therefore a trigger
           the pointer can never be on.

           This does NOT make such a popover un-closable, which is the thing
           worth being careful about: the trigger keeps its own `mouseleave`
           listener whatever opened it, so hovering it and leaving still closes
           it, exactly as it did before the reconciliation existed. What is
           withheld is only the part that reads a pointer somewhere else as a
           reason to go. */
        if (
          !isOpen ||
          !componentRef ||
          !openedByPointer.current ||
          (handler !== 'hover' && !keepOpenOnHover)
        ) {
          return undefined;
        }

        const reconcile = (event: MouseEvent) => {
          /* `instanceof`, not a null check: a real pointer event always targets
             an Element, but a synthetic `mouseover` dispatched on `document` or
             `window` - which test harnesses, analytics and a11y scripts do -
             passes a null check and then has no `closest`. This listener sits on
             the document for every open tooltip in the app, so an exception here
             escapes into someone else's dispatch. The cast this replaces made
             the null check look like a type check. */
          const target = event.target;

          if (!(target instanceof Element)) {
            return;
          }

          const onTrigger = componentRef.contains(target);
          /* ANY popover's surface counts, not just this one's.
             `popperRef.current` is this popover's own surface and would be the
             sharper test, but a pointer that has moved onto a DIFFERENT popover
             is reading something, and closing what it left behind is a smaller
             wrong than closing what it arrived at. The cost is that a stranded
             popover survives while the reader is on another one — until the
             next transition, which is one movement away. */
          const onPopover = !!target.closest('.reqore-popover-content');

          if (onTrigger || onPopover) {
            return;
          }

          /* The refs are cleared first so the deferred check below has the truth
             to work with: the pointer is demonstrably elsewhere right now. */
          isTargetHovered.current = false;
          isPopoverHovered.current = false;
          /* `attemptClose`, NOT `close` - and which of its two branches runs
             depends on `keepOpenOnHover`.

             WITH it the close is deferred, because that flag exists so the
             pointer can travel from the trigger to the surface and popper leaves
             a 10px gap between them (`baseOffsetY` in InternalPopover). Crossing
             it puts the pointer on whatever is underneath for a moment, which
             looks exactly like leaving - so an immediate close here would shut
             the tooltip before the reader arrived, trading a tooltip that will
             not go away for one that cannot be read. The deferred close waits
             out the gap and `handlePopoverMouseEnter` cancels it when the pointer
             lands. `onBeforeClose` is not consulted on that path, which is right
             for a reconciliation: a veto means "not on a close the user
             initiated", and this one is not initiated at all - it is the
             component noticing the pointer is elsewhere.

             WITHOUT it - the plain tooltip, and the library default - the close
             is immediate and DOES consult `onBeforeClose`, so a consumer that
             vetoes can still strand one. No worse than before this existed,
             since such a popover was already un-closable under the same veto;
             simply not fixed by it either. A vetoing consumer owns dismissal -
             and owes it more than before, because a stranded hover popover is
             now `pointer-events: none`, so anything inside it is unreachable
             rather than merely unwanted. See `interactive`.

             The pending close is deliberately NOT cancelled and re-armed on each
             transition. Doing that turned the fixed window into a sliding one:
             the timer kept being pushed forward for as long as the pointer was
             moving, so a tooltip survived an entire sweep and only went once the
             reader stopped - weakest in exactly the case this exists for. The
             first armed timer is left to run; it re-checks both refs before
             closing, so it can only ever close early, never wrongly. */
          attemptClose(event);
        };

        document.addEventListener('mouseover', reconcile, true);

        return () => document.removeEventListener('mouseover', reconcile, true);
      }, [isOpen, handler, keepOpenOnHover, componentRef, attemptClose]);

      const handleClick = useCallback(
        (event: MouseEvent) => {
          const clickedInsidePopover =
            popperRef?.current && popperRef.current.contains(event.target);
          const clickedInsideTarget = componentRef?.contains(event.target as Node);

          // Special handling for hover handler with keepOpenOnHover
          if (handler === 'hover' && !keepOpenOnHover) {
            // Original behavior: close on any click
            close();
            return;
          }

          // If clicked inside popover, only close if closeOnInsideClick is true
          if (clickedInsidePopover) {
            if (closeOnInsideClick) {
              // Use setTimeout to ensure click handlers complete first
              setTimeout(() => close(), 0);
            }
            return;
          }

          // If clicked inside target, only close if closeOnTargetClick is true
          if (clickedInsideTarget) {
            if (closeOnTargetClick) {
              close();
            }
            return;
          }

          // Clicked outside both - close if closeOnOutsideClick is true
          if (closeOnOutsideClick) {
            close();
          }
        },
        [
          closeOnOutsideClick,
          closeOnInsideClick,
          closeOnTargetClick,
          componentRef,
          popperRef.current,
          close,
          handler,
          keepOpenOnHover,
        ]
      );

      const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            close();
          }
        },
        [close]
      );

      useUpdateEffect(() => {
        onToggleChange?.(isOpen, { content });
      }, [isOpen]);

      useUpdateEffect(() => {
        onUpdate?.({ content });
      }, [content]);

      useEffect(() => {
        passPopoverData?.({
          close,
          open,
          isOpen: () => isOpen,
        });
      }, [isOpen]);

      useEffect(() => {
        if (!content) {
          close();
        }
      }, [content]);

      useEffect(() => {
        if (componentRef && openOnMount) {
          open();
        }
      }, [!!componentRef, openOnMount]);

      useUnmount(() => {
        cancelTimeout();
        onToggleChange?.(false);
      });

      const handlePopperUpdate = useCallback((internalPopperRef) => {
        popperRef.current = internalPopperRef.current;
      }, []);

      const handleTargetMouseEnter = useCallback(
        (e: MouseEvent) => {
          isTargetHovered.current = true;
          cancelTimeout();
          open(e);
        },
        [open, cancelTimeout]
      );

      const handleTargetMouseLeave = useCallback(
        (e: MouseEvent) => {
          isTargetHovered.current = false;
          attemptClose(e);
        },
        [attemptClose]
      );

      const handlePopoverMouseEnter = useCallback(() => {
        isPopoverHovered.current = true;
        cancelTimeout();
      }, [cancelTimeout]);

      const handlePopoverMouseLeave = useCallback(() => {
        isPopoverHovered.current = false;
        attemptClose();
      }, [attemptClose]);

      useEffect(() => {
        if (componentRef && content) {
          // Use capture phase for click detection
          document.addEventListener('click', handleClick, true);

          if (closePopoversOnEscPress) {
            document.addEventListener('keydown', handleKeyDown);
          }

          if (keepOpenOnHover) {
            componentRef.addEventListener('mouseenter', handleTargetMouseEnter);
            componentRef.addEventListener('mouseleave', handleTargetMouseLeave);
          } else {
            componentRef.addEventListener(startEvent, open);

            if (endEvent) {
              componentRef.addEventListener(endEvent, close);
            }

            if (handler === 'hoverStay') {
              componentRef.addEventListener('mouseleave', cancelTimeout);
            }
          }
        }

        return () => {
          cancelTimeout();

          document.removeEventListener('click', handleClick, true);
          document.removeEventListener('keydown', handleKeyDown);

          if (keepOpenOnHover) {
            componentRef?.removeEventListener('mouseenter', handleTargetMouseEnter);
            componentRef?.removeEventListener('mouseleave', handleTargetMouseLeave);
          } else {
            componentRef?.removeEventListener(startEvent, open);

            if (endEvent) {
              componentRef?.removeEventListener(endEvent, close);
            }

            if (handler === 'hoverStay') {
              componentRef?.removeEventListener('mouseleave', cancelTimeout);
            }
          }
        };
      }, [
        componentRef,
        content,
        handleClick,
        handleKeyDown,
        open,
        close,
        cancelTimeout,
        handler,
        keepOpenOnHover,
        handleTargetMouseEnter,
        handleTargetMouseLeave,
        closePopoversOnEscPress,
      ]);

      const handleRef = useCallback((r) => {
        setComponentRef(r);
        targetRef.current = r;
      }, []);

      // Theme props are meaningful to Reqore/custom components, but React
      // warns if they are forwarded to a native trigger such as `span`.
      const triggerThemeProps =
        typeof Component === 'string'
          ? {}
          : { customTheme: componentProps?.customTheme ?? customTheme };

      if (isReqoreComponent) {
        return (
          <>
            {isOpen && (
              <InternalPopover
                targetElement={componentRef}
                content={content}
                placement={placement}
                noArrow={noArrow}
                noWrapper={noWrapper}
                useTargetWidth={useTargetWidth}
                transparent={transparent}
                interactive={isInteractive}
                maxWidth={maxWidth}
                minWidth={minWidth}
                maxHeight={maxHeight}
                offsetX={offsetX}
                offsetY={offsetY}
                intent={intent}
                title={title}
                icon={icon}
                minimal={minimal}
                flat={flat}
                effect={effect}
                closePopover={close}
                onPopperClose={close}
                onPopperUpdate={handlePopperUpdate}
                id={id}
                updater={updater}
                handler={handler}
                backgroundBlur={backgroundBlur}
                onPopoverMouseEnter={keepOpenOnHover ? handlePopoverMouseEnter : undefined}
                onPopoverMouseLeave={keepOpenOnHover ? handlePopoverMouseLeave : undefined}
              />
            )}
            {isOpen && blur ? <div className='reqore-blur-wrapper' /> : null}
            <Component
              // Forward the popover's own `customTheme` to the trigger
              // so it inherits the surrounding theme cascade. Caller
              // wins if they already set one on `componentProps`.
              {...triggerThemeProps}
              {...componentProps}
              className={`${isOpen && blur ? 'reqore-blur-z-index' : ''} ${
                componentProps?.className || ''
              }`}
              ref={handleRef}
            >
              {children}
            </Component>
          </>
        );
      }

      return (
        <>
          {isOpen && (
            <InternalPopover
              targetElement={componentRef}
              content={content}
              placement={placement}
              noArrow={noArrow}
              noWrapper={noWrapper}
              useTargetWidth={useTargetWidth}
              transparent={transparent}
              interactive={isInteractive}
              maxWidth={maxWidth}
              minWidth={minWidth}
              maxHeight={maxHeight}
              offsetX={offsetX}
              offsetY={offsetY}
              intent={intent}
              title={title}
              icon={icon}
              minimal={minimal}
              flat={flat}
              effect={effect}
              onPopperClose={close}
              onPopperUpdate={handlePopperUpdate}
              closePopover={close}
              id={id}
              updater={updater}
              handler={handler}
              backgroundBlur={backgroundBlur}
              onPopoverMouseEnter={keepOpenOnHover ? handlePopoverMouseEnter : undefined}
              onPopoverMouseLeave={keepOpenOnHover ? handlePopoverMouseLeave : undefined}
            />
          )}
          {isOpen && blur ? <div className='reqore-blur-wrapper' /> : null}
          <StyledPopover
            as={wrapperTag}
            className={`${isOpen && blur ? 'reqore-blur-z-index' : ''} reqore-popover-wrapper`}
            ref={handleRef}
            style={wrapperStyle}
          >
            <Component
              // See comment on the mirroring path above — forward the
              // popover's own `customTheme` to the trigger so it
              // inherits the surrounding theme cascade. Caller wins
              // if they already set one on `componentProps`.
              {...triggerThemeProps}
              {...componentProps}
            >
              {children}
            </Component>
          </StyledPopover>
        </>
      );
    }
  )
);
