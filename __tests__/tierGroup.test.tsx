import { act, fireEvent, render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTier, ReqoreUIProvider } from '../src';
import { IReqoreTierProps } from '../src/components/Tier';
import {
  getInitialTierIndex,
  getTierStackItemStyle,
  getTierStackOffset,
  getTierSwipeStep,
  IReqoreTierGroupProps,
  normalizeTierIndex,
  ReqoreTierGroup,
  TIER_GROUP_DOT_FROM_SIZE,
  TIER_STACK,
} from '../src/components/Tier/group';

/* ------------------------------------------------------------------------------------------------
 * The stack's arithmetic
 * ---------------------------------------------------------------------------------------------- */

test('normalizeTierIndex holds an index to the ends, or wraps it round with loop', () => {
  expect(normalizeTierIndex(-1, 3)).toBe(0);
  expect(normalizeTierIndex(3, 3)).toBe(2);
  expect(normalizeTierIndex(1, 3)).toBe(1);

  expect(normalizeTierIndex(-1, 3, true)).toBe(2);
  expect(normalizeTierIndex(3, 3, true)).toBe(0);
  expect(normalizeTierIndex(-4, 3, true)).toBe(2);
  expect(normalizeTierIndex(7, 3, true)).toBe(1);

  expect(normalizeTierIndex(5, 0)).toBe(0);
  expect(normalizeTierIndex(5, 0, true)).toBe(0);
});

test('getTierStackOffset counts the steps from the front, the shorter way round with loop', () => {
  // Without loop: the plain difference, so the ends have no neighbour outside.
  expect([0, 1, 2].map((index) => getTierStackOffset(index, 0, 3))).toEqual([0, 1, 2]);
  expect([0, 1, 2].map((index) => getTierStackOffset(index, 2, 3))).toEqual([-2, -1, 0]);

  // With loop: the last tier is the first one's left neighbour.
  expect([0, 1, 2].map((index) => getTierStackOffset(index, 0, 3, true))).toEqual([0, 1, -1]);
  // Four tiers: the one opposite the front is two steps away, on the right (a tie).
  expect([0, 1, 2, 3].map((index) => getTierStackOffset(index, 0, 4, true))).toEqual([0, 1, 2, -1]);
  expect([0, 1, 2, 3].map((index) => getTierStackOffset(index, 3, 4, true))).toEqual([1, 2, -1, 0]);
  // Two tiers: the other one is on the right.
  expect([0, 1].map((index) => getTierStackOffset(index, 0, 2, true))).toEqual([0, 1]);
});

test('getInitialTierIndex starts on the asked index, else the first highlighted tier, else 0', () => {
  expect(getInitialTierIndex([false, true, false])).toBe(1);
  expect(getInitialTierIndex([false, true, true])).toBe(1);
  expect(getInitialTierIndex([false, false, false])).toBe(0);
  expect(getInitialTierIndex([false, true, false], 2)).toBe(2);
  expect(getInitialTierIndex([false, true, false], 0)).toBe(0);
  expect(getInitialTierIndex([false, true, false], 9)).toBe(2);
  expect(getInitialTierIndex([false, true, false], -3)).toBe(0);
  expect(getInitialTierIndex([], 2)).toBe(0);
});

test('getTierSwipeStep: far or fast enough brings the next or previous tier to the front', () => {
  const width = 300;
  const far = width * TIER_STACK.swipeDistance + 1;

  // Dragged to the left: the next tier. To the right: the previous one.
  expect(getTierSwipeStep(-far, 0, width)).toBe(1);
  expect(getTierSwipeStep(far, 0, width)).toBe(-1);

  // Short and slow: back where it was.
  expect(getTierSwipeStep(-30, 0.1, width)).toBe(0);

  // Short but quick, in the direction it went: a flick counts.
  expect(getTierSwipeStep(-30, -(TIER_STACK.swipeVelocity + 0.1), width)).toBe(1);
  expect(getTierSwipeStep(30, TIER_STACK.swipeVelocity + 0.1, width)).toBe(-1);

  // Quick the other way (a finger that turned back): not a flick.
  expect(getTierSwipeStep(-30, TIER_STACK.swipeVelocity + 0.1, width)).toBe(0);

  // Under the slop it is a press, whatever the speed.
  expect(getTierSwipeStep(-(TIER_STACK.slop - 1), -5, width)).toBe(0);

  // Without a width, only speed decides.
  expect(getTierSwipeStep(-200, 0, 0)).toBe(0);
  expect(getTierSwipeStep(-200, -1, 0)).toBe(1);
});

