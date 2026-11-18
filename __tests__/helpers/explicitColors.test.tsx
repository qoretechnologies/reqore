import { TReqoreHexColor } from '../../src/components/Effect';
import { Colors } from '../../src/constants/colors';
import { DEFAULT_THEME } from '../../src/constants/theme';
import {
  buildTheme,
  getColorAtAlpha,
  getContrastRatio,
  getReadableColor,
  getReadableColorFrom,
  getReadableIconLook,
  getSaturatedTint,
  READABLE_ICON_CONTRAST,
} from '../../src/helpers/colors';

/**
 * What a caller says explicitly is the caller's (the review of #717): a text pair they give, an icon's hex. Reqore's
 * own defaults are what the helpers make read.
 */
describe('a text pair the caller gives', () => {
  // on a mid grey neither of these reaches 4.5:1
  const GREY = '#777777';
  const LIGHT = '#bbbbbb' as TReqoreHexColor;
  const DARK = '#333333' as TReqoreHexColor;

  test('is kept: the one of the two that reads better, not black or white', () => {
    const picked = getReadableColorFrom(GREY, false, DARK, LIGHT);

    expect(getContrastRatio(DARK, GREY)).toBeLessThan(4.5);
    expect(getContrastRatio(LIGHT, GREY)).toBeLessThan(4.5);
    expect([DARK, LIGHT]).toContain(picked);
    expect(picked).toBe(
      getContrastRatio(DARK, GREY) >= getContrastRatio(LIGHT, GREY) ? DARK : LIGHT
    );
    expect(getReadableColor({ main: GREY }, DARK, LIGHT)).toBe(picked);
  });

  test("is the caller's when it reads, as it always was", () => {
    expect(getReadableColorFrom('#000000', false, DARK, LIGHT)).toBe(LIGHT);
    expect(getReadableColorFrom('#ffffff', false, DARK, LIGHT)).toBe(DARK);
  });

  test('the default pair still gives way to pure black or white when it does not read', () => {
    // dimmed, the default text is a shade softer; where that does not reach 4.5:1 it is pure black or white
    const picked = getReadableColorFrom(GREY, true);

    expect([Colors.DARK, Colors.LIGHT]).toContain(picked);
  });
});

describe('the contrast ratio', () => {
  test('is not rounded: #595959 on black is just short of 3:1', () => {
    const ratio = getContrastRatio('#595959', '#000000');

    expect(ratio).toBeLessThan(3);
    expect(ratio).toBeCloseTo(2.998, 3);
  });
});

describe("an icon's own color in a control", () => {
  const theme = buildTheme(DEFAULT_THEME);
  const backgrounds = ['#1b1b1b'] as TReqoreHexColor[];

  test('an explicit hex is drawn as it is given, faded no further than it reads', () => {
    for (const hex of ['#000000', '#ff0000'] as TReqoreHexColor[]) {
      const look = getReadableIconLook(theme, backgrounds, '#ffffff', 0.7, hex);

      expect(look.color).toBe(hex);
      expect(look.opacity).toBeGreaterThanOrEqual(0.7);
    }
  });

  test("a theme's color is drawn in the shade of it that stands out by 3:1", () => {
    const look = getReadableIconLook(theme, backgrounds, '#ffffff', 1, 'danger');

    expect(look.color).not.toBe(theme.intents.danger);
    expect(getContrastRatio(look.color, backgrounds[0])).toBeGreaterThanOrEqual(
      READABLE_ICON_CONTRAST
    );
  });
});

describe('a color the helpers cannot read', () => {
  test('at an alpha, is mixed with nothing by the browser, not drawn solid', () => {
    expect(getColorAtAlpha('var(--brand)', 0.2)).toBe(
      'color-mix(in srgb, var(--brand) 20%, transparent)'
    );
    expect(getColorAtAlpha('var(--brand)', 1)).toBe('var(--brand)');
    expect(getColorAtAlpha('#ff0000', 0.5)).toBe('rgba(255,0,0,0.5)');
  });

  test('has no tint to take: it is as it is given', () => {
    expect(getSaturatedTint('var(--brand)', 0.8)).toBe('var(--brand)');
    expect(getSaturatedTint('#ff5500', 0.8)).toBe('#ffddcc');
  });
});
