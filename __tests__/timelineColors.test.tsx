/**
 * A timeline's colours: an icon color of the item's own that is no theme's color is drawn as given, and
 * the text reads on every color of a gradient the timeline is drawn on.
 */
import { render } from '@testing-library/react';
import { ReqoreTimeline, ReqoreUIProvider } from '../src';
import { ReqoreSurfaceProvider } from '../src/context/SurfaceContext';
import { getDrawnColor, getReadableColorOn } from '../src/helpers/colors';

test("an icon color of the item's own that is no theme's color is drawn as it is given", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreTimeline
        items={[{ title: 'Deployed', icon: 'StarLine', iconColor: 'rgb(1, 2, 3)' as never }]}
      />
    </ReqoreUIProvider>
  );

  const glyph = document.querySelector('.reqore-timeline-marker svg')!;

  expect(getComputedStyle(glyph).color).toBe('rgb(1, 2, 3)');
});

test('the text reads on every color of a gradient the timeline is drawn on', () => {
  const gradient = ['#606060', '#f0f0f0'] as const;

  render(
    <ReqoreUIProvider>
      <ReqoreSurfaceProvider color={[...gradient]}>
        <ReqoreTimeline items={[{ title: 'Deployed', content: 'To production' }]} />
      </ReqoreSurfaceProvider>
    </ReqoreUIProvider>
  );

  const content = document.querySelector('.reqore-timeline-content')!;

  // its hue: the content is that color, faded as far as it stays readable
  expect(getDrawnColor(getComputedStyle(content).color)).toBe(
    getReadableColorOn([...gradient], false)
  );
});
