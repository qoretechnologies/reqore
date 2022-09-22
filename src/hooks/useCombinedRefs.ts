import React from 'react';

/**
 * It takes a list of refs and returns a single ref that can be used to reference the same underlying
 * DOM element
 * @param refs - An array of refs to combine.
 * @returns A ref object.
 */
export function useCombinedRefs(...refs) {
  const [_innerRef, setInnerRef] = React.useState(null);
  const targetRef = React.useRef();

  React.useEffect(() => {
    [...refs, setInnerRef].forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return { _innerRef, targetRef };
}
