/**
 * The active page's group hands what it is drawn in to its marks.
 *
 * The group paints the active effect's gradient (or a tint of its intent) under the page's mark and
 * its sections, but did not say so: a resting section mark picked its text for the rail around the
 * group. On a group lighter than the rail that is light text on a light gradient. The rail's own
 * Effects story only read because a short hex was misread (`#baf` as `#bafbaf`, a light green that
 * happened to stand out on its purple).
 */
import { render } from '@testing-library/react';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { ReqoreContent, ReqoreLayoutContent, ReqoreNavRail, ReqoreUIProvider } from '../src';
import { getContrastRatio, READABLE_TEXT_CONTRAST } from '../src/helpers/colors';

const STOPS: `#${string}`[] = ['#e4dfff', '#c9c0ff'];

const ITEMS = [
  {
    id: 'hub',
    label: 'Hub',
    icon: 'FlowChart' as const,
    items: [
      { id: 'health', label: 'Health', icon: 'HeartPulseLine' as const },
      { id: 'runs', label: 'Recent runs', icon: 'RhythmLine' as const },
    ],
  },
  { id: 'jobs', label: 'Jobs', icon: 'CalendarLine' as const },
];

describe('the active group of a nav rail', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  test('gives its resting marks text that reads on its gradient', () => {
    const { container } = render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreNavRail
              items={ITEMS}
              position='static'
              defaultActiveId='hub'
              defaultActiveSubId='health'
              activeEffect={{
                gradient: { colors: { 0: STOPS[0], 100: STOPS[1] }, direction: 'to bottom' },
              }}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    const resting = Array.from(
      container.querySelectorAll<HTMLElement>('.reqore-nav-rail-subitem')
    ).filter((mark) => !mark.getAttribute('aria-current'));

    expect(resting).toHaveLength(1);

    const text = getComputedStyle(resting[0]).color;

    for (const stop of STOPS) {
      expect(getContrastRatio(text, stop)).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
    }
  });
});
