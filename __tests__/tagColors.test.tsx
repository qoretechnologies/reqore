// the library first: its components import one another through it
import '../src';
import { IReqoreEffect, TReqoreHexColor } from '../src/components/Effect';
import { getTagSolidColors } from '../src/components/Tag';
import { DEFAULT_THEME } from '../src/constants/theme';
import { buildTheme, getContrastRatio, READABLE_TEXT_CONTRAST } from '../src/helpers/colors';

describe("a tag's key", () => {
  const theme = buildTheme(DEFAULT_THEME);

  /* A badge on a button drawn in a gradient: its label reads on every color of it, not only the first (the Global
     Effect button's badge was black text on the gradient's dark end, 2.15:1). */
  test('a tag reads on each color it is drawn on', () => {
    const surface: TReqoreHexColor[] = ['#0663aa', '#033459'];

    for (const [color, minimal] of [
      ['#00fafd', false],
      ['#7a1fa2', true],
      [undefined, true],
    ] as [TReqoreHexColor | undefined, boolean][]) {
      const { backgrounds, text } = getTagSolidColors(
        theme,
        color,
        minimal,
        false,
        undefined,
        false,
        surface
      );

      expect(backgrounds).toHaveLength(2);
      for (const background of backgrounds) {
        expect(getContrastRatio(text, background)).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
      }
    }
  });

  /* Over a light colour 30% black lands the key in the mid-tones, where neither light nor dark text reads (the
     pink tag in the Tag stories: 4.06:1 at best). */
  test('is darkened as far as it takes for its text to read on all of it', () => {
    for (const effect of [
      { gradient: { colors: '#ff47a3' } },
      { gradient: { colors: { 0: '#ffb3d9', 100: '#ff47a3' } } },
    ] as IReqoreEffect[]) {
      const { keyBackgrounds, keyText } = getTagSolidColors(theme, undefined, false, true, effect);

      for (const background of keyBackgrounds) {
        expect(getContrastRatio(keyText, background)).toBeGreaterThanOrEqual(
          READABLE_TEXT_CONTRAST
        );
      }
    }
  });

  test('keeps its usual shade where that already reads', () => {
    expect(
      getTagSolidColors(theme, '#0b4578' as TReqoreHexColor, false, true, undefined).keyShade
    ).toBe('rgba(0,0,0,0.3)');
    expect(getTagSolidColors(theme, undefined, true, true, undefined).keyShade).toBe(
      'rgba(0,0,0,0.1)'
    );
  });
});
