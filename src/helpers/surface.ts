import { rgba } from 'polished';
import { IReqoreCustomTheme, IReqoreTheme, TReqoreIntent } from '../constants/theme';
import {
  changeLightness,
  getColorFromMaybeString,
  getDrawnColor,
  getMainBackgroundColor,
  getReadableIconLook,
  getReadableIntentColor,
  getThemeSurface,
  isValidSixCharHex,
  READABLE_ICON_CONTRAST,
  TReqoreSurface,
} from './colors';
import { getEffectTextColor, TReqoreEffectColor, TReqoreHexColor } from '../components/Effect';

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

/**
 * The color a card's own mark (an entity row's icon, a callout's icon, a testimonial's avatar and quote mark) is
 * drawn in on `backgrounds`: its `own` color, moved to a shade that stands out by 3:1 there when it is a theme's;
 * else its intent's shade that does; else the card's `text`.
 */
export const getCardMarkColor = (
  theme: IReqoreTheme,
  backgrounds: TReqoreHexColor[],
  text: TReqoreHexColor,
  own?: TReqoreEffectColor,
  intent?: TReqoreIntent
): TReqoreEffectColor => {
  if (own) {
    return (getReadableIconLook(theme, backgrounds, text, 1, own).color ?? own) as TReqoreEffectColor;
  }
  if (intent) {
    return getReadableIntentColor(theme, intent, READABLE_ICON_CONTRAST, backgrounds) as TReqoreEffectColor;
  }
  return text as TReqoreEffectColor;
};

/**
 * The fill a clickable card paints while it is hovered: a wash of its intent (4% when it paints nothing at rest,
 * else 10%), or else of the theme a step lighter (8% when it paints nothing at rest), or `opaque`, the card's own.
 * What its styled rule paints, and what what it holds is read on as well as on its resting fill: a card's text and
 * its fainter text were read on the resting fill only, and a hovered row's metadata fell to 4.2:1 (qorus#646).
 */
export const getCardHoverFill = (
  theme: IReqoreTheme,
  intent: TReqoreIntent | undefined,
  transparent: boolean | undefined,
  opaque: string
): string =>
  intent
    ? rgba(theme.intents[intent] as string, transparent ? 0.04 : 0.1)
    : transparent
      ? rgba(changeLightness(getMainBackgroundColor(theme), 0.08), 0.08)
      : opaque;
