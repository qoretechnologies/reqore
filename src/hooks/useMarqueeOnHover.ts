import { useEffect } from 'react';

/*
 * Truncated text scrolls into view while the pointer rests on it.
 *
 * One behaviour for the whole document rather than a prop on every component:
 * whatever is ellipsized — a button label, a tag, a table cell, a panel title,
 * a heading an app clipped itself — reveals its tail on hover by the same rule.
 * The provider installs it (`animations.marquee`), gated on a real pointer and
 * the OS motion setting; an element (or any ancestor) opts out with
 * `data-reqore-marquee="false"`.
 *
 * The scroll is the element's own `scrollLeft`: any `overflow: hidden` box can
 * be scrolled by script, so no markup changes and no transforms. The ellipsis
 * would sit on top of the moving text, so it is clipped for the duration and
 * the clipped edge fades instead — the box reads as a window onto the text.
 */

export interface IReqoreMarqueeOptions {
  /**
   * Average scroll speed, in px per second — a long label takes longer rather
   * than moving faster, so it stays readable.
   * @default 40
   */
  speed?: number;
  /**
   * How long the fully revealed tail holds before the text snaps back to the
   * start, in ms.
   * @default 1000
   */
  pause?: number;
  /**
   * How long the start holds before the next pass, in ms.
   * @default 400
   */
  rest?: number;
}

export const MARQUEE_DEFAULTS: Required<IReqoreMarqueeOptions> = {
  speed: 40,
  pause: 1000,
  rest: 400,
};

/** Spread onto an element to keep its truncated text (and its descendants') still. */
export const REQORE_MARQUEE_OPT_OUT = { 'data-reqore-marquee': 'false' } as const;

/**
 * For a component that renders one label in several boxes (a button keeps two
 * copies and swaps them on hover): mark the component a `host` and each copy
 * `text`, and hovering anywhere in the host scrolls every copy in step — so
 * whichever copy is visible at the time shows the scroll.
 */
export const REQORE_MARQUEE_HOST = { 'data-reqore-marquee': 'host' } as const;
export const REQORE_MARQUEE_TEXT = { 'data-reqore-marquee': 'text' } as const;

/** Carried by the element while it scrolls: `running`, or `end` while the tail holds. */
export const MARQUEE_STATE_ATTRIBUTE = 'data-reqore-marquee-state';

/** How far up from the hovered node the truncating box may sit. */
const MAX_ASCENT = 5;
/** Below this many hidden px there is nothing worth scrolling to. */
const MIN_DISTANCE = 2;
/** Width of the fade on the clipped edge while scrolling, px. */
const EDGE_FADE = 14;

/**
 * Constant speed for most of the way, easing out over the last stretch so the
 * tail settles into view instead of stopping dead.
 */
export const marqueeProgress = (t: number): number => {
  if (t <= 0) {
    return 0;
  }
  if (t >= 1) {
    return 1;
  }
  if (t < 0.7) {
    return (0.8 * t) / 0.7;
  }
  const tail = (t - 0.7) / 0.3;

  return 0.8 + 0.2 * (1 - (1 - tail) * (1 - tail));
};

const isEditable = (el: HTMLElement): boolean =>
  el.isContentEditable || el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;

/** The box is a single line clipped to an ellipsis, and the line is longer than the box. */
const isClippedBox = (el: HTMLElement): boolean => {
  const style = getComputedStyle(el);

  if (style.textOverflow !== 'ellipsis') {
    return false;
  }
  const overflow = style.overflowX || style.overflow;

  return (
    (overflow === 'hidden' || overflow === 'clip') && el.scrollWidth - el.clientWidth >= MIN_DISTANCE
  );
};

/**
 * The truncated single-line box at or above `target` — the element whose
 * ellipsis is hiding something — or `null` when hovering it should do nothing:
 * nothing is clipped, the text is editable, or an ancestor opted out.
 */
export const findTruncatedElement = (target: EventTarget | null): HTMLElement | null => {
  let el: HTMLElement | null =
    target instanceof HTMLElement ? target : ((target as Node | null)?.parentElement ?? null);

  if (!el || el.closest('[data-reqore-marquee="false"]')) {
    return null;
  }

  for (let depth = 0; el && depth < MAX_ASCENT; depth += 1, el = el.parentElement) {
    if (isEditable(el)) {
      return null;
    }

    const style = getComputedStyle(el);

    if (style.textOverflow !== 'ellipsis') {
      continue;
    }

    const overflow = style.overflowX || style.overflow;

    if (overflow !== 'hidden' && overflow !== 'clip') {
      continue;
    }

    // This is the truncating box; it either hides something or it does not.
    return el.scrollWidth - el.clientWidth >= MIN_DISTANCE ? el : null;
  }

  return null;
};

/**
 * Every box hovering `target` should scroll: inside a marquee host, all of the
 * host's `text` copies that are clipped (they scroll in step); otherwise the
 * single truncated box at or above the target. Empty when there is nothing to
 * do.
 */
export const findMarqueeTargets = (target: EventTarget | null): HTMLElement[] => {
  const el =
    target instanceof HTMLElement ? target : ((target as Node | null)?.parentElement ?? null);

  if (!el || el.closest('[data-reqore-marquee="false"]')) {
    return [];
  }

  const host = el.closest<HTMLElement>('[data-reqore-marquee="host"]');

  if (host) {
    return Array.from(host.querySelectorAll<HTMLElement>('[data-reqore-marquee="text"]')).filter(
      (copy) => !isEditable(copy) && isClippedBox(copy)
    );
  }

  const single = findTruncatedElement(el);

  return single ? [single] : [];
};

