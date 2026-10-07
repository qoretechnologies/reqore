import { render } from '@testing-library/react';
import { ReactNode } from 'react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTier, ReqoreUIProvider } from '../src';
import { ButtonBadge } from '../src/components/Button';

/**
 * A badge spaced from what precedes it sized the gap from its `size`. Rendered without one —
 * as `ReqoreTier` did — the gap was `PADDING_FROM_SIZE[undefined] / 1`, i.e. `width: NaNpx`,
 * which the browser drops (and React warned about while the spacer still wrote `width`).
 */

const renderInProvider = (node: ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{node}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/**
 * Spacers whose size came out as no number: a spacer given a `NaN` width is neither horizontal
 * nor vertical, so its space gets no width at all.
 */
const getUnsizedSpacers = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>('.reqore-spacer > div')).filter(
    (space) => getComputedStyle(space).width === 'auto'
  );

const getNaNWarnings = (): unknown[][] =>
  vi
    .mocked(console.error)
    .mock.calls.filter((args) => typeof args[0] === 'string' && args[0].includes('NaN'));

beforeEach(() => {
  vi.mocked(console.error).mockClear();
});

test('a badge without a size spaces itself like a normal-size one', () => {
  renderInProvider(<ButtonBadge content='New' />);

  const space = document.querySelector('.reqore-spacer > div') as HTMLElement;

  expect(space).toBeTruthy();
  // `normal` padding (8px), halved by the horizontal spacer's two sides.
  expect(getComputedStyle(space).width).toBe('4px');
  expect(getUnsizedSpacers()).toEqual([]);
  expect(getNaNWarnings()).toEqual([]);
});

test('a Tier with a badge computes no NaN size', () => {
  renderInProvider(
    <ReqoreTier name='Pro' price={10} currency='$' badge='Popular' featureList={[]} />
  );

  expect(document.querySelector('.reqore-button-badge')).toBeTruthy();
  expect(getUnsizedSpacers()).toEqual([]);
  expect(getNaNWarnings()).toEqual([]);
});
