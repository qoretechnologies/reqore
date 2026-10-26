import React from 'react';

/** Hands `node` to one ref: a callback is called with it, an object holds it. */
const assignRef = <T>(ref: React.Ref<T> | undefined | null, node: T | null) => {
  if (!ref) {
    return;
  }

  if (typeof ref === 'function') {
    ref(node);
  } else {
    (ref as React.MutableRefObject<T | null>).current = node;
  }
};

/**
 * One element, handed to several refs: the component's own (`targetRef`, to read) and those it is given
 * (a forwarded ref, a ref of its parent's).
 *
 * `setRef` is the ref the element is drawn with. React calls it in the commit that attaches the element, so
 * every ref has the element before the browser paints it. They used to be handed it in an effect, after the
 * paint: a popover drawn around a button learnt of the button only then, and armed its click listener in
 * the render after that - a click that landed on the button as soon as it was drawn opened nothing, and
 * nothing on the page said when it would (qorus#646: the Qorus IDE's template selector kept a sleep for it).
 * The effect also ran after every render, since the list of refs is new each time.
 *
 * A component that draws the element through a ref callback of its own calls `setRef` from it.
 *
 * @param refs - The refs to hand the element to, besides `targetRef`.
 * @returns `targetRef`, holding the element, and `setRef`, the ref to draw it with.
 */
export function useCombinedRefs<T = any>(...refs: Array<React.Ref<T> | undefined | null>) {
  const targetRef = React.useRef<T>();

  const setRef = React.useCallback(
    (node: T | null) => {
      targetRef.current = node ?? undefined;
      refs.forEach((ref) => assignRef(ref, node));
    },
    // A new ref given is handed the element the way React hands it to a new ref callback: this callback
    // changes with it, so React calls the old one with null and this one with the element.
    refs
  );

  return { targetRef, setRef };
}
