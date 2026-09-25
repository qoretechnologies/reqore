import { getClippingBoundary } from '../src/components/InternalPopover/hideModifier';

/** The state Popper hands a modifier, reduced to what the boundary reads:
 *  the trigger and the scroll parents Popper listed for it. */
const stateFor = (reference: Element | object, scrollParents: unknown[]) =>
  ({
    elements: { reference, popper: document.createElement('div') },
    scrollParents: { reference: scrollParents, popper: [] },
  }) as any;

const element = (style: Partial<CSSStyleDeclaration> = {}) => {
  const node = document.createElement('div');
  Object.assign(node.style, style);
  document.body.appendChild(node);
  return node;
};

afterEach(() => {
  document.body.innerHTML = '';
});

test('is exactly Popper’s own boundary when no clipping ancestor lacks a box', () => {
  const trigger = element();
  const table = element({ overflow: 'auto' });

  expect(getClippingBoundary(stateFor(trigger, [table, document.body, window]))).toBe(
    'clippingParents'
  );
});

test('leaves out a display: contents ancestor, and keeps the ones that clip', () => {
  const trigger = element();
  const wrapper = element({ display: 'contents', overflow: 'hidden' });
  const table = element({ overflow: 'auto' });

  expect(getClippingBoundary(stateFor(trigger, [wrapper, table, document.body, window]))).toEqual([
    table,
  ]);
});

test('an empty boundary when the only clipping ancestor has no box — the viewport alone decides', () => {
  const trigger = element();
  const wrapper = element({ display: 'contents', overflow: 'hidden' });

  expect(getClippingBoundary(stateFor(trigger, [wrapper, document.body, window]))).toEqual([]);
});

test('never counts the trigger itself, as Popper starts from its parent', () => {
  const trigger = element({ overflow: 'hidden' });
  const wrapper = element({ display: 'contents', overflow: 'hidden' });
  const table = element({ overflow: 'auto' });

  expect(getClippingBoundary(stateFor(trigger, [trigger, wrapper, table]))).toEqual([table]);
});

test.each(['absolute', 'fixed'])(
  'leaves a %s-positioned trigger to Popper, whose offset-parent rules it does not reproduce',
  (position) => {
    const trigger = element({ position });
    const wrapper = element({ display: 'contents', overflow: 'hidden' });

    expect(getClippingBoundary(stateFor(trigger, [wrapper]))).toBe('clippingParents');
  }
);

test('leaves a virtual trigger to Popper', () => {
  const virtual = { getBoundingClientRect: () => new DOMRect() };
  const wrapper = element({ display: 'contents', overflow: 'hidden' });

  expect(getClippingBoundary(stateFor(virtual, [wrapper]))).toBe('clippingParents');
});