test('getTierStackItemStyle: the front at full size, neighbours smaller, dimmed and turned', () => {
  const front = getTierStackItemStyle(0, { peek: 20, brightness: 0.6 });

  expect(front.transform).toBe('translateX(calc(0% + 0px)) scale(1)');
  expect(front.filter).toBeUndefined();
  expect(front.opacity).toBe(1);

  const right = getTierStackItemStyle(1, { peek: 20, brightness: 0.6 });
  const left = getTierStackItemStyle(-1, { peek: 20, brightness: 0.6 });

  // Moved out by half the width the scale took, plus the peek; turned to face the front.
  expect(right.transform).toBe(
    `translateX(calc(5% + 20px)) scale(${TIER_STACK.neighbourScale}) rotateY(-${TIER_STACK.neighbourRotate}deg)`
  );
  expect(left.transform).toBe(
    `translateX(calc(-5% + -20px)) scale(${TIER_STACK.neighbourScale}) rotateY(${TIER_STACK.neighbourRotate}deg)`
  );
  expect(right.filter).toBe('brightness(0.6)');
  expect(right.opacity).toBe(1);
  expect(front.zIndex).toBeGreaterThan(right.zIndex);

  // Two steps away: smaller still, and faded out.
  const hidden = getTierStackItemStyle(2, { peek: 20, brightness: 0.6 });

  expect(hidden.opacity).toBe(0);
  expect(hidden.transform).toContain(`scale(${TIER_STACK.hiddenScale})`);
  expect(right.zIndex).toBeGreaterThan(hidden.zIndex);

  // Half way through a swipe: half way between the front and a neighbour.
  expect(getTierStackItemStyle(0.5, { peek: 20, brightness: 0.6 }).filter).toBe('brightness(0.8)');

  // Reduced motion: the stack lies flat.
  expect(getTierStackItemStyle(1, { peek: 20, reducedMotion: true }).transform).not.toContain(
    'rotateY'
  );
});

/* ------------------------------------------------------------------------------------------------
 * ReqoreTierGroup
 * ---------------------------------------------------------------------------------------------- */

const PLANS: IReqoreTierProps[] = [
  { name: 'Starter', price: 0, currency: '$', priceDetail: '/ month' },
  { name: 'Pro', price: 49, currency: '$', priceDetail: '/ month', highlight: true },
  { name: 'Enterprise', price: 'Custom', currency: '$' },
];

const renderGroup = (props: Partial<IReqoreTierGroupProps> = {}, plans = PLANS) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTierGroup appearance='modern' {...props}>
            {plans.map((plan) => (
              <ReqoreTier key={plan.name} {...plan} />
            ))}
          </ReqoreTierGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** The group's own width, as its ResizeObserver reports it. */
class WidthResizeObserver {
  static width = 360;
  readonly disconnect = vi.fn();
  constructor(readonly callback: ResizeObserverCallback) {}
  observe(target: Element) {
    this.callback(
      [{ target, contentRect: { width: WidthResizeObserver.width } } as ResizeObserverEntry],
      this as unknown as ResizeObserver
    );
  }
  unobserve() {}
}

let originalResizeObserver: typeof ResizeObserver;

beforeEach(() => {
  originalResizeObserver = globalThis.ResizeObserver;
  (globalThis as Record<string, unknown>).ResizeObserver = WidthResizeObserver;
  WidthResizeObserver.width = 360;
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});

const group = () => document.querySelector('.reqore-tier-group') as HTMLElement;
const items = () =>
  Array.from(document.querySelectorAll('.reqore-tier-group-item')) as HTMLElement[];
const frontName = () =>
  document.querySelector('.reqore-tier-group-item-front .reqore-tier-name')?.textContent;
