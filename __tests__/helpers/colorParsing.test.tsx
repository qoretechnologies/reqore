import { parseToRgb } from 'polished';
/* The package index first: a component module loaded on its own first starts Reqore's circular imports in
   another order, and a styled component is then made from one not defined yet. */
import '../../src';
import { getButtonColors } from '../../src/components/Button';
import { TReqoreHexColor } from '../../src/components/Effect';
import { DEFAULT_THEME } from '../../src/constants/theme';
import {
  buildTheme,
  getColorByBgColor,
  getColorFromMaybeString,
  getContrastRatio,
  getOpaqueColor,
  getReadableAccentColor,
  getRGBAFromHex,
  hexAToRGBA,
  isAchromatic,
  isValidSixCharHex,
  RGBAToHexA,
} from '../../src/helpers/colors';

/**
 * A short hex is each of its digits doubled, as CSS reads it: `#fdc` is `#ffddcc`. It was expanded by repeating it
 * (`#fdcfdc`), and polished writes its results short wherever it can, so the readable shades made from them took
 * another hue: a minimal button in `#ff5500` had lilac text instead of peach.
 */
describe('a short hex', () => {
  test('is each digit doubled', () => {
    expect(getRGBAFromHex('#fdc')).toEqual({ r: 255, g: 221, b: 204, a: 1 });
    expect(getOpaqueColor('#fdc')).toBe('#ffddcc');
    expect(hexAToRGBA('#fdc')).toBe('rgba(255, 221, 204, 1.00)');
  });

  test('with an alpha digit, the alpha doubled too', () => {
    const { r, g, b, a } = getRGBAFromHex('#f00a');

    expect({ r, g, b }).toEqual({ r: 255, g: 0, b: 0 });
    expect(a).toBeCloseTo(0xaa / 255, 5);
    expect(getOpaqueColor('#f00a')).toBe('#ff0000');
    expect(isValidSixCharHex('#f00a')).toBe(true);
  });

  test('is read as the same color as its long form', () => {
    expect(isAchromatic('#abc')).toBe(isAchromatic('#aabbcc'));
    expect(isAchromatic('#999')).toBe(true);
    expect(getReadableAccentColor('#f00', '#000000')).toBe(
      getReadableAccentColor('#ff0000', '#000000')
    );
    // a six-digit hex, never a repeated short one
    expect(getReadableAccentColor('#f00', '#000000')).toMatch(/^#[0-9a-f]{6}$/);
    expect(getReadableAccentColor('#f00', '#000')).not.toBe('#f00f00');
    expect(getReadableAccentColor('#f00', '#000')).toBe(
      getReadableAccentColor('#ff0000', '#000000')
    );
  });

  test('is passed on as it is, and read by its long form', () => {
    // a hex already: not parsed as `rgba()` (`#f00a` was written `#NaN`)
    expect(RGBAToHexA('#f00a')).toBe('#f00a');
    expect(RGBAToHexA('#fdc')).toBe('#fdc');
    // `#fff` was read as the number 0xfff: white text on white
    expect(getColorByBgColor('#fff')).toBe('#000000');
    expect(getColorByBgColor('#000')).toBe('#ffffff');
    expect(isValidSixCharHex('#12345')).toBe(false);
  });

  test('a theme color given short is the color it names', () => {
    const theme = buildTheme(DEFAULT_THEME);

    expect(getColorFromMaybeString(theme, '#f00a' as TReqoreHexColor)).toBe('#ff0000aa');
    expect(getColorFromMaybeString(theme, '#fdc' as TReqoreHexColor)).toBe('#fdc');
  });

  test("a minimal button keeps its color's hue in its text", () => {
    const theme = buildTheme(DEFAULT_THEME);
    const { text, backgrounds } = getButtonColors({
      theme,
      color: '#ff5500' as TReqoreHexColor,
      minimal: true,
    });
    const { red, green, blue } = parseToRgb(text);

    // a peach of the orange: red, then green, then blue - not a lilac (blue over green)
    expect(red).toBeGreaterThan(green);
    expect(green).toBeGreaterThan(blue);
    for (const background of backgrounds) {
      expect(getContrastRatio(text, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
