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

    // Auto-focus the first focusable element
    if (autoFocus) {
      // Use requestAnimationFrame to ensure the DOM is ready
      requestAnimationFrame(() => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else if (containerRef.current) {
          // If no focusable elements, focus the container itself if it can receive focus
          containerRef.current.setAttribute('tabindex', '-1');
          containerRef.current.focus();
        }
      });
    }

    // Add the keydown listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously focused element
      if (restoreFocus && previouslyFocusedRef.current) {
        // Use requestAnimationFrame to ensure the element is still in the DOM
        requestAnimationFrame(() => {
          if (previouslyFocusedRef.current && document.body.contains(previouslyFocusedRef.current)) {
            previouslyFocusedRef.current.focus();
          }
        });
        previouslyFocusedRef.current = null;
      }
    };
  }, [active, autoFocus, restoreFocus, containerRef, getFocusableElements, handleKeyDown]);
}

export default useFocusTrap;