const dots = () => Array.from(document.querySelectorAll('.reqore-tier-group-dot')) as HTMLElement[];
const button = (name: 'previous' | 'next') =>
  document.querySelector(`.reqore-tier-group-${name}`) as HTMLButtonElement;
const press = (key: string) => fireEvent.keyDown(group(), { key });

test('A tier group is a row by default, even on a narrow container, with no stack controls', () => {
  renderGroup({ appearance: 'modern' });

  expect(group().getAttribute('data-layout')).toBe('row');
  expect(items()).toHaveLength(3);
  expect(document.querySelectorAll('.reqore-tier')).toHaveLength(3);
  expect(document.querySelector('.reqore-tier-group-controls')).toBeNull();
  expect(items().some((item) => item.hasAttribute('inert'))).toBe(false);
});

test('A tier group hands its appearance and size to tiers that do not set their own', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreTierGroup appearance='modern' size='small'>
        <ReqoreTier name='Starter' price={0} currency='$' />
        <ReqoreTier name='Pro' price={49} currency='$' appearance='classic' />
        <ReqoreTier name='Team' price={99} currency='$' size='big' />
      </ReqoreTierGroup>
    </ReqoreUIProvider>
  );

  const [starter, pro, team] = Array.from(document.querySelectorAll('.reqore-tier'));

  expect(starter.classList.contains('reqore-tier-modern')).toBe(true);
  // Its own appearance wins: the classic tier, its price a heading and its name not one.
  expect(pro.classList.contains('reqore-tier-modern')).toBe(false);
  expect(pro.querySelector('.reqore-heading')!.textContent).toBe('$49');
  expect(pro.querySelector('.reqore-tier-name')).toBeNull();
  // The group's size, and a tier's own.
  expect(getComputedStyle(starter.querySelector('.reqore-tier-price-value')!).fontSize).toBe(
    '32px'
  );
  expect(getComputedStyle(team.querySelector('.reqore-tier-price-value')!).fontSize).toBe('48px');
});

test('A tier group stays a row on a wide container, with mobileLayout="stack"', () => {
  WidthResizeObserver.width = 1100;
  renderGroup({ mobileLayout: 'stack' });

  expect(group().getAttribute('data-layout')).toBe('row');
  expect(document.querySelector('.reqore-tier-group-controls')).toBeNull();
});

test('A narrow stack puts the highlighted tier in front and makes the others inert', () => {
  renderGroup({ mobileLayout: 'stack' });

  expect(group().getAttribute('data-layout')).toBe('stack');
  expect(group().getAttribute('role')).toBe('region');
  expect(group().getAttribute('aria-roledescription')).toBe('carousel');
  expect(group().getAttribute('aria-label')).toBe('Plans');
  // The carousel itself takes the focus the arrow keys work from.
  expect(group().tabIndex).toBe(0);
  expect(frontName()).toBe('Pro');
  expect(items().map((item) => item.hasAttribute('inert'))).toEqual([true, false, true]);
  expect(items().map((item) => item.getAttribute('data-offset'))).toEqual(['-1', '0', '1']);
  expect(items()[1].getAttribute('aria-roledescription')).toBe('slide');
  expect(items()[1].getAttribute('aria-label')).toBe('Pro, 2 of 3');
  expect(dots().map((dot) => dot.getAttribute('aria-current'))).toEqual([null, 'true', null]);
  expect(dots().map((dot) => dot.getAttribute('aria-label'))).toEqual([
    'Starter',
    'Pro',
    'Enterprise',
  ]);
  expect(document.querySelector('.reqore-tier-group-status')!.textContent).toBe('Pro, 2 of 3');
});

test('mobileBreakpoint decides how narrow is narrow', () => {
  WidthResizeObserver.width = 600;

  const { unmount } = renderGroup({ mobileLayout: 'stack' });

  expect(group().getAttribute('data-layout')).toBe('row');
  unmount();

  renderGroup({ mobileLayout: 'stack', mobileBreakpoint: 640 });
  expect(group().getAttribute('data-layout')).toBe('stack');
});

