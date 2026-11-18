/**
 * A control rendered again sets no state through its ref.
 *
 * ReqoreInput and ReqoreTextarea kept their element in state through `ref={(ref) => setInputRef(ref)}`, and
 * ReqoreSegmentedControl measured its box through an arrow ref too. An arrow made in the render is a new ref every
 * time, so React called it with null and then the element on every render: two state updates for nothing. When the
 * page around the control rendered from no event (a request answering), React reported each as an update not wrapped
 * in act, and the Qorus IDE fails a story on any React warning (board t-96, f70).
 */
import { render, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReqoreContent,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreSegmentedControl,
  ReqoreTextarea,
  ReqoreUIProvider,
} from '../src';

/** Renders again, from no event, each time the window hears `renders-again`. */
const Again = ({ children }: { children: (renders: number) => React.ReactNode }) => {
  const [renders, setRenders] = useState(0);
  useEffect(() => {
    const again = () => setRenders((count) => count + 1);
    window.addEventListener('renders-again', again);
    return () => window.removeEventListener('renders-again', again);
  }, []);

  return <>{children(renders)}</>;
};

const renderAgain = async (times: number) => {
  for (let i = 0; i < times; i++) {
    window.dispatchEvent(new Event('renders-again'));
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
};

describe('a control rendered again by the page around it', () => {
  let errors: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errors.mockRestore();
  });

  /** Updates not wrapped in act other than the page's own. */
  const lateUpdates = () =>
    errors.mock.calls.filter(
      (call) => String(call[0]).includes('not wrapped in act') && call[1] !== 'Again'
    );

  /* What a page renders again with: the same value and words, and handlers made in its render, so the control
     renders again (the handler is new) with nothing for it to update. */
  const cases: Array<[string, (renders: number) => React.ReactNode]> = [
    ['ReqoreInput', (renders) => <ReqoreInput value='orders' onChange={() => renders} />],
    ['ReqoreTextarea', (renders) => <ReqoreTextarea value='orders' onChange={() => renders} />],
    [
      'ReqoreSegmentedControl',
      (renders) => (
        <ReqoreSegmentedControl
          value='a'
          onChange={() => renders}
          items={[
            { value: 'a', label: 'One' },
            { value: 'b', label: 'Two' },
          ]}
        />
      ),
    ],
  ];

  it.each(cases)('%s sets no state through its ref', async (_name, control) => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <Again>{control}</Again>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    await waitFor(() =>
      expect(document.querySelector('.reqore-control, [role="radiogroup"]')).toBeTruthy()
    );
    errors.mockClear();

    await renderAgain(3);

    expect(lateUpdates()).toEqual([]);
  });
});
