// Copyright 2026 Qore Technologies, s.r.o.
import { act, fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreLayoutContent,
  ReqoreMenu,
  ReqoreMenuItem,
  ReqoreUIProvider,
} from '../src';

/**
 * Children a control group or a menu is given keep their own keys, and a key given twice is made
 * unique (`useCloneThroughFragments`).
 *
 * A control group joined each child's place to its key, which hid two children with one key; once
 * a child kept its own key (so it keeps its state when one is added before it), children keyed by
 * what they say - a label that repeats - became one child to React: it warned, and on an update
 * dropped or repeated one of them. A menu never joined the place, so its rows always collided.
 */

const wrap = (node: React.ReactNode) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreContent>{node}</ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

const keyWarnings = () =>
  vi
    .mocked(console.error)
    .mock.calls.filter((args) => String(args[0]).includes('two children with the same key'));

const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <button type='button' className='counter' onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
};

const Group = ({ labels, leading }: { labels: string[]; leading?: boolean }) => (
  <ReqoreControlGroup>
    {leading ? <ReqoreButton key='leading' className='leading' label='Leading' /> : null}
    {labels.map((label) => (
      <ReqoreButton key={label} className='labelled' label={label} />
    ))}
    <Counter key='counter' />
  </ReqoreControlGroup>
);

const Menu = ({ labels }: { labels: string[] }) => (
  <ReqoreMenu>
    {labels.map((label) => (
      <ReqoreMenuItem key={label} className='labelled' label={label} />
    ))}
  </ReqoreMenu>
);

const drawn = () => document.querySelectorAll('.labelled').length;

describe('children keyed by what they say', () => {
  beforeEach(() => {
    vi.mocked(console.error).mockClear();
  });

  it('are told apart in a control group, drawn and redrawn once each', () => {
    const { rerender } = render(wrap(<Group labels={['Save', 'Save', 'Open']} />));

    expect(drawn()).toBe(3);

    rerender(wrap(<Group labels={['Save', 'Save', 'Open', 'Save']} />));

    expect(drawn()).toBe(4);
    expect(keyWarnings()).toEqual([]);
  });

  it('are told apart in a menu', () => {
    const { rerender } = render(wrap(<Menu labels={['Copy', 'Copy']} />));

    expect(drawn()).toBe(2);

    rerender(wrap(<Menu labels={['Copy', 'Copy', 'Paste']} />));

    expect(drawn()).toBe(3);
    expect(keyWarnings()).toEqual([]);
  });

  it('leave a child with a key of its own its state when one is added before it', () => {
    const { rerender } = render(wrap(<Group labels={['Save', 'Save']} />));

    act(() => {
      fireEvent.click(document.querySelector('.counter') as HTMLElement);
    });
    expect(document.querySelector('.counter')?.textContent).toBe('1');

    rerender(wrap(<Group labels={['Save', 'Save']} leading />));

    expect(document.querySelector('.leading')).toBeTruthy();
    expect(document.querySelector('.counter')?.textContent).toBe('1');
  });
});
