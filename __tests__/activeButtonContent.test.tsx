/**
 * An active button (a selected menu item) is filled with its color, and what it holds is drawn on that fill: its
 * description, its badges, its icon (qorus#646). They were picked for the button at rest - a wash of its color
 * over the dark page - and drawn on the fill read 2.0-2.7:1 (the IDE's account menu: a light blue description and
 * badge on the info blue).
 */
import { render } from '@testing-library/react';
import { ReqoreButton, ReqoreUIProvider } from '../src';
import {
  getContrastRatio,
  READABLE_ICON_CONTRAST,
  READABLE_TEXT_CONTRAST,
} from '../src/helpers/colors';
import { TReqoreHexColor } from '../src/components/Effect';

type TRgba = [number, number, number, number];

const parse = (color: string): TRgba => {
  const [r, g, b, a = '1'] = color.match(/[\d.]+/g) as string[];

  return [Number(r), Number(g), Number(b), Number(a)];
};

/** `color` (with its alpha, times `opacity`) drawn over the opaque `under`. */
const over = (color: string, under: TRgba, opacity = 1): TRgba => {
  const [r, g, b, a] = parse(color);
  const alpha = a * opacity;

  return [
    r * alpha + under[0] * (1 - alpha),
    g * alpha + under[1] * (1 - alpha),
    b * alpha + under[2] * (1 - alpha),
    1,
  ];
};

const hex = ([r, g, b]: TRgba) =>
  `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}` as TReqoreHexColor;

const contrast = (front: TRgba, back: TRgba) => getContrastRatio(hex(front), hex(back));

describe('an active button with a color', () => {
  const renderActive = (active: boolean) => {
    render(
      <ReqoreUIProvider>
        <ReqoreButton
          className='the-button'
          intent='info'
          minimal
          active={active}
          icon='CheckLine'
          description='Renews in 3 months'
          badge={{ label: 'Default', intent: 'info', minimal: true }}
        >
          Pro
        </ReqoreButton>
      </ReqoreUIProvider>
    );

    const button = document.querySelector('.the-button') as HTMLElement;
    // the page under the button: the layout's background, opaque
    const page = parse(
      getComputedStyle(document.querySelector('.reqore-layout-wrapper')!).backgroundColor
    );
    const fill = over(getComputedStyle(button).backgroundColor, page);

    return { button, fill };
  };

  test('writes its description on its fill', () => {
    const { button, fill } = renderActive(true);
    const description = button.querySelector('.reqore-button-description') as HTMLElement;

    expect(contrast(over(getComputedStyle(description).color, fill), fill)).toBeGreaterThanOrEqual(
      READABLE_TEXT_CONTRAST
    );
  });

  test('draws its badge on its fill', () => {
    const { button, fill } = renderActive(true);
    const badge = button.querySelector('.reqore-button-badge') as HTMLElement;
    const badgeFill = over(getComputedStyle(badge).backgroundColor, fill);
    const label = badge.querySelector('.reqore-tag-content span') as HTMLElement;

    expect(
      contrast(over(getComputedStyle(label).color, badgeFill), badgeFill)
    ).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
  });

  test('draws its icon on its fill', () => {
    const { button, fill } = renderActive(true);
    const icon = button.querySelector('.reqore-icon') as HTMLElement;
    // an icon without a color of its own is drawn in the text it inherits
    const own = (icon.querySelector('svg') as SVGElement).style.color;
    const glyph = own && own !== 'inherit' ? own : getComputedStyle(icon).color;

    expect(
      contrast(over(glyph, fill, Number(getComputedStyle(icon).opacity)), fill)
    ).toBeGreaterThanOrEqual(READABLE_ICON_CONTRAST);
  });

  test("without a color of its own (a sidebar's section toggle on the active path): its description on its fill", () => {
    render(
      <ReqoreUIProvider>
        <ReqoreButton className='the-toggle' active description='View and Manage Qorus Objects'>
          IDE
        </ReqoreButton>
      </ReqoreUIProvider>
    );

    const button = document.querySelector('.the-toggle') as HTMLElement;
    const page = parse(
      getComputedStyle(document.querySelector('.reqore-layout-wrapper')!).backgroundColor
    );
    const fill = over(getComputedStyle(button).backgroundColor, page);
    const description = button.querySelector('.reqore-button-description') as HTMLElement;

    expect(contrast(over(getComputedStyle(description).color, fill), fill)).toBeGreaterThanOrEqual(
      READABLE_TEXT_CONTRAST
    );
  });

  test('at rest, as before: its description on its wash reads', () => {
    const { button, fill } = renderActive(false);
    const description = button.querySelector('.reqore-button-description') as HTMLElement;

    expect(contrast(over(getComputedStyle(description).color, fill), fill)).toBeGreaterThanOrEqual(
      READABLE_TEXT_CONTRAST
    );
  });
});
