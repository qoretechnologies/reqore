import { act, render } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { afterEach, beforeEach, vi } from 'vitest';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreStatistic,
  ReqoreUIProvider,
} from '../src';
import { IReqoreStatisticProps } from '../src/components/Statistic';

const renderStatistic = (props: IReqoreStatisticProps) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic {...props} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const statistic = () => document.querySelector('.reqore-statistic') as HTMLElement;
const part = (name: 'value' | 'prefix' | 'suffix' | 'value-row') =>
  document.querySelector(`.reqore-statistic-${name}`) as HTMLElement;
const headings = () => Array.from(statistic().querySelectorAll('h1, h2, h3, h4, h5, h6'));

/* ------------------------------------------------------------------------------------------------
 * valueAs
 * ---------------------------------------------------------------------------------------------- */

test('Without valueAs the prefix, value and suffix are each a heading, as they always were', () => {
  renderStatistic({ value: '1,200', prefix: '$', suffix: '/mo', label: 'Revenue' });

  expect(headings().map((heading) => heading.tagName)).toEqual(['H2', 'H2', 'H2']);
  expect(part('value').tagName).toBe('H2');
  expect(part('value-row').tagName).toBe('DIV');
});

test('valueAs="p" writes the whole value as one paragraph and no heading', () => {
  renderStatistic({ value: '1,200', prefix: '$', suffix: '/mo', label: 'Revenue', valueAs: 'p' });

  expect(headings()).toHaveLength(0);
  expect(part('value-row').tagName).toBe('P');
  expect(part('value-row').textContent).toBe('$1,200/mo');
  expect(['prefix', 'value', 'suffix'].map((name) => part(name as 'value').tagName)).toEqual([
    'SPAN',
    'SPAN',
    'SPAN',
  ]);
});

test('valueAs keeps the look: the size of the heading it replaces, bold, no margin', () => {
  const { unmount } = renderStatistic({ value: '1,200', prefix: '$' });
  const before = {
    value: getComputedStyle(part('value')).fontSize,
    prefix: getComputedStyle(part('prefix')).fontSize,
    prefixOpacity: getComputedStyle(part('prefix')).opacity,
  };
  unmount();

  renderStatistic({ value: '1,200', prefix: '$', valueAs: 'div' });

  expect(getComputedStyle(part('value')).fontSize).toBe(before.value);
  expect(getComputedStyle(part('prefix')).fontSize).toBe(before.prefix);
  expect(getComputedStyle(part('prefix')).opacity).toBe(before.prefixOpacity);
  // A heading is bold by the browser's stylesheet; a div is not, so the row says so.
  expect(getComputedStyle(part('value-row')).fontWeight).toBe('bold');
  expect(getComputedStyle(part('value-row')).margin).toBe('0px');
});

test('valueAs="h3" puts ONE heading, of that level, in the outline', () => {
  renderStatistic({ value: '99.9', suffix: '%', valueAs: 'h3' });

  expect(headings().map((heading) => heading.tagName)).toEqual(['H3']);
  expect(headings()[0].textContent).toBe('99.9%');
  // The size still comes from `size` (normal → the h2 size, 24px), not from the level.
  expect(getComputedStyle(part('value')).fontSize).toBe('24px');
  // A heading row brings its own weight; the row does not override it.
  expect(part('value-row').style.fontWeight).toBe('');
});

test('valueEffect still styles the value under valueAs', () => {
  renderStatistic({ value: 42, valueAs: 'span', valueEffect: { color: '#ff0000' } });

  expect(getComputedStyle(part('value')).color).toBe('rgb(255, 0, 0)');
});

/* ------------------------------------------------------------------------------------------------
 * countUp
 * ---------------------------------------------------------------------------------------------- */

let frames: FrameRequestCallback[] = [];

/** Run the queued animation frames at `time` ms. */
const frameAt = (time: number) =>
  act(() => {
    const queued = frames;
    frames = [];
    queued.forEach((callback) => callback(time));
  });

