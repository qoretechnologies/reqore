import { render } from '@testing-library/react';
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
 * Two things are out of reach here and are covered by the browser story tests
 * instead: jsdom reports every layout measurement as 0, so `scrollWidth >
 * clientWidth` never becomes true and the fade can't be triggered; and the fades
 * themselves live on `::before` / `::after`, which jsdom does not compute. What IS
 * assertable here is everything the props drive on real elements — the row rules,
 * the gap, the widths, the class hooks and the standard prop contract.
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
