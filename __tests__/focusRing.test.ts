import { getContrast } from 'polished';
import { DEFAULT_THEME } from '../src/constants/theme';
import { getFocusRingColor } from '../src/helpers/colors';

/** A translucent ring blended over the surface it is drawn on. */
const over = (ring: string, surface: string) => {
  const [r, g, b, a] = ring.match(/[\d.]+/g)!.map(Number);
  const [sr, sg, sb] = (surface.match(/[0-9a-f]{2}/gi) ?? []).map((hex) => parseInt(hex, 16));
  const mix = (top: number, bottom: number) => Math.round(top * a + bottom * (1 - a));
  return `rgb(${mix(r, sr)}, ${mix(g, sg)}, ${mix(b, sb)})`;
};

describe('the focus ring', () => {
  test.each([
    ['the default theme', DEFAULT_THEME.main],
    ['a calm near-black surface', '#141418'],
    ['a light surface', '#f4f4f6'],
  ])('stands at least 3:1 against %s', (_, main) => {
    const theme = { ...DEFAULT_THEME, main: main as `#${string}` };
    const ring = getFocusRingColor(theme);

    expect(getContrast(over(ring, main), main)).toBeGreaterThanOrEqual(3);
  });
});