test('The arrow keys, Home and End bring tiers to the front, held at the ends', () => {
  const onActiveIndexChange = vi.fn();

  renderGroup({ mobileLayout: 'stack', onActiveIndexChange });

  press('ArrowRight');
  expect(frontName()).toBe('Enterprise');
  expect(onActiveIndexChange).toHaveBeenLastCalledWith(2);

  // The last tier is an end.
  press('ArrowRight');
  expect(frontName()).toBe('Enterprise');
  expect(onActiveIndexChange).toHaveBeenCalledTimes(1);
  expect(button('next').disabled).toBe(true);

  press('Home');
  expect(frontName()).toBe('Starter');
  expect(button('previous').disabled).toBe(true);

  press('ArrowLeft');
  expect(frontName()).toBe('Starter');

  press('End');
  expect(frontName()).toBe('Enterprise');
  expect(onActiveIndexChange.mock.calls.map(([index]) => index)).toEqual([2, 0, 2]);
});

test('Keys typed into a text field inside a tier are left to the field', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreTierGroup appearance='modern' mobileLayout='stack'>
        <ReqoreTier name='Starter' price={0} currency='$' />
        <ReqoreTier
          name='Pro'
          price={49}
          currency='$'
          highlight
          description={<input className='seats' defaultValue='5' />}
        />
      </ReqoreTierGroup>
    </ReqoreUIProvider>
  );

  fireEvent.keyDown(document.querySelector('.seats') as HTMLElement, { key: 'ArrowLeft' });
  expect(frontName()).toBe('Pro');
});

test('With loop, stepping past either end wraps round and the buttons never disable', () => {
  renderGroup({ mobileLayout: 'stack', loop: true, defaultActiveIndex: 0 });

  expect(frontName()).toBe('Starter');
  expect(button('previous').disabled).toBe(false);
  expect(items().map((item) => item.getAttribute('data-offset'))).toEqual(['0', '1', '-1']);

  press('ArrowLeft');
  expect(frontName()).toBe('Enterprise');

  press('ArrowRight');
  expect(frontName()).toBe('Starter');
});

test('The previous and next buttons and the dots bring tiers to the front', () => {
  renderGroup({ mobileLayout: 'stack' });

  fireEvent.click(button('next'));
  expect(frontName()).toBe('Enterprise');

  fireEvent.click(button('previous'));
  expect(frontName()).toBe('Pro');

  fireEvent.click(dots()[0]);
  expect(frontName()).toBe('Starter');
  expect(dots()[0].getAttribute('aria-current')).toBe('true');
  expect(document.querySelector('.reqore-tier-group-status')!.textContent).toBe('Starter, 1 of 3');
});

test('A controlled stack reports the choice and shows the index it is given', () => {
  const onActiveIndexChange = vi.fn();
  const { rerender } = render(
    <ReqoreUIProvider>
      <ReqoreTierGroup
        appearance='modern'
        mobileLayout='stack'
        activeIndex={0}
        onActiveIndexChange={onActiveIndexChange}
      >
        {PLANS.map((plan) => (
          <ReqoreTier key={plan.name} {...plan} />
        ))}
      </ReqoreTierGroup>
    </ReqoreUIProvider>
  );

  expect(frontName()).toBe('Starter');

  press('ArrowRight');
  expect(onActiveIndexChange).toHaveBeenCalledWith(1);
  // Not moved until the owner says so.
  expect(frontName()).toBe('Starter');

  rerender(
    <ReqoreUIProvider>
      <ReqoreTierGroup
        appearance='modern'
        mobileLayout='stack'
        activeIndex={1}
        onActiveIndexChange={onActiveIndexChange}
      >
        {PLANS.map((plan) => (
          <ReqoreTier key={plan.name} {...plan} />
        ))}
      </ReqoreTierGroup>
    </ReqoreUIProvider>
  );
  expect(frontName()).toBe('Pro');
});

