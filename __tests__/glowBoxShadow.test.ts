import { getGlowBoxShadow } from '../src/components/Effect';
import { DEFAULT_THEME } from '../src/constants/theme';

/* The glow is a `box-shadow`; surfaces that paint shadow layers of their own
 * (a raised highlight, an inset ring) compose this string with theirs, so its
 * exact shape is a contract. */

test('paints blur, spread and colour', () => {
  expect(getGlowBoxShadow(DEFAULT_THEME, { color: '#ff0000', blur: 10, size: 3 })).toBe(
    '0 0 10px 3px #ff0000'
  );
});

test('defaults to no blur and a 2px spread, inset when asked', () => {
  expect(getGlowBoxShadow(DEFAULT_THEME, { color: '#ff0000', inset: true })).toBe(
    'inset 0 0 0px 2px #ff0000'
  );
});

test('honours opacity, as the text glow already did', () => {
  expect(getGlowBoxShadow(DEFAULT_THEME, { color: '#ff0000', blur: 4, opacity: 0.5 })).toBe(
    '0 0 4px 2px rgba(255,0,0,0.5)'
  );
  // Full opacity is the plain colour, not an rgba() of it.
  expect(getGlowBoxShadow(DEFAULT_THEME, { color: '#ff0000', opacity: 1 })).toBe(
    '0 0 0px 2px #ff0000'
  );
});