/**
 * Scrolls the boxes' hidden tail into view, holds, snaps back and repeats
 * until the returned function is called, which also puts the ellipsis back.
 * Several boxes are copies of one label and move in step.
 */
export const startMarquee = (
  elements: HTMLElement | HTMLElement[],
  options: Required<IReqoreMarqueeOptions>
): (() => void) => {
  const boxes = (Array.isArray(elements) ? elements : [elements]).filter(
    (el) => el.scrollWidth - el.clientWidth >= MIN_DISTANCE
  );

  if (!boxes.length) {
    return () => undefined;
  }

  const distance = Math.max(...boxes.map((el) => el.scrollWidth - el.clientWidth));
  const mask = `linear-gradient(to right, black calc(100% - ${EDGE_FADE}px), transparent)`;
  const previous = boxes.map((el) => ({
    textOverflow: el.style.textOverflow,
    maskImage: el.style.maskImage,
    webkitMaskImage: el.style.getPropertyValue('-webkit-mask-image'),
  }));

  boxes.forEach((el) => {
    el.style.textOverflow = 'clip';
    el.style.maskImage = mask;
    el.style.setProperty('-webkit-mask-image', mask);
    el.setAttribute(MARQUEE_STATE_ATTRIBUTE, 'running');
  });

  const duration = Math.max(400, (distance / options.speed) * 1000);
  let phase: 'scroll' | 'hold' | 'rest' = 'scroll';
  let phaseStart: number | undefined;
  let frame = 0;

  const scrollTo = (left: number) => boxes.forEach((el) => (el.scrollLeft = left));
  const setState = (state: 'running' | 'end') =>
    boxes.forEach((el) => el.setAttribute(MARQUEE_STATE_ATTRIBUTE, state));

  const stop = () => {
    cancelAnimationFrame(frame);
    boxes.forEach((el, i) => {
      el.scrollLeft = 0;
      el.style.textOverflow = previous[i].textOverflow;
      el.style.maskImage = previous[i].maskImage;
      el.style.setProperty('-webkit-mask-image', previous[i].webkitMaskImage);
      el.removeAttribute(MARQUEE_STATE_ATTRIBUTE);
    });
  };

  const tick = (now: number) => {
    if (!boxes[0].isConnected) {
      stop();
      return;
    }
    if (phaseStart === undefined) {
      phaseStart = now;
    }
    const elapsed = now - phaseStart;

    if (phase === 'scroll') {
      const t = Math.min(1, elapsed / duration);
      scrollTo(Math.round(distance * marqueeProgress(t)));
      if (t >= 1) {
        phase = 'hold';
        phaseStart = now;
        setState('end');
      }
    } else if (phase === 'hold') {
      if (elapsed >= options.pause) {
        scrollTo(0);
        phase = 'rest';
        phaseStart = now;
        setState('running');
      }
    } else if (elapsed >= options.rest) {
      phase = 'scroll';
      phaseStart = now;
    }

    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);

  return stop;
};

/**
 * Installs the behaviour on the document: hovering any truncated box scrolls
 * it, leaving it stops it. Listens in the capture phase so portalled content
 * (popovers, modals) is covered too.
 *
 * @param enabled — off on touch devices and when the provider's
 *   `animations.marquee` is `false`. Motion the OS was asked to suppress
 *   (`prefers-reduced-motion`) stays suppressed regardless.
 */
export const useMarqueeOnHover = (enabled: boolean, options?: IReqoreMarqueeOptions): void => {
  const speed = options?.speed ?? MARQUEE_DEFAULTS.speed;
  const pause = options?.pause ?? MARQUEE_DEFAULTS.pause;
  const rest = options?.rest ?? MARQUEE_DEFAULTS.rest;

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return undefined;
    }
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const resolved = { speed, pause, rest };
    // What is scrolling, and the box a leave is measured against: the host when
    // there is one (its copies come and go under the pointer), else the box.
    let active: { scope: HTMLElement; boxes: HTMLElement[]; stop: () => void } | null = null;
    const stopActive = () => {
      active?.stop();
      active = null;
    };

    const onOver = (event: MouseEvent) => {
      const boxes = findMarqueeTargets(event.target);

      if (!boxes.length) {
        return;
      }
      const scope =
        (event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-reqore-marquee="host"]')
          : null) ?? boxes[0];

      if (active?.scope === scope) {
        return;
      }
      stopActive();
      active = { scope, boxes, stop: startMarquee(boxes, resolved) };
    };

    const onOut = (event: MouseEvent) => {
      if (!active) {
        return;
      }
      const from = event.target as Node | null;
      const to = event.relatedTarget as Node | null;

      // Only a leave OF the scrolling scope counts — not moves inside it, nor
      // leaves of something else entirely.
      if (!from || !active.scope.contains(from) || (to && active.scope.contains(to))) {
        return;
      }
      stopActive();
    };

    document.addEventListener('mouseover', onOver, true);
    document.addEventListener('mouseout', onOut, true);

    return () => {
      stopActive();
      document.removeEventListener('mouseover', onOver, true);
      document.removeEventListener('mouseout', onOut, true);
    };
  }, [enabled, speed, pause, rest]);
};