test('Labels can be translated', () => {
  renderGroup({
    mobileLayout: 'stack',
    stackLabel: 'Tarife',
    previousLabel: 'Zurück',
    nextLabel: 'Weiter',
    stackItemLabel: (name, index, count) => `${name} (${index + 1}/${count})`,
  });

  expect(group().getAttribute('aria-label')).toBe('Tarife');
  expect(button('previous').getAttribute('aria-label')).toBe('Zurück');
  expect(button('next').getAttribute('aria-label')).toBe('Weiter');
  expect(items()[1].getAttribute('aria-label')).toBe('Pro (2/3)');
});

test('The stack animates its switch, unless the user asked for reduced motion', () => {
  const { unmount } = renderGroup({ mobileLayout: 'stack' });

  expect(getComputedStyle(items()[1]).transition).toContain('transform');
  expect(items()[0].style.transform).toContain('rotateY');
  unmount();

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
    renderGroup({ mobileLayout: 'stack' });

    expect(getComputedStyle(items()[1]).transition).toBe('none');
    expect(items().some((item) => item.style.transform.includes('rotateY'))).toBe(false);
    // Still switches, at once.
    press('ArrowRight');
    expect(frontName()).toBe('Enterprise');
  } finally {
    window.matchMedia = matchMedia;
  }
});

test('size scales the stack controls; intent colours the front dot', () => {
  renderGroup({ mobileLayout: 'stack', size: 'big', intent: 'success' });

  expect(getComputedStyle(dots()[0]).width).toBe(`${TIER_GROUP_DOT_FROM_SIZE.big}px`);
  expect(button('next').className).toContain('reqore-button');
});

test('A stack with one tier has no controls', () => {
  renderGroup({ mobileLayout: 'stack' }, [PLANS[0]]);

  expect(group().getAttribute('data-layout')).toBe('stack');
  expect(document.querySelector('.reqore-tier-group-controls')).toBeNull();
  expect(items()[0].hasAttribute('inert')).toBe(false);
});

test('A tier group forwards its ref, className and attributes', () => {
  const ref = { current: null as HTMLDivElement | null };

  render(
    <ReqoreUIProvider>
      <ReqoreTierGroup ref={ref} className='plans' data-section='pricing'>
        {PLANS.map((plan) => (
          <ReqoreTier key={plan.name} {...plan} />
        ))}
      </ReqoreTierGroup>
    </ReqoreUIProvider>
  );

  act(() => undefined);

  expect(ref.current).toBe(group());
  expect(group().classList.contains('plans')).toBe(true);
  expect(group().getAttribute('data-section')).toBe('pricing');
});

test('A narrow group is a stack from the first paint: it is measured before the browser paints', () => {
  // An observer that never reports: only the measurement made on mount can decide.
  class SilentResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  (globalThis as Record<string, unknown>).ResizeObserver = SilentResizeObserver;

  const clientWidth = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(320);

  try {
    renderGroup({ mobileLayout: 'stack' });

    expect(group().getAttribute('data-layout')).toBe('stack');
    expect(frontName()).toBe('Pro');
  } finally {
    clientWidth.mockRestore();
  }
});

test("A tier group's customTheme reaches its tiers", () => {
  const surface = () =>
    getComputedStyle(document.querySelector('.reqore-tier') as HTMLElement).backgroundColor;
  const { unmount } = renderGroup({});
  const plain = surface();

  unmount();
  renderGroup({ customTheme: { main: '#10233a' } });

  expect(surface()).not.toBe(plain);
  expect(surface()).toMatch(/^rgba?\(/);
});

test('The highlighted tier comes to the front when the tiers arrive after the group mounted', () => {
  const stack = (plans: IReqoreTierProps[]) => (
    <ReqoreUIProvider>
      <ReqoreTierGroup appearance='modern' mobileLayout='stack'>
        {plans.map((plan) => (
          <ReqoreTier key={plan.name} {...plan} />
        ))}
      </ReqoreTierGroup>
    </ReqoreUIProvider>
  );
  const { rerender } = render(stack([PLANS[0]]));

  expect(frontName()).toBe('Starter');

  // The plans load.
  rerender(stack(PLANS));
  expect(frontName()).toBe('Pro');

  // Once the user has chosen, the choice stays.
  press('ArrowRight');
  expect(frontName()).toBe('Enterprise');
  rerender(stack(PLANS));
  expect(frontName()).toBe('Enterprise');
});
