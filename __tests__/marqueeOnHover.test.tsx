import { fireEvent, render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import {
  findMarqueeTargets,
  findTruncatedElement,
  MARQUEE_DEFAULTS,
  MARQUEE_STATE_ATTRIBUTE,
  marqueeProgress,
  startMarquee,
} from '../src/hooks/useMarqueeOnHover';

/*
 * jsdom lays nothing out, so every box "fits": the metrics are stated outright,
 * and the box's own scrollLeft is a plain property here so the scroll the engine
 * writes can be read back. Whether the pixels move is the browser stories' job;
 * what is pinned here is the DECISION (which box, when) and the SEQUENCE
 * (scroll → hold → snap back → again; leave → restored).
 */

const truncate = (el: HTMLElement, hidden: number) => {
  el.style.overflow = 'hidden';
  el.style.overflowX = 'hidden';
  el.style.textOverflow = 'ellipsis';
  el.style.whiteSpace = 'nowrap';
  Object.defineProperty(el, 'clientWidth', { value: 100, configurable: true });
  Object.defineProperty(el, 'scrollWidth', { value: 100 + hidden, configurable: true });
  let scrollLeft = 0;
  Object.defineProperty(el, 'scrollLeft', {
    get: () => scrollLeft,
    set: (value: number) => {
      scrollLeft = value;
    },
    configurable: true,
  });
  return el;
};

const box = (hidden = 200) => {
  const el = truncate(document.createElement('div'), hidden);
  el.textContent = 'A label far longer than the box it sits in';
  document.body.appendChild(el);
  return el;
};

const state = (el: HTMLElement) => el.getAttribute(MARQUEE_STATE_ATTRIBUTE);

afterEach(() => {
  document.body.innerHTML = '';
});

describe('marqueeProgress', () => {
  test('runs at constant speed, then eases out over the last stretch', () => {
    expect(marqueeProgress(0)).toBe(0);
    expect(marqueeProgress(0.35)).toBeCloseTo(0.4);
    expect(marqueeProgress(0.7)).toBeCloseTo(0.8);
    expect(marqueeProgress(1)).toBe(1);
    // Monotonic — the text never backs up.
    let previous = 0;
    for (let t = 0; t <= 1; t += 0.01) {
      const p = marqueeProgress(t);
      expect(p).toBeGreaterThanOrEqual(previous);
      previous = p;
    }
  });
});

describe('findTruncatedElement', () => {
  test('finds the ellipsized box that is hiding something', () => {
    const el = box(200);
    expect(findTruncatedElement(el)).toBe(el);
  });

  test('walks up from a node inside the box', () => {
    const el = box(200);
    const inner = document.createElement('span');
    el.appendChild(inner);
    expect(findTruncatedElement(inner)).toBe(el);
  });

  test('ignores a box whose text fits', () => {
    expect(findTruncatedElement(box(0))).toBeNull();
  });

  test('ignores an element that is not ellipsized', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(findTruncatedElement(el)).toBeNull();
  });

  test('honours the opt-out on the box or any ancestor', () => {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-reqore-marquee', 'false');
    const el = truncate(document.createElement('div'), 200);
    wrapper.appendChild(el);
    document.body.appendChild(wrapper);
    expect(findTruncatedElement(el)).toBeNull();
  });

  test('never scrolls editable text', () => {
    const input = truncate(document.createElement('input'), 200);
    document.body.appendChild(input);
    expect(findTruncatedElement(input)).toBeNull();
  });
});

describe('findMarqueeTargets', () => {
  test('inside a host, every clipped text copy scrolls — not the box under the pointer', () => {
    // A button keeps two copies of its label and swaps them on hover: the copy
    // that took the pointer is the one about to disappear.
    const host = document.createElement('button');
    host.setAttribute('data-reqore-marquee', 'host');
    const visible = truncate(document.createElement('span'), 200);
    const hidden = truncate(document.createElement('span'), 200);
    const fits = truncate(document.createElement('span'), 0);
    [visible, hidden, fits].forEach((copy) => {
      copy.setAttribute('data-reqore-marquee', 'text');
      host.appendChild(copy);
    });
    document.body.appendChild(host);

    expect(findMarqueeTargets(visible)).toEqual([visible, hidden]);
    // Hovering the host itself (its icon, its padding) finds the copies too.
    expect(findMarqueeTargets(host)).toEqual([visible, hidden]);
  });

  test('outside a host, the single truncated box at or above the target', () => {
    const el = box(200);
    expect(findMarqueeTargets(el)).toEqual([el]);
    expect(findMarqueeTargets(box(0))).toEqual([]);
  });
});

