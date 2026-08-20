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

export interface IUseFocusTrapOptions {
  /** Whether the focus trap is active */
  active?: boolean;
  /** Whether to restore focus to the previously focused element when deactivated */
  restoreFocus?: boolean;
  /** Whether to auto-focus the first focusable element when activated */
  autoFocus?: boolean;
}

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
  const { active = true, restoreFocus = true, autoFocus = true } = options;

  // Store the element that was focused before the trap was activated
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const elements = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    // Filter out elements that are not visible or have display:none
    return Array.from(elements).filter((el) => {
      return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
    });
  }, [containerRef]);

  // Handle Tab key to trap focus within container
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !containerRef.current) return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // If Shift+Tab on first element, move to last
      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // If Tab on last element, move to first
      else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
      // If focus is outside the container, move it inside
      else if (!containerRef.current.contains(activeElement)) {
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

    // Auto-focus the first focusable element, but only if focus isn't already inside
    // This respects components that have their own autoFocus logic (e.g., Input with focusRules)
    if (autoFocus) {
      // Use requestAnimationFrame to ensure the DOM is ready and any native autoFocus has fired
      requestAnimationFrame(() => {
        if (!containerRef.current) return;

        // Check if focus is already inside the container (e.g., from a component's own autoFocus)
        const activeElement = document.activeElement;
        const focusAlreadyInside = activeElement && containerRef.current.contains(activeElement);

        // Only auto-focus if focus is not already inside the container
        if (!focusAlreadyInside) {
          // preventScroll everywhere a focus is programmatic housekeeping rather than
          // user navigation: this fires inside a rAF, and by then the page may have
          // re-laid out (an option committing re-groups its form) — a scrolling focus
          // yanks the container to wherever the target landed, mid-interaction. Tab
          // cycling (handleKeyDown above) deliberately keeps the default scroll: a
          // keyboard user needs the element they tabbed to brought into view.
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            focusableElements[0].focus({ preventScroll: true });
          } else {
            // If no focusable elements, focus the container itself
            containerRef.current.setAttribute('tabindex', '-1');
            containerRef.current.focus({ preventScroll: true });
          }
        }
      });
    }

    // Add the keydown listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously focused element
      if (restoreFocus && previouslyFocusedRef.current) {
        const target = previouslyFocusedRef.current;
        previouslyFocusedRef.current = null;
        // Use requestAnimationFrame to ensure the element is still in the DOM
        requestAnimationFrame(() => {
          // By this frame the user may already have focused something else (clicked a
          // field, opened another surface) — restoring would steal it. Only restore
          // when focus fell back to the body, and never let the restore scroll: the
          // saved element may have been re-laid out while the trap was up, and a
          // scrolling focus teleports the page to its new position.
          const current = document.activeElement;
          const focusIsUnclaimed = !current || current === document.body;
          if (focusIsUnclaimed && document.body.contains(target)) {
            target.focus({ preventScroll: true });
          }
        });
      }
    };
  }, [active, autoFocus, restoreFocus, containerRef, getFocusableElements, handleKeyDown]);
}

export default useFocusTrap;
