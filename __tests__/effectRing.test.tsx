/**
 * A gradient effect is painted as its fill over a lighter ring of the same gradient (border-box) - and where the
 * fill is translucent, the ring shows through it. What a component reads its text against is what is painted
 * there, ring included (qorus#646): a statistic's label on a radial gradient of a translucent blue was faded for
 * the blue over the page, and drawn over the ring too it read 3.6:1 (the IDE's support hero).
 */
import { render } from '@testing-library/react';
import { ReqoreStatistic, ReqoreUIProvider } from '../src';
import { IReqoreEffect } from '../src/components/Effect';
import { getContrastRatio, READABLE_TEXT_CONTRAST } from '../src/helpers/colors';
import { hex, over, parse, TRgba } from './shared/colorMath';

/* the color of each layer of a painted background-image at its start (the first stop), top layer first */
const firstStops = (image: string): TRgba[] =>
  image
    .split(/,\s*(?=(?:radial|linear|conic)-gradient)/)
    .map((layer) => parse((layer.match(/rgba?\([^)]*\)/) as RegExpMatchArray)[0]));

/** A radial glow of a translucent intent in a corner, as the IDE's support hero draws its tiles. */
const glow: IReqoreEffect = {
  gradient: {
    type: 'radial',
    shape: 'ellipse',
    size: '120% 160%',
    direction: 'at 100% 0%',
    colors: { 0: 'info:lighten:1:0.5', 100: 'main' },
  },
};

describe('a gradient effect with a translucent fill', () => {
  test("a statistic's label stands out from its corner, ring and all", () => {
    render(
      // a near-black theme, as the IDE's: the lighter ring shows most through the translucent blue
      <ReqoreUIProvider theme={{ main: '#121212' }}>
        <ReqoreStatistic className='the-tile' label='With Qorus Support' value={3} effect={glow} />
      </ReqoreUIProvider>
    );

    const tile = document.querySelector('.the-tile') as HTMLElement;
    const style = getComputedStyle(tile);
    const page = parse(
      getComputedStyle(document.querySelector('.reqore-layout-wrapper')!).backgroundColor
    );
    // the corner as painted: each layer's first stop, the top one last, over the tile's own color over the page
    const base = over(parse(style.backgroundColor), page);
    const corner = firstStops(style.backgroundImage)
      .reverse()
      .reduce((beneath, stop) => over(stop, beneath), base);
    const label = document.querySelector('.reqore-statistic-label') as HTMLElement;
    const text = over(
      parse(getComputedStyle(label).color),
      corner,
      Number(getComputedStyle(label).opacity)
    );

    expect(firstStops(style.backgroundImage).length).toBe(2);
    expect(getContrastRatio(hex(text), hex(corner))).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
  });
});
