import { IReqoreCustomTheme, IReqoreTheme } from '../../constants/theme';
import {
  getColorFromMaybeString,
  getDrawnColor,
  getThemeSurface,
  isValidSixCharHex,
  TReqoreSurface,
} from '../../helpers/colors';
import { getEffectTextColor, TReqoreEffectColor, TReqoreHexColor } from '../Effect';

/**
 * `color` as the theme resolves it (a theme color, a shade of one, a hex), or undefined where it cannot: a CSS color
 * name, a variable, a four-digit hex. Never throws: a color the theme cannot read is no reason to unmount the
 * component that was given it.
 */
const resolveColor = (
  theme: IReqoreTheme,
  color: TReqoreEffectColor | undefined
): TReqoreHexColor | undefined => {
  if (!color) {
    return undefined;
  }

  try {
    const resolved = getColorFromMaybeString(theme, color);

    return resolved && isValidSixCharHex(resolved) ? resolved : undefined;
  } catch {
    return undefined;
  }
};

/**
 * What an element that paints nothing (`unpainted`: transparent, or drawn at no opacity) is drawn on. The surface a
 * component around it hands down (`useReqoreSurface`) when one does; with none around it, the main of the
 * `customTheme` it was given - how a consumer says what it painted under it (a band, a card of its own) - drawn over
 * the page when it is translucent; undefined otherwise (the theme's surface, `getThemeSurface`). An intent is not a
 * surface: an element in an intent with nothing around it is drawn on the page.
 */
export const getUnpaintedSurface = (
  theme: IReqoreTheme,
  customTheme: IReqoreCustomTheme | undefined,
  surface: TReqoreSurface | undefined,
  unpainted: boolean
): TReqoreSurface | undefined => {
  if (surface || !unpainted) {
    return surface;
  }

  const own = resolveColor(theme, customTheme?.main);

  return own ? getDrawnColor(own, getThemeSurface(theme)) : undefined;
};

/**
 * The color a text effect draws `color` in on `backgrounds` (`getEffectTextColor`: a theme color in the shade of it
 * that reads there, any other as given), or undefined where it draws none - a CSS color name, a variable, a
 * four-digit hex, which its text does not take either: it keeps the color it inherits. Never throws.
 */
export const getDrawnEffectTextColor = (
  theme: IReqoreTheme,
  color: TReqoreEffectColor | undefined,
  backgrounds: TReqoreHexColor[]
): TReqoreHexColor | undefined => {
  if (!resolveColor(theme, color)) {
    return undefined;
  }

  try {
    const drawn = getEffectTextColor(theme, color, undefined, backgrounds);

    return drawn && isValidSixCharHex(drawn) ? drawn : undefined;
  } catch {
    return undefined;
  }
};
