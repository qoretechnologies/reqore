import { useCallback, useEffect, useRef } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';

export type TReqoreAutoFocusType = 'auto' | 'keypress';

export interface IReqoreAutoFocusRules {
  type: TReqoreAutoFocusType;
  viewportOnly?: boolean;
  viewport?: HTMLElement;
  viewportMargin?: string;
  shortcut?: 'letters' | 'numbers' | string | ('letters' | 'numbers' | string)[];
  clearOnFocus?: boolean;
}

export const useAutoFocus = (
  element: HTMLInputElement | HTMLTextAreaElement,
  rules?: IReqoreAutoFocusRules,
  onChange?: (e: unknown) => void
) => {
  const isInViewport = useRef<boolean>(false);
  const observer = useRef<IntersectionObserver>(null);

  const focus = useCallback(() => {
    if (!rules.viewportOnly || isInViewport.current) {
      if (rules.clearOnFocus) {
        onChange?.({ target: { value: '' } } as any);
      }

      element.setSelectionRange(-1, -1);
      element.focus();
    }
  }, [element, rules, isInViewport.current]);

  const handleKeyDown = (e: KeyboardEvent) => {
    // Check if this event came from another html input
    if (
      e.target &&
      ((e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA')
    ) {
      return;
    }

    const shortcut = Array.isArray(rules?.shortcut) ? rules?.shortcut : [rules?.shortcut];

    if (shortcut.includes('letters') && e.key.length === 1 && e.key.match(/[a-z]/i)) {
      focus();
    }

    if (shortcut.includes('numbers') && e.key.length === 1 && e.key.match(/[0-9]/i)) {
      focus();
    }

    if (shortcut.includes(e.key)) {
      focus();
    }
  };

  useUpdateEffect(() => {
    if (element && rules) {
      if (rules.viewportOnly) {
        observer.current = new IntersectionObserver(
          (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                isInViewport.current = true;
              } else {
                isInViewport.current = false;
              }
              // If the focus type is auto, we focus the element now if its in the viewport
              // and set the observer to null so it doesn't run again
              if (rules.type === 'auto' && isInViewport.current) {
                element.focus();
                observer.current?.disconnect();
                observer.current = null;
              }
            });
          },
          {
            root: rules?.viewport,
            rootMargin: rules?.viewportMargin,
            threshold: 0.8,
          }
        );

        observer.current.observe(element);
      } else if (rules.type === 'auto') {
        focus();
      }
    }
  }, [element]);

  useUnmount(() => {
    observer.current?.disconnect();
  });

  useEffect(() => {
    if (element && rules && rules.type === 'keypress') {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [element, rules]);
};
