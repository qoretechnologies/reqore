/**
 * A button draws its icons at `CONTROL_ICON_OPACITY`, so it picks an icon's own color in the shade that stands out
 * by 3:1 at the opacity it is drawn at (qorus#646). An icon's color can come as the button's `leftIconColor` or in
 * the icon's own props (`leftIconProps={{ intent: 'warning' }}`, as the IDE's readiness rows give it): the second
 * was left to the icon, which made it readable at full opacity, and drawn at 70% a warning icon was 2.4:1.
 */
import { render } from '@testing-library/react';
import { ReqoreButton, ReqoreUIProvider } from '../src';
import { getButtonColors, getButtonIconLook } from '../src/components/Button';
import { TReqoreHexColor } from '../src/components/Effect';
import { DEFAULT_THEME } from '../src/constants/theme';
import {
  buildTheme,
  getContrastRatio,
  getDrawnColor,
  READABLE_ICON_CONTRAST,
} from '../src/helpers/colors';

const iconOf = (testId: string) =>
  document.querySelector(`[data-testid='${testId}'] .reqore-icon`) as HTMLElement;

/* the color the glyph is drawn in (react-icons sets it on the svg) and the opacity the icon is drawn at */
const look = (el: HTMLElement) => ({
  color: (el.querySelector('svg') as SVGElement).style.color,
  opacity: getComputedStyle(el).opacity,
});

describe("a button's icon with a color in its own props", () => {
  for (const [name, iconProps] of [
    ['an intent', { intent: 'warning' }],
    ['a color named by the theme', { color: 'danger' }],
  ] as const) {
    test(`is drawn like one the button is given the color of: ${name}`, () => {
      const color = 'intent' in iconProps ? iconProps.intent : iconProps.color;

      render(
        <ReqoreUIProvider>
          <ReqoreButton data-testid='by-button' minimal icon='AlertLine' leftIconColor={color}>
            Fix next
          </ReqoreButton>
          <ReqoreButton data-testid='by-props' minimal icon='AlertLine' leftIconProps={iconProps}>
            Fix next
          </ReqoreButton>
          <ReqoreButton
            data-testid='right-by-props'
            minimal
            rightIcon='AlertLine'
            rightIconProps={iconProps}
          >
            Fix next
          </ReqoreButton>
        </ReqoreUIProvider>
      );

      // the button's own pick: a shade of the color, at an opacity that keeps it at 3:1
      expect(look(iconOf('by-button')).color).not.toBe('');
      expect(look(iconOf('by-props'))).toEqual(look(iconOf('by-button')));
      expect(look(iconOf('right-by-props'))).toEqual(look(iconOf('by-button')));
    });
  }

  test('stands out by 3:1 at the opacity it is drawn at, on the dark theme and the light one', () => {
    for (const main of [DEFAULT_THEME.main, '#f4f4f4']) {
      const theme = buildTheme({ ...DEFAULT_THEME, main: main as TReqoreHexColor });
      const style = { theme, minimal: true } as Parameters<typeof getButtonColors>[0];
      const iconLook = getButtonIconLook(style, 'warning');

      for (const state of ['rest', 'hover'] as const) {
        for (const background of getButtonColors(style, state).backgrounds) {
          const drawn = getDrawnColor(
            `${iconLook.color}${Math.round(iconLook.opacity * 255)
              .toString(16)
              .padStart(2, '0')}`,
            background
          );

          expect(getContrastRatio(drawn, background)).toBeGreaterThanOrEqual(
            READABLE_ICON_CONTRAST
          );
        }
      }
    }
  });

  test('keeps the rest of its props: its size', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreButton
          data-testid='by-props'
          minimal
          icon='AlertLine'
          leftIconProps={{ intent: 'warning', size: '30px' }}
        >
          Fix next
        </ReqoreButton>
      </ReqoreUIProvider>
    );

    expect(iconOf('by-props').style.width).toBe('30px');
  });
});
