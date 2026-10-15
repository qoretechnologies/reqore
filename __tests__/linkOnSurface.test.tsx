/**
 * A link is written in a shade of its intent that reads on what it is drawn on (qorus#646): the surface a component
 * around it hands down - a table cell tinted with an intent, an entity row's gradient - not the theme's page. The
 * info blue picked for the dark page read 3.5:1 on a warning-tinted cell and 2.8:1 over an entity row's gradient.
 */
import { render } from '@testing-library/react';
import { ReqoreLink, ReqoreSurfaceProvider, ReqoreUIProvider } from '../src';
import { TReqoreHexColor } from '../src/components/Effect';
import { getContrastRatio, READABLE_TEXT_CONTRAST } from '../src/helpers/colors';

const rgbToHex = (rgb: string): TReqoreHexColor =>
  `#${(rgb.match(/\d+/g) as string[])
    .slice(0, 3)
    .map((value) => Number(value).toString(16).padStart(2, '0'))
    .join('')}` as TReqoreHexColor;

const linkColorOn = (surface: TReqoreHexColor | TReqoreHexColor[]) => {
  const { container } = render(
    <ReqoreUIProvider>
      <ReqoreSurfaceProvider color={surface}>
        <ReqoreLink intent='info' href='#'>
          http://192.168.16.20:44525
        </ReqoreLink>
      </ReqoreSurfaceProvider>
    </ReqoreUIProvider>
  );

  return rgbToHex(getComputedStyle(container.ownerDocument.querySelector('.reqore-link')!).color);
};

describe('a link with an intent', () => {
  test('reads on a table cell tinted with the warning intent', () => {
    // the warning wash over a mid-dark page: the info shade picked for the page reads 3.5:1 on it
    const cell: TReqoreHexColor = '#5c4520';

    expect(getContrastRatio(linkColorOn(cell), cell)).toBeGreaterThanOrEqual(
      READABLE_TEXT_CONTRAST
    );
  });

  test("reads on every color of an entity row's gradient", () => {
    const gradient: TReqoreHexColor[] = ['#3b1f1f', '#6b5026'];
    const color = linkColorOn(gradient);

    for (const stop of gradient) {
      expect(getContrastRatio(color, stop)).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
    }
  });

  test("keeps its hue: still a blue, not the theme's text", () => {
    const [r, g, b] = (linkColorOn('#5c4520').match(/[0-9a-f]{2}/g) as string[]).map((value) =>
      parseInt(value, 16)
    );

    expect(b).toBeGreaterThan(r);
    expect(b).toBeGreaterThan(g);
  });
});
