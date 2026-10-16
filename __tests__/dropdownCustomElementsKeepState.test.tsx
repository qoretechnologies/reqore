// Copyright 2026 Qore Technologies, s.r.o.
import { act, fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ReqoreContent, ReqoreDropdown, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

/**
 * The custom elements a dropdown's list draws keep the keys their caller gave them.
 *
 * The list keyed each element by its position, over the caller's own key: an element added before
 * another moved it to a new position and a new key, so React remounted it and it lost its state
 * (and its focus). A single node, which is not an array, threw. Elements given without keys are
 * keyed by the list, so they draw no warning.
 */

const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <button type='button' className='counter' onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
};

const wrap = (node: React.ReactNode) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreContent>{node}</ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

const List = ({ leading }: { leading?: boolean }) => (
  <ReqoreDropdown
    label='Open'
    isDefaultOpen
    customElements={[
      ...(leading ? [<span key='leading' className='leading'>Leading</span>] : []),
      <Counter key='counter' />,
    ]}
  />
);

describe("a dropdown's custom elements", () => {
  /* The list's control group keeps a child's own key too (it used to join its position to it), so
     the element keeps its key, and its state, when another is added before it. */
  it('keep their state when an element is added before them', () => {
    const { rerender } = render(wrap(<List />));
    act(() => {
      fireEvent.click(document.querySelector('.counter') as HTMLElement);
    });
    expect(document.querySelector('.counter')?.textContent).toBe('1');

    rerender(wrap(<List leading />));
    expect(document.querySelector('.leading')).not.toBeNull();
    expect(document.querySelector('.counter')?.textContent).toBe('1');
  });

  it('draw no key warning when given without keys', () => {
    vi.mocked(console.error).mockClear();
    render(
      wrap(
        <ReqoreDropdown
          label='Open'
          isDefaultOpen
          // eslint-disable-next-line react/jsx-key
          customElements={[<span className='one'>One</span>, <span className='two'>Two</span>]}
        />
      )
    );
    expect(document.querySelector('.two')).not.toBeNull();
    const warnings = vi
      .mocked(console.error)
      .mock.calls.filter((args) => String(args[0]).includes('unique "key"'));
    expect(warnings).toEqual([]);
  });

  it('can be a single node', () => {
    render(
      wrap(
        <ReqoreDropdown
          label='Open'
          isDefaultOpen
          customElements={(<span className='single'>Single</span>) as never}
        />
      )
    );
    expect(document.querySelector('.single')?.textContent).toBe('Single');
  });
});
