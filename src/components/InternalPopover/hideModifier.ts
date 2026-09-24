import { Boundary, detectOverflow, Modifier, SideObject, State } from '@popperjs/core';

/**
 * Popper's `hide` modifier, with one change: an ancestor that generates no box
 * cannot clip the trigger.
 *
 * Popper decides which ancestors clip an element by their computed `overflow`
 * alone. An element with `display: contents` has a computed `overflow` like any
 * other, but no box — nothing is clipped by it on screen, and its
 * `getBoundingClientRect()` is 0×0. Counted as a clipping parent, that 0×0 rect
 * reports the trigger fully clipped, the surface is marked
 * `data-popper-reference-hidden`, and `InternalPopover` closes it — within the
 * frame it opened. That is what a click-catching `display: contents` wrapper
 * inside a table cell does since Table bounds every cell's direct child with
 * `overflow: hidden` (#679).
 *
 * Popper's `hide` takes no options, so the modifier is replaced by name: the
 * same calculation, handed a boundary with the box-less ancestors left out.
 * Where there are none, the boundary is Popper's own `'clippingParents'`, so
 * nothing changes for any popover that never met one.
 */

/** Popper's scroll-parent list holds `window` and the visual viewport too. */
const isElement = (node: unknown): node is Element =>
  typeof (node as Node)?.nodeType === 'number' && (node as Node).nodeType === 1;

const computedStyleOf = (element: Element) =>
  element.ownerDocument.defaultView.getComputedStyle(element);

/**
 * The ancestors that can actually clip the trigger, or `'clippingParents'` when
 * that is exactly Popper's own answer.
 *
 * For a trigger in normal flow, Popper's clipping parents are the scroll
 * parents it has already listed for it (`state.scrollParents.reference`), less
 * the trigger itself and `<body>`. A trigger that is absolutely or fixed
 * positioned escapes some of those ancestors through its offset parent — rules
 * this does not reproduce, so it is left to Popper untouched.
 */
export const getClippingBoundary = (state: Pick<State, 'elements' | 'scrollParents'>): Boundary => {
  const reference = state.elements.reference;

  if (!isElement(reference)) {
    return 'clippingParents';
  }

  const { position } = computedStyleOf(reference);

  if (position === 'absolute' || position === 'fixed') {
    return 'clippingParents';
  }

  const clippingParents = state.scrollParents.reference.filter(
    (parent): parent is Element =>
      isElement(parent) && parent !== reference && parent.nodeName.toLowerCase() !== 'body'
  );
  const withABox = clippingParents.filter((parent) => computedStyleOf(parent).display !== 'contents');

  return withABox.length === clippingParents.length ? 'clippingParents' : withABox;
};

/* Everything below is Popper's `hide` (modifiers/hide.js, 2.11), with the
   boundary passed through. */

const getSideOffsets = (
  overflow: SideObject,
  rect: { width: number; height: number },
  preventedOffsets: { x: number; y: number } = { x: 0, y: 0 }
): SideObject => ({
  top: overflow.top - rect.height - preventedOffsets.y,
  right: overflow.right - rect.width + preventedOffsets.x,
  bottom: overflow.bottom - rect.height + preventedOffsets.y,
  left: overflow.left - rect.width - preventedOffsets.x,
});

const isAnySideFullyClipped = (overflow: SideObject) =>
  [overflow.top, overflow.right, overflow.bottom, overflow.left].some((side) => side >= 0);

export const hideModifier: Modifier<'hide', Record<string, never>> = {
  name: 'hide',
  enabled: true,
  phase: 'main',
  requiresIfExists: ['preventOverflow'],
  fn: ({ state, name }) => {
    const boundary = getClippingBoundary(state);
    const referenceOverflow = detectOverflow(state, { elementContext: 'reference', boundary });
    const popperAltOverflow = detectOverflow(state, { altBoundary: true, boundary });
    const referenceClippingOffsets = getSideOffsets(referenceOverflow, state.rects.reference);
    const popperEscapeOffsets = getSideOffsets(
      popperAltOverflow,
      state.rects.popper,
      state.modifiersData.preventOverflow
    );
    const isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    const hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);

    state.modifiersData[name] = {
      referenceClippingOffsets,
      popperEscapeOffsets,
      isReferenceHidden,
      hasPopperEscaped,
    };
    state.attributes.popper = {
      ...state.attributes.popper,
      'data-popper-reference-hidden': isReferenceHidden,
      'data-popper-escaped': hasPopperEscaped,
    };
  },
};
