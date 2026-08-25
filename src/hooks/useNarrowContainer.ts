import { useEffect, useRef, useState } from 'react';

/**
 * Default width below which a row's actions wrap under its label.
 *
 * `ReqoreSeverityRow` overrides this upward: its row carries a severity strip, a
 * leading tag, a label AND a description before the actions, so it is genuinely
 * out of room sooner than a plainer row is.
 *
 * The default matches Reqore's documented mobile threshold rather than being a
 * number invented here. It is deliberately NOT SeverityRow's 640: at 640 an
 * `EntityRow` sitting in a ~600px panel wraps a single "Open" button onto its own
 * line with most of the row still empty, which reads as a bug rather than as
 * responsiveness. Wrapping should mean "there was no room", not "the container
 * was under some number".
 */
export const NARROW_CONTAINER_BREAKPOINT_PX = 480;

/** `ReqoreSeverityRow`'s threshold — see above for why it is higher. */
export const SEVERITY_ROW_NARROW_BREAKPOINT_PX = 640;

/**
 * Measures a container's own inline size and reports whether it is narrower than
 * `breakpoint`.
 *
 * The measurement is of the CONTAINER, not the viewport, which is the whole point:
 * the case this exists for is a narrow drawer / sidebar / split panel sitting on a
 * wide screen, where a media query is looking at the wrong box entirely.
 *
 * Callers stamp the result on the row as a `data-narrow` attribute and let a plain
 * attribute selector rewrite the grid. That is deliberately not a CSS container
 * query: styled-components 5.3.11's stylis 4.0.13 emits `@container` to the DOM but
 * the rule never matches, even with `container-type: inline-size` correctly set and
 * the width under the threshold — confirmed via a CI debug pass. Attribute selectors
 * match everywhere Reqore ships.
 *
 * Degrades to "never narrow" where `ResizeObserver` is unavailable, which keeps the
 * wide layout rather than guessing.
 */
export const useNarrowContainer = <T extends HTMLElement = HTMLDivElement>(
  breakpoint: number = NARROW_CONTAINER_BREAKPOINT_PX
): [React.MutableRefObject<T | null>, boolean] => {
  const containerRef = useRef<T | null>(null);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const node = containerRef.current;

    if (!node || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // `contentBoxSize` is the modern read; fall back to the entry's
        // boundingClientRect for older browsers that still call the callback but
        // don't populate the newer field.
        const width = Array.isArray(entry.contentBoxSize)
          ? entry.contentBoxSize[0]?.inlineSize ?? entry.contentRect.width
          : entry.contentRect.width;

        setIsNarrow(width > 0 && width <= breakpoint);
      }
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [breakpoint]);

  return [containerRef, isNarrow];
};