describe('startMarquee', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'performance',
        'Date',
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('scrolls the tail in, holds, snaps back, goes again — and restores on stop', () => {
    const el = box(200); // 200px hidden at 40px/s → a 5s pass
    const stop = startMarquee(el, MARQUEE_DEFAULTS);

    // The ellipsis would sit on top of the moving text: clipped for the duration.
    expect(el.style.textOverflow).toBe('clip');
    expect(state(el)).toBe('running');

    vi.advanceTimersByTime(2500);
    expect(el.scrollLeft).toBeGreaterThan(0);
    expect(el.scrollLeft).toBeLessThan(200);

    vi.advanceTimersByTime(2700);
    expect(el.scrollLeft).toBe(200);
    expect(state(el)).toBe('end');

    // Holds for `pause`, then snaps back to the start…
    vi.advanceTimersByTime(MARQUEE_DEFAULTS.pause + 50);
    expect(el.scrollLeft).toBe(0);
    expect(state(el)).toBe('running');

    // …rests briefly, and scrolls again.
    vi.advanceTimersByTime(MARQUEE_DEFAULTS.rest + 1000);
    expect(el.scrollLeft).toBeGreaterThan(0);

    stop();
    expect(el.scrollLeft).toBe(0);
    expect(el.style.textOverflow).toBe('ellipsis');
    expect(state(el)).toBeNull();
  });

  test('a longer tail takes longer, not faster', () => {
    const short = box(100);
    const long = box(400);
    startMarquee(short, MARQUEE_DEFAULTS);
    startMarquee(long, MARQUEE_DEFAULTS);

    vi.advanceTimersByTime(2600); // past the short one's 2.5s pass
    expect(short.scrollLeft).toBe(100);
    expect(long.scrollLeft).toBeLessThan(400);
  });

  test('does nothing for a box whose text fits', () => {
    const el = box(0);
    startMarquee(el, MARQUEE_DEFAULTS);
    expect(el.style.textOverflow).toBe('ellipsis');
    expect(state(el)).toBeNull();
  });

  test('moves several copies of one label in step', () => {
    const a = box(200);
    const b = box(200);
    const stop = startMarquee([a, b], MARQUEE_DEFAULTS);

    vi.advanceTimersByTime(2500);
    expect(a.scrollLeft).toBeGreaterThan(0);
    expect(b.scrollLeft).toBe(a.scrollLeft);
    expect(state(b)).toBe('running');

    stop();
    expect(a.scrollLeft).toBe(0);
    expect(b.scrollLeft).toBe(0);
    expect(state(b)).toBeNull();
  });
});

describe('the provider installs it on the document', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'performance',
        'Date',
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mount = (options?: Parameters<typeof ReqoreUIProvider>[0]['options']) => {
    render(
      <ReqoreUIProvider options={options}>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <div data-testid='clipped'>A label far longer than the box it sits in</div>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    return truncate(document.querySelector('[data-testid="clipped"]') as HTMLElement, 200);
  };

  test('hovering a truncated box scrolls it; leaving stops and restores it', () => {
    const el = mount();

    fireEvent.mouseOver(el);
    vi.advanceTimersByTime(1000);
    expect(el.scrollLeft).toBeGreaterThan(0);
    expect(state(el)).toBe('running');

    fireEvent.mouseOut(el);
    expect(el.scrollLeft).toBe(0);
    expect(state(el)).toBeNull();
  });

  test('moving within the box does not restart it', () => {
    const el = mount();
    const inner = document.createElement('span');
    el.appendChild(inner);

    fireEvent.mouseOver(el);
    vi.advanceTimersByTime(1000);
    const midway = el.scrollLeft;
    fireEvent.mouseOut(el, { relatedTarget: inner });
    fireEvent.mouseOver(inner);
    vi.advanceTimersByTime(100);
    expect(el.scrollLeft).toBeGreaterThanOrEqual(midway);
  });

  test('animations.marquee: false turns it off', () => {
    const el = mount({ animations: { marquee: false } });
    fireEvent.mouseOver(el);
    vi.advanceTimersByTime(2000);
    expect(el.scrollLeft).toBe(0);
    expect(state(el)).toBeNull();
  });

  test('an object tunes it', () => {
    const el = mount({ animations: { marquee: { speed: 400 } } }); // 200px in 0.5s
    fireEvent.mouseOver(el);
    vi.advanceTimersByTime(700);
    expect(el.scrollLeft).toBe(200);
  });

  test('stays off under prefers-reduced-motion', () => {
    const matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });
    Object.defineProperty(window, 'matchMedia', { value: matchMedia, configurable: true });
    try {
      const el = mount();
      fireEvent.mouseOver(el);
      vi.advanceTimersByTime(2000);
      expect(el.scrollLeft).toBe(0);
    } finally {
      Object.defineProperty(window, 'matchMedia', { value: undefined, configurable: true });
    }
  });
});
