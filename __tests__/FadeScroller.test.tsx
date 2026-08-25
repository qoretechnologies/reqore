import { fireEvent, render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreFadeScroller,
  ReqoreLayoutContent,
  ReqoreTag,
  ReqoreUIProvider,
} from '../src';

const Chips = () => (
  <>
    <ReqoreTag label='order-sync' />
    <ReqoreTag label='invoice-export' />
    <ReqoreTag label='partner-recon' />
  </>
);

/*
 * jsdom reports every layout measurement as 0, so nothing overflows on its own and
 * the metrics have to be stated outright (see `setMetrics`). The gradients live on
 * `::before` / `::after`, which jsdom does not compute — but WHICH edge fades is
 * carried by a class on the wrapper, and that is plain DOM. So the decision is
 * assertable here even though the paint is not; the browser story tests cover how
 * it actually looks.
 */
const mount = (node: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{node}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const wrapper = () => document.querySelector('.reqore-fade-scroller') as HTMLElement;
const content = () => document.querySelector('.reqore-fade-scroller-content') as HTMLElement;

test('Renders <FadeScroller /> with its class hooks and children', () => {
  mount(
    <ReqoreFadeScroller>
      <Chips />
    </ReqoreFadeScroller>
  );

  expect(document.querySelectorAll('.reqore-fade-scroller').length).toBe(1);
  expect(document.querySelectorAll('.reqore-fade-scroller-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-tag').length).toBe(3);
});

test('Renders <FadeScroller /> as a single non-wrapping scrollable row', () => {
  mount(
    <ReqoreFadeScroller>
      <Chips />
    </ReqoreFadeScroller>
  );

  const style = getComputedStyle(content());

  expect(style.display).toBe('flex');
  expect(style.flexWrap).toBe('nowrap');
  expect(style.overflowX).toBe('auto');
  expect(style.overflowY).toBe('hidden');
});

test('Renders <FadeScroller /> with a custom className merged in', () => {
  mount(
    <ReqoreFadeScroller className='my-rail'>
      <Chips />
    </ReqoreFadeScroller>
  );

  expect(wrapper().classList.contains('my-rail')).toBe(true);
  expect(wrapper().classList.contains('reqore-fade-scroller')).toBe(true);
});

test('Renders <FadeScroller /> with each gap size', () => {
  // the shared GAP_FROM_SIZE scale, so a change to it fails here rather than silently
  const gaps: [string, string][] = [
    ['tiny', '1px'],
    ['small', '3px'],
    ['normal', '5px'],
    ['big', '18px'],
    ['huge', '30px'],
  ];

  gaps.forEach(([gapSize, expected]) => {
    const { unmount } = mount(
      <ReqoreFadeScroller gapSize={gapSize as any}>
        <Chips />
      </ReqoreFadeScroller>
    );

    expect(getComputedStyle(content()).gap).toBe(expected);

    unmount();
  });
});

test('Renders <FadeScroller /> aligned per verticalAlign', () => {
  mount(
    <ReqoreFadeScroller verticalAlign='flex-end'>
      <Chips />
    </ReqoreFadeScroller>
  );

  expect(getComputedStyle(content()).alignItems).toBe('flex-end');
});

/* Plain divs rather than tags for the two rigid cases: `ReqoreTag` pins its own
   `flex-shrink: 0`, so it looks identical either way and would prove nothing. A bare
   div sits on the flex default (`0 1 auto`), which the `& > *` rule visibly overrides. */
test('Renders <FadeScroller /> rigid by default so children keep their width', () => {
  mount(
    <ReqoreFadeScroller>
      <div>order-sync</div>
    </ReqoreFadeScroller>
  );

  const child = content().firstElementChild as HTMLElement;

  expect(getComputedStyle(child).flexGrow).toBe('0');
  expect(getComputedStyle(child).flexShrink).toBe('0');
});

test('Renders <FadeScroller /> with rigid off, leaving children their own flex', () => {
  mount(
    <ReqoreFadeScroller rigid={false}>
      <div>order-sync</div>
    </ReqoreFadeScroller>
  );

  const child = content().firstElementChild as HTMLElement;

  // no `& > *` override, so the child is back on the flex default and can shrink
  expect(getComputedStyle(child).flexShrink).not.toBe('0');
});

test('Renders <FadeScroller /> fluid by default', () => {
  mount(
    <ReqoreFadeScroller>
      <Chips />
    </ReqoreFadeScroller>
  );

  expect(getComputedStyle(wrapper()).width).toBe('100%');
});

test('Renders <FadeScroller /> sized to its content when not fluid', () => {
  mount(
    <ReqoreFadeScroller fluid={false}>
      <Chips />
    </ReqoreFadeScroller>
  );

  expect(getComputedStyle(wrapper()).width).toBe('auto');
});

test('Renders <FadeScroller /> with an intent', () => {
  mount(
    <ReqoreFadeScroller intent='danger'>
      <Chips />
    </ReqoreFadeScroller>
  );

  // the fade itself lives on ::before / ::after and is asserted in the browser
  // story test; here we only guard that an intent doesn't break the render
  expect(document.querySelectorAll('.reqore-fade-scroller').length).toBe(1);
  expect(document.querySelectorAll('.reqore-tag').length).toBe(3);
});

test('Renders <FadeScroller /> with a customTheme', () => {
  mount(
    <ReqoreFadeScroller customTheme={{ main: '#1d3b2a' }}>
      <Chips />
    </ReqoreFadeScroller>
  );

  expect(document.querySelectorAll('.reqore-fade-scroller').length).toBe(1);
});

test('Renders <FadeScroller /> with a tooltip', () => {
  mount(
    <ReqoreFadeScroller tooltip='Scroll sideways for the rest'>
      <Chips />
    </ReqoreFadeScroller>
  );

  expect(document.querySelectorAll('.reqore-fade-scroller').length).toBe(1);
  expect(document.querySelectorAll('.reqore-tag').length).toBe(3);
});

/*
 * Which edges fade.
 *
 * The component measures the scroll box and toggles a class per edge; the class is
 * what the gradient's opacity hangs off. jsdom has no layout, so state the metrics
 * and fire the scroll event the component already listens for.
 */

const setMetrics = (
  element: HTMLElement,
  { scrollLeft = 0, clientWidth = 500, scrollWidth = 2000 } = {}
) => {
  Object.defineProperty(element, 'clientWidth', { value: clientWidth, configurable: true });
  Object.defineProperty(element, 'scrollWidth', { value: scrollWidth, configurable: true });
  Object.defineProperty(element, 'scrollLeft', {
    value: scrollLeft,
    configurable: true,
    writable: true,
  });
  fireEvent.scroll(element);
};

const fades = () => ({
  left: wrapper().classList.contains('reqore-fade-scroller-fade-left'),
  right: wrapper().classList.contains('reqore-fade-scroller-fade-right'),
});

test('Fades only the right edge at the start of an overflowing row', () => {
  mount(
    <ReqoreFadeScroller>
      <Chips />
    </ReqoreFadeScroller>
  );
  setMetrics(content(), { scrollLeft: 0 });

  // Nothing is hidden to the left yet, everything past the viewport is to the right.
  expect(fades()).toEqual({ left: false, right: true });
});

test('Fades both edges in the middle of an overflowing row', () => {
  mount(
    <ReqoreFadeScroller>
      <Chips />
    </ReqoreFadeScroller>
  );
  setMetrics(content(), { scrollLeft: 700 });

  expect(fades()).toEqual({ left: true, right: true });
});

test('Fades only the left edge at the end of an overflowing row', () => {
  mount(
    <ReqoreFadeScroller>
      <Chips />
    </ReqoreFadeScroller>
  );
  setMetrics(content(), { scrollLeft: 1500 });

  expect(fades()).toEqual({ left: true, right: false });
});

test('Fades neither edge when the row fits', () => {
  mount(
    <ReqoreFadeScroller>
      <Chips />
    </ReqoreFadeScroller>
  );
  setMetrics(content(), { scrollLeft: 0, clientWidth: 500, scrollWidth: 500 });

  // A row with nothing out of view must not advertise that there is more.
  expect(fades()).toEqual({ left: false, right: false });
});

test('Fades neither edge with fade={false}, even while overflowing', () => {
  mount(
    <ReqoreFadeScroller fade={false}>
      <Chips />
    </ReqoreFadeScroller>
  );
  setMetrics(content(), { scrollLeft: 700 });

  expect(fades()).toEqual({ left: false, right: false });
});

test('Stops fading once a row that overflowed no longer does', () => {
  mount(
    <ReqoreFadeScroller>
      <Chips />
    </ReqoreFadeScroller>
  );
  setMetrics(content(), { scrollLeft: 700 });
  expect(fades()).toEqual({ left: true, right: true });

  // The class has to be REMOVED as well as added — a toggle that only ever adds
  // leaves a fade advertising content that is no longer there.
  setMetrics(content(), { scrollLeft: 0, clientWidth: 500, scrollWidth: 500 });
  expect(fades()).toEqual({ left: false, right: false });
});
