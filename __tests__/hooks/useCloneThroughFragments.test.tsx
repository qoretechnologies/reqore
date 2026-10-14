import { act, render } from '@testing-library/react';
import { Fragment, ReactNode, useState } from 'react';
import { useCloneThroughFragments } from '../../src/hooks/useCloneThroughFragments';

/** Clones its children with the index each is given, and re-renders itself (not its parent) on `bump`. */
let bump: () => void = () => undefined;
const Indexed = ({ children }: { children: ReactNode }) => {
  const [renders, setRenders] = useState(0);
  bump = () => setRenders((count) => count + 1);
  const { clone } = useCloneThroughFragments(
    (_props, _reactIndex, realIndex) => ({ 'data-index': realIndex }),
    []
  );

  return <div data-renders={renders}>{clone(children)}</div>;
};

/* A control group's own re-render (its state, a context it reads) reused the clone it had made, and the count of
   children went on from where the last render left it: the first child of a stacked group was the fourth, and lost
   its rounded end. Every render counts from the first child. */
test('useCloneThroughFragments counts the children from the first on every render', () => {
  const { container } = render(
    <Indexed>
      <span>a</span>
      <>
        <span>b</span>
        {null}
        <span>c</span>
      </>
      <Fragment>
        <span>d</span>
      </Fragment>
    </Indexed>
  );
  const indexes = () =>
    Array.from(container.querySelectorAll('span')).map((span) => span.getAttribute('data-index'));

  expect(indexes()).toEqual(['0', '1', '2', '3']);
  act(() => bump());
  expect(indexes()).toEqual(['0', '1', '2', '3']);
  act(() => bump());
  expect(indexes()).toEqual(['0', '1', '2', '3']);
});