beforeEach(() => {
  frames = [];
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const shown = () =>
  (part('value').querySelector('.reqore-statistic-value-count') ?? part('value')).textContent;
const final = () => part('value').querySelector('.reqore-statistic-value-final');

test('Without countUp the value is written once, with nothing hidden around it', () => {
  renderStatistic({ value: '1,234' });

  expect(part('value').innerHTML).toBe('1,234');
});

test('countUp shows the start until the value is in view, and reads the value meanwhile', () => {
  renderStatistic({ value: '1,234', countUp: true });

  expect(shown()).toBe('0');
  // The moving number is hidden from assistive technology; the value is read instead.
  expect(part('value').querySelector('[aria-hidden="true"]').textContent).toBe('0');
  expect(final().textContent).toBe('1,234');
  expect(part('value').textContent).toBe('01,234');

  // Not in view yet: no frame is asked for.
  frameAt(0);
  expect(shown()).toBe('0');
});

test('countUp counts once in view, in the value format, and ends on the value as given', () => {
  renderStatistic({ value: '1,234', countUp: true });

  mockAllIsIntersecting(true);
  frameAt(0);
  expect(shown()).toBe('0');

  // Half the time, eased out: 1234 × (1 − 0.5³) = 1079.75.
  frameAt(500);
  expect(shown()).toBe('1,080');

  frameAt(1000);
  // The last frame is the value itself, and nothing is left around it.
  expect(part('value').innerHTML).toBe('1,234');
  expect(final()).toBeNull();
});

test('countUp keeps decimals and the text around the number', () => {
  renderStatistic({ value: '$1.2M', countUp: { duration: 400 } });

  expect(shown()).toBe('$0.0M');

  mockAllIsIntersecting(true);
  frameAt(0);
  frameAt(100);
  // A quarter of the time, eased out: 1.2 × (1 − 0.75³) = 0.69375, at the value's one decimal.
  expect(shown()).toBe('$0.7M');

  frameAt(400);
  expect(part('value').innerHTML).toBe('$1.2M');
});

test('countUp counts a number value and honours from and duration', () => {
  renderStatistic({ value: 200, countUp: { from: 100, duration: 2000 } });

  expect(shown()).toBe('100');

  mockAllIsIntersecting(true);
  frameAt(10);
  frameAt(1010);
  // 100 + 100 × 0.875
  expect(shown()).toBe('188');

  frameAt(2010);
  expect(part('value').innerHTML).toBe('200');
});

test('countUp waits for the threshold share of the value to be in view', () => {
  renderStatistic({ value: 50, countUp: { threshold: 0.5 } });

  mockAllIsIntersecting(0.25);
  frameAt(0);
  expect(shown()).toBe('0');
  expect(frames).toHaveLength(0);

  mockAllIsIntersecting(0.75);
  frameAt(0);
  frameAt(1000);
  expect(part('value').innerHTML).toBe('50');
});

test('countUp writes every frame with format, and ends on format(value)', () => {
  const format = (value: number) => `${Math.round(value)} orders`;

  renderStatistic({ value: 80, countUp: { format } });

  expect(shown()).toBe('0 orders');
  expect(final().textContent).toBe('80 orders');

  mockAllIsIntersecting(true);
  frameAt(0);
  frameAt(500);
  expect(shown()).toBe('70 orders');

  frameAt(1000);
  expect(part('value').innerHTML).toBe('80 orders');
});

test('countUp shows a value that is not one number at once', () => {
  renderStatistic({ value: '2–4', countUp: true });

  expect(part('value').innerHTML).toBe('2–4');
  expect(final()).toBeNull();
});

test('countUp shows the value at once under prefers-reduced-motion', () => {
  const matchMedia = window.matchMedia;

  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;

  try {
    renderStatistic({ value: '1,234', countUp: true });

    expect(part('value').innerHTML).toBe('1,234');
    expect(final()).toBeNull();
    expect(frames).toHaveLength(0);
  } finally {
    window.matchMedia = matchMedia;
  }
});

test('A value that changes after the count is shown at once', () => {
  const { rerender } = renderStatistic({ value: 10, countUp: { duration: 100 } });

  mockAllIsIntersecting(true);
  frameAt(0);
  frameAt(100);
  expect(part('value').innerHTML).toBe('10');

  rerender(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={25} countUp={{ duration: 100 }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(part('value').innerHTML).toBe('25');
  expect(frames).toHaveLength(0);
});

test('countUp works with valueAs', () => {
  renderStatistic({ value: '64', suffix: '%', valueAs: 'p', countUp: { duration: 100 } });

  expect(part('value-row').tagName).toBe('P');
  expect(shown()).toBe('0');

  mockAllIsIntersecting(true);
  frameAt(0);
  frameAt(100);
  expect(part('value-row').textContent).toBe('64%');
});
