import { RefObject, useCallback, useEffect, useRef } from 'react';

// Selector for all focusable elements
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
  'audio[controls]',
  'video[controls]',
  'details > summary:first-of-type',
].join(',');

/**
 * The element a trap gives focus to when it opens: the one its content marks with
 * `data-reqore-initial-focus` (a confirmation's Cancel, ahead of the x in its title bar: a dialog
 * that asks opens on its least destructive answer), else the first focusable one.
 */
const initialOf = (focusable: HTMLElement[]): HTMLElement =>
  focusable.find((element) => element.hasAttribute('data-reqore-initial-focus')) ?? focusable[0];

export interface IUseFocusTrapOptions {
  /** Whether the focus trap is active */
  active?: boolean;
  /** Whether to restore focus to the previously focused element when deactivated */
  restoreFocus?: boolean;
  /** Whether to auto-focus the first focusable element when activated */
  autoFocus?: boolean;
  /**
   * Whether Tab is kept inside the container (a modal dialog). Off, the container only takes focus
   * when it activates and gives it back when it ends (a dialog that is not modal: a drawer with no
   * backdrop, beside a page that stays usable). Default true.
   */
  trap?: boolean;
  /**
   * What takes focus when it activates: the first focusable element (`'first'`, the default), or
   * the container itself (`'container'`, focused without a ring or a scroll), so a dialog that is
   * not modal does not act on its first control for the reader.
   */
  initialFocus?: 'first' | 'container';
}

/**
 * The traps that hold Tab, innermost last. Only the last one answers a Tab: two active traps
 * fought, the outer pulling focus to its first element and the inner pulling it back (a
 * confirmation over a drawer with a backdrop). When the inner one ends, the one under it answers
 * again.
 */
const trapStack: symbol[] = [];

