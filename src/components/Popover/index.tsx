import { Placement } from '@popperjs/core';
import React, { forwardRef, memo, MutableRefObject, useCallback, useEffect, useRef } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';
import { isHoveringPointer, useHoverGate, watchHoverGate } from '../../helpers/hoveringPointer';
import styled from '../../helpers/styled';
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
  /**
   * A hover popover that is a way in - a menu, such as a tab bar's or a segmented control's More
   * menu - opens at a finger's tap, on the tap's click, as it would at a hover. A plain hover
   * tooltip, `hoverStay` or not, opens at no tap: it describes what the finger is pressing.
   * `keepOpenOnHover` popovers open at a tap either way: what they hold is meant to be reached.
   * `ReqoreDropdown` sets it.
   */
  opensOnTap?: boolean;
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
  /**
   * Keeps the surface at the `placement` asked for instead of letting it flip
   * to the opposite side, scrolling the target into view when there is not
   * enough room to honour it.
   *
   * For a MENU opened from a form field this is the difference between usable
   * and not: flipping puts the list over the form the field belongs to — the
   * content the author is reading to decide what to pick — while the space
   * below it holds the rows they have already passed. A tooltip wants the
   * opposite and keeps the default.
   */
  keepPlacement?: boolean;
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
        opensOnTap: opensOnTapProp,
        interactive,
        transparent,
        maxWidth,
        minWidth,
        maxHeight,
        keepPlacement,
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

      const { setRef } = useCombinedRefs(ref);
      const [componentRef, setComponentRef] = React.useState(null);
      const popperRef = useRef(null);

      const [isOpen, setIsOpenState] = React.useState(false);
      /* Whether it is open NOW, set the moment it opens or closes. The controls handed out through
         `passPopoverData` read this: a closure over `isOpen` answered for the render that handed it out,
         and the holder got a fresh copy only after an effect and a render of its own - so a field asked
         about its template list in that gap (a key typed straight after the click that opened it) was
         told it was closed, and typing did not put it away. */
      const isOpenNow = useRef(false);
      const setIsOpen = useCallback((open: boolean) => {
        isOpenNow.current = open;
        setIsOpenState(open);
      }, []);
      /* The trigger whose focus was checked when its listener was attached. The listener effect re-runs
         whenever the list opens or closes (it depends on `open`, which depends on `isOpen`); a check on
         every re-run reopened a list Escape had just closed while the field kept the focus. */
      const focusCheckedFor = useRef<HTMLElement | null>(null);
      const timeoutRef = useRef<number | null>(null);
      const isTargetHovered = useRef(false);
      const isPopoverHovered = useRef(false);
      /** Whether the pointer is what opened this. See `open`, and the reconciliation. */
      const openedByPointer = useRef(false);
      const closeTimeoutRef = useRef<number | null>(null);

      const startEvent = startEvents[handler];
      const endEvent = endEvents[handler];
      /* A hover's popover opens for a pointer that hovers, not at a tap: the `mouseenter` a browser emulates
         after a finger's tap is its own, and opened a tooltip until the click closed it - on a touch laptop,
         where its mouse is the primary pointer and a tooltip is a hover's. See `createHoverGate`. */
      const opensOnHover = !!keepOpenOnHover || handler === 'hover' || handler === 'hoverStay';
      /* The handler's own start event is a hover's (`mouseenter`), which the gate decides; a click
         or a focus is not one, and is never asked about. */
      const startsOnHover = startEvent === 'mouseenter';
      /* A popover meant to be reached opens at a tap, on the tap's click: a hover popover that is a
         way in (`opensOnTap` - a tab bar's, a segmented control's or a breadcrumb trail's More menu)
         and one held open while hovered (`keepOpenOnHover`). The gate turns the tap's `mouseenter`
         away, and nothing else opened them, so on a phone what they hold could not be reached. A
         plain hover tooltip, `hoverStay` or not, still opens for nothing at a tap; a click popover
         opens on its own click. */
      const opensOnTap =
        handler !== 'click' &&
        (!!keepOpenOnHover || (!!opensOnTapProp && (handler === 'hover' || handler === 'hoverStay')));
      const hoverGate = useHoverGate();
      /* Whether the press of the click that comes next was one that cannot hover: a finger's, or a
         pen's on the screen. Noted at `pointerdown`, read (and forgotten) at the click. */
      const pressedWithoutHover = useRef(false);

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

      /* Answers whether it closed: `false` when `onBeforeClose` refused, and the popover is still
         up. Escape asks, because a key the popover did not use is not its to keep. */
      const close = useCallback(
        (e?: MouseEvent | KeyboardEvent): boolean => {
          if (onBeforeClose) {
            const shouldClose = onBeforeClose({ content }, e);

            if (!shouldClose) {
              return false;
            }
          }

          cancelTimeout();
          isTargetHovered.current = false;
          isPopoverHovered.current = false;
          setIsOpen(false);

          return true;
        },
        [cancelTimeout, onBeforeClose, content]
      );

      /* `atOnce` skips the delay: a hover's delay waits to see that the pointer stays, and a tap
         has already said what it wants. */
      const open = useCallback(
        (e?: MouseEvent | KeyboardEvent, atOnce?: boolean) => {
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

          /* The render's `isOpen`, not `isOpenNow`: the popover as it was when this event began. A
             click on the trigger is heard twice - first by the document's capture listener
             (`handleClick`), which closes the popover when `closeOnTargetClick` asks it to, then
             here - and read as it is now, the popover that click had just closed was opened again
             at once (a dropdown's trigger could not close its list). */
          if (isOpen) {
            if (handler !== 'hoverStay' && handler !== 'focus') {
              if (closeOnInsideClick) {
                close();
              }
            }
          } else {
            const globalDelay = atOnce
              ? 0
              : handler === 'hover' || handler === 'hoverStay'
              ? delay ?? tooltips.delay
              : delay;

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

      /* Escape puts away the popover that is open. Heard in the CAPTURE phase: on the document's
         bubble phase it came after every handler in the page, so an editor around the field (a form
         row, where Escape discards the edit) heard it first, and one Escape meant for a list also
         closed the editor and threw away what had been typed. With nothing open it is left alone.

         The key goes no further only when it was this popover's: pressed in its trigger or on its
         own surface, and used - the popover closed. Every tooltip is a popover, so one showing
         anywhere on the page kept every Escape from the page while it was up: a modal with a
         tooltip showing in it did not close, and a row editor or a table's search never heard the
         key. A popover the key was not pressed in still closes, and the key goes on; so does one
         whose `onBeforeClose` refused, since it stays up and used nothing. */
      const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
          if (event.key !== 'Escape' || !isOpenNow.current) {
            return;
          }

          const { target } = event;
          // a key dispatched on the window has no node to be inside
          const pressedHere =
            target instanceof Node &&
            (!!componentRef?.contains(target) || !!popperRef.current?.contains(target));

          if (close() && pressedHere) {
            event.stopPropagation();
          }
        },
        [close, componentRef]
      );

      useUpdateEffect(() => {
        onToggleChange?.(isOpen, { content });
      }, [isOpen]);

      useUpdateEffect(() => {
        onUpdate?.({ content });
      }, [content]);

      /* The functions handed out through `passPopoverData` keep their identity and call the
         popover's open and close as they are now. The controls are handed out again only when it
         opens or closes, and a copy of `open` or `close` taken then kept the `onBeforeOpen`,
         `onBeforeClose` and `content` of that render. Handing them out on every change instead
         would set the holder's state with each new `content`: a field that keeps them in state
         renders its list again, with a new `content`. */
      const latestControls = useRef({ open, close });
      latestControls.current = { open, close };
      const openNow = useCallback((e?: MouseEvent | KeyboardEvent) => {
        latestControls.current.open(e);
      }, []);
      const closeNow = useCallback(
        (e?: MouseEvent | KeyboardEvent) => latestControls.current.close(e),
        []
      );
      const isOpenNowControl = useCallback(() => isOpenNow.current, []);

      useEffect(() => {
        passPopoverData?.({
          close: closeNow,
          open: openNow,
          isOpen: isOpenNowControl,
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
          if (!hoverGate.isHover()) {
            return;
          }
          isTargetHovered.current = true;
          cancelTimeout();
          open(e);
        },
        [open, cancelTimeout, hoverGate]
      );

      /* What starts this popover: `open` itself, or, for a hover, `open` for a pointer that hovers.

         Held open while hovered (`keepOpenOnHover`), a click or focus popover listens to its own
         event as well as to the hover: without it a tap, whose hover the gate turns away, opened
         nothing. A click on the trigger the pointer rests on closes nothing the hover opened, as
         before. */
      const handleStart = useCallback(
        (e: MouseEvent) => {
          if (startsOnHover && !hoverGate.isHover()) {
            return;
          }
          if (keepOpenOnHover && isOpen && isTargetHovered.current) {
            return;
          }
          open(e);
        },
        [open, startsOnHover, hoverGate, keepOpenOnHover, isOpen]
      );

      const handlePress = useCallback((e: PointerEvent) => {
        pressedWithoutHover.current = !isHoveringPointer(e);
      }, []);

      /* A tap opens what a hover would have (see `opensOnTap`), at once, on its click; and closes
         it as a click popover's is closed - a click outside, or on the trigger with
         `closeOnTargetClick`. A mouse's click is left alone: its hover has opened the popover, or
         is about to. */
      const handleTapClick = useCallback(
        (e: MouseEvent) => {
          const tapped = pressedWithoutHover.current;
          pressedWithoutHover.current = false;

          if (tapped && !isOpen) {
            open(e, true);
          }
        },
        [open, isOpen]
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
        let stopHoverGate: (() => void) | undefined;
        const bindsStart = !keepOpenOnHover || !startsOnHover;
        if (componentRef && content) {
          // Use capture phase for click detection
          document.addEventListener('click', handleClick, true);

          if (closePopoversOnEscPress) {
            document.addEventListener('keydown', handleKeyDown, true);
          }

          stopHoverGate = opensOnHover ? watchHoverGate(componentRef, hoverGate) : undefined;

          if (keepOpenOnHover) {
            componentRef.addEventListener('mouseenter', handleTargetMouseEnter);
            componentRef.addEventListener('mouseleave', handleTargetMouseLeave);
          } else {
            if (endEvent) {
              componentRef.addEventListener(endEvent, close);
            }

            if (handler === 'hoverStay') {
              componentRef.addEventListener('mouseleave', cancelTimeout);
            }
          }

          // `keepOpenOnHover`'s own `mouseenter` stands in for a hover's start event, not a click's
          if (bindsStart) {
            componentRef.addEventListener(startEvent, handleStart);
          }

          // capture: a child that stops the press or the click does not keep it from the popover
          if (opensOnTap) {
            componentRef.addEventListener('pointerdown', handlePress, true);
            componentRef.addEventListener('click', handleTapClick, true);
          }

          /* A popover opened by focus is opened by the user being in the field, however they got
             there. A field focused as it mounts (an editor that opens with the cursor in its field)
             was focused before this listener was attached: no `focusin` came, and its list stayed
             closed until the user left the field and came back. Checked once per trigger, as it is
             attached. */
          if (handler === 'focus' && focusCheckedFor.current !== componentRef) {
            focusCheckedFor.current = componentRef;
            if (componentRef.contains(document.activeElement)) {
              open();
            }
          }
        }

        return () => {
          cancelTimeout();

          document.removeEventListener('click', handleClick, true);
          document.removeEventListener('keydown', handleKeyDown, true);

          stopHoverGate?.();

          if (keepOpenOnHover) {
            componentRef?.removeEventListener('mouseenter', handleTargetMouseEnter);
            componentRef?.removeEventListener('mouseleave', handleTargetMouseLeave);
          } else {
            if (endEvent) {
              componentRef?.removeEventListener(endEvent, close);
            }

            if (handler === 'hoverStay') {
              componentRef?.removeEventListener('mouseleave', cancelTimeout);
            }
          }

          if (bindsStart) {
            componentRef?.removeEventListener(startEvent, handleStart);
          }

          if (opensOnTap) {
            componentRef?.removeEventListener('pointerdown', handlePress, true);
            componentRef?.removeEventListener('click', handleTapClick, true);
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
        handleStart,
        opensOnHover,
        startsOnHover,
        opensOnTap,
        handlePress,
        handleTapClick,
        hoverGate,
      ]);

      const handleRef = useCallback(
        (r) => {
          setComponentRef(r);
          setRef(r);
        },
        [setRef]
      );

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
                keepPlacement={keepPlacement}
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
              keepPlacement={keepPlacement}
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
