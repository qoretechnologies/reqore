// What a component draws fainter or smaller than its text - a bubble's timestamp, a timeline marker's icon - is
// faded or shaded only as far as it still reads on what it is drawn on (qorus#646).
import { render } from '@testing-library/react';
import { ReqoreBubble, ReqorePanel, ReqoreTimeline, ReqoreUIProvider } from '../src';
import { TReqoreHexColor } from '../src/components/Effect';
import {
  getContrastRatio,
  READABLE_ICON_CONTRAST,
  READABLE_TEXT_CONTRAST,
} from '../src/helpers/colors';
import { drawnOpacity, fromHex, hex, over, parse } from './shared/colorMath';
import { iconLookOf } from './shared/iconLook';
import { SurfaceProbe } from './shared/surfaces';

/** A mid grey: white and black both read on it, faded neither does. */
const GREY: TReqoreHexColor = '#808080';
/** A near white: what reads on the dark default theme does not read on it. */
const LIGHT: TReqoreHexColor = '#f2f2f2';

/** `node` in a panel drawn in `main`, as an app draws a page of its own color; and what the panel hands it. */
const inPanel = (main: TReqoreHexColor, node: React.ReactNode) => {
  render(
    <ReqoreUIProvider>
      <ReqorePanel customTheme={{ main }} flat>
        {node}
        <SurfaceProbe />
      </ReqorePanel>
    </ReqoreUIProvider>
  );

  return fromHex(document.querySelector('[data-testid="surfaces"]')!.textContent!.split(',')[0]);
};

test("a bubble's timestamp is faded only as far as it reads on what the bubble is drawn on", () => {
  const surface = inPanel(GREY, <ReqoreBubble timestamp='10:42'>Hello</ReqoreBubble>);

  const timestamp = document.querySelector('.reqore-bubble-timestamp') as HTMLElement;
  const drawn = over(getComputedStyle(timestamp).color, surface, drawnOpacity(timestamp));

  expect(drawnOpacity(timestamp)).toBeLessThan(1);
  expect(getContrastRatio(hex(drawn), hex(surface))).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
});

test("a timeline marker's icon in its item's intent stands out from the marker it is drawn on", () => {
  const surface = inPanel(
    LIGHT,
    <ReqoreTimeline items={[{ title: 'Deployed', intent: 'info', icon: 'CheckLine' }]} />
  );

  const marker = document.querySelector('.reqore-timeline-marker') as HTMLElement;
  // the marker's wash of its intent, drawn over what the timeline is drawn on
  const markerDrawn = hex(over(parse(getComputedStyle(marker).backgroundColor), surface));
  const icon = iconLookOf(marker.querySelector('.reqore-icon'));

  expect(getContrastRatio(icon.color, markerDrawn)).toBeGreaterThanOrEqual(READABLE_ICON_CONTRAST);
});

test("a panel's own text reads on the fill it paints, not on the color it is made from", () => {
  // the panel paints its main a step darker: on a mid grey, the step is what decides which text reads
  const surface = inPanel(GREY, 'Some text');

  const panel = document.querySelector('.reqore-panel') as HTMLElement;

  expect(getContrastRatio(getComputedStyle(panel).color, hex(surface))).toBeGreaterThanOrEqual(
    READABLE_TEXT_CONTRAST
  );
});

test("a panel's title icon stands out from the title bar it is drawn on", () => {
  // the bar paints the panel's color a step lighter, the content a step darker: on a mid grey, each reads its own
  render(
    <ReqoreUIProvider>
      <ReqorePanel customTheme={{ main: GREY }} label='Orders' icon='24HoursFill'>
        Some text
      </ReqorePanel>
    </ReqoreUIProvider>
  );

  const bar = parse(
    getComputedStyle(document.querySelector('.reqore-panel-title') as HTMLElement).backgroundColor
  );
  const icon = document.querySelector('.reqore-panel-title-icon') as HTMLElement;
  const drawn = over(getComputedStyle(icon).color, bar, drawnOpacity(icon));

  expect(getContrastRatio(hex(drawn), hex(bar))).toBeGreaterThanOrEqual(READABLE_ICON_CONTRAST);
});