/**
 * Hook that traps focus within a container element.
 * When active, Tab/Shift+Tab cycles through focusable elements inside the container.
 * Optionally restores focus to the previously focused element when deactivated.
 *
 * @param containerRef - Ref to the container element to trap focus within
 * @param options - Configuration options
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  containerRef: RefObject<T>,
  options: IUseFocusTrapOptions = {}
): void {
  const {
    active = true,
    restoreFocus = true,
    autoFocus = true,
    trap = true,
    initialFocus = 'first',
  } = options;
  // This trap's place in the stack.
  const trapId = useRef(Symbol('focus-trap')).current;

  // Store the element that was focused before the trap was activated
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // The tab stops within the container, in document order
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const elements = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    return Array.from(elements).filter((el) => {
      // A negative tabindex takes an element out of the tab order, whatever the selector it matched
      // (`button`, `a[href]`, ...): the options of a radio group other than the checked one, for
      // example. Counted here, the first of them took the trap's first focus instead of the checked
      // option, and Tab stopped on options the group had taken out of the order.
      const tabindex = Number.parseInt(el.getAttribute('tabindex') ?? '', 10);
      if (tabindex < 0) return false;
      // Filter out elements that are not visible or have display:none
      return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
    });
  }, [containerRef]);

  // Handle Tab key to trap focus within container
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !containerRef.current) return;
      // Only the innermost trap holds Tab.
      if (trapStack[trapStack.length - 1] !== trapId) return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // If focus is outside the container, move it inside
      if (!containerRef.current.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      // Wrap when no tab stop lies ahead of focus in the direction of travel, not only when
      // focus is on the first or the last one: focus can sit on an element that is not a tab
      // stop (one with tabindex -1 that a click focused, such as the container once it has
      // waited for its content), and the browser would then take the Tab out of the container.
      const follows = (el: HTMLElement, reference: HTMLElement) =>
        !!(reference.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);

      if (event.shiftKey) {
        if (!focusableElements.some((el) => follows(activeElement, el))) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (!focusableElements.some((el) => follows(el, activeElement))) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    [containerRef, getFocusableElements]
  );

  // Effect to set up and tear down the focus trap
  useEffect(() => {
    if (!active || !containerRef.current) {
      return undefined;
    }

    // Save the currently focused element
    if (restoreFocus && document.activeElement instanceof HTMLElement) {
      previouslyFocusedRef.current = document.activeElement;
    }

    // The container this activation traps: the one focus is given back from when it ends
    const container = containerRef.current;

    // Auto-focus the first focusable element, but only if focus isn't already inside
    // This respects components that have their own autoFocus logic (e.g., Input with focusRules)
    let autoFocusFrame: number | undefined;
    // Content that is not there yet when the trap opens: its first focusable element takes focus when it appears
    let awaitContent: MutationObserver | undefined;
    if (autoFocus) {
      // Use requestAnimationFrame to ensure the DOM is ready and any native autoFocus has fired
      autoFocusFrame = requestAnimationFrame(() => {
        autoFocusFrame = undefined;
        if (!containerRef.current) return;

        // Check if focus is already inside the container (e.g., from a component's own autoFocus)
        const activeElement = document.activeElement;
        const focusAlreadyInside = activeElement && containerRef.current.contains(activeElement);

        // Only auto-focus if focus is not already inside the container
        if (!focusAlreadyInside && initialFocus === 'container') {
          // A dialog that is not modal takes focus as a whole: its box, not its first control.
          const box = containerRef.current;
          box.setAttribute('tabindex', '-1');
          box.style.outline = 'none';
          box.focus({ preventScroll: true });
        } else if (!focusAlreadyInside) {
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            initialOf(focusableElements).focus();
          } else {
            // If no focusable elements, focus the container itself...
            const waiting = containerRef.current;
            waiting.setAttribute('tabindex', '-1');
            waiting.focus();
            // ...until its content brings one, which then takes focus, as it would have had it been there when
            // the trap opened. Unless the user has moved focus by then: focus that has left the container is
            // left where it is. Which of the two a drawer ended with depended on whether its content had rendered
            // by the first frame (a drawer captured with its first tab focused on one run and with the drawer
            // focused on the next).
            if (typeof MutationObserver !== 'undefined') {
              awaitContent = new MutationObserver(() => {
                if (document.activeElement !== waiting) {
                  awaitContent?.disconnect();
                  awaitContent = undefined;
                  return;
                }
                const focusable = getFocusableElements();
                const first = focusable.length ? initialOf(focusable) : undefined;
                if (first) {
                  awaitContent?.disconnect();
                  awaitContent = undefined;
                  first.focus();
                }
              });
              awaitContent.observe(waiting, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['disabled', 'hidden', 'tabindex', 'href', 'style', 'class'],
              });
            }
          }
        }
      });
    }

    // Add the keydown listener, and take the top of the stack, when this trap holds Tab
    if (trap) {
      trapStack.push(trapId);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const place = trapStack.indexOf(trapId);
      if (place !== -1) {
        trapStack.splice(place, 1);
      }

      // A trap that ends before its first frame does not pull focus into a container it no longer traps
      if (autoFocusFrame !== undefined) {
        cancelAnimationFrame(autoFocusFrame);
      }
      awaitContent?.disconnect();
      awaitContent = undefined;

      // Give focus back to what had it before the trap opened. Read here, not in the frame: the ref is cleared
      // now, so a frame that read it found nothing and focus was never given back.
      const previouslyFocused = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (restoreFocus && previouslyFocused) {
        // Use requestAnimationFrame to ensure the element is still in the DOM
        requestAnimationFrame(() => {
          if (!previouslyFocused.isConnected) return;
          // Only focus the trap would otherwise lose: still in its container, or fallen back to the page
          // because the container is gone. Focus the app has moved somewhere else since is left there.
          const activeElement = document.activeElement;
          const focusIsLost =
            !activeElement ||
            activeElement === document.body ||
            !!container?.contains(activeElement);
          if (focusIsLost) {
            previouslyFocused.focus();
          }
        });
      }
    };
  }, [
    active,
    autoFocus,
    restoreFocus,
    trap,
    initialFocus,
    trapId,
    containerRef,
    getFocusableElements,
    handleKeyDown,
  ]);
}

export default useFocusTrap;
