import { cloneDeep, merge, reduce, size } from 'lodash';
import {
  darken,
  getLuminance,
  lighten,
  mix,
  parseToRgb,
  rgba,
  transparentize,
} from 'polished';
import {
  TReqoreEffectColor,
  TReqoreEffectColorList,
  TReqoreEffectGradientColors,
  TReqoreEffectGradientColorsObject,
  TReqoreHexColor,
  TReqoreMultiTypeColor,
  TReqoreRgbaColor,
} from '../components/Effect';
import { Colors } from '../constants/colors';
import { DEFAULT_INTENTS, IReqoreTheme, TReqoreIntent } from '../constants/theme';

export const getReadableColor: (
  theme: Partial<IReqoreTheme>,
  ifLight?: TReqoreHexColor,
  ifDark?: TReqoreHexColor,
  dimmed?: boolean,
  fallback?: TReqoreHexColor
) => TReqoreHexColor = (theme, ifLight, ifDark, dimmed, fallback) => {
  if (theme.text?.color) {
    return theme.text.dim
      ? dimmed
        ? changeDarkness(theme.text.color, 0.05)
        : theme.text.color
      : theme.text.color;
  }

  const shouldDim = theme.text?.dim && dimmed;
  const from = fallback || theme.main!;

  // a translucent color (a theme made from the muted intent, say) is drawn over the theme it was made from
  return getReadableColorFrom(from, shouldDim, ifLight, ifDark, theme.originalMain);
};

/**
 * How far text has to stand out from what it is drawn on (WCAG 2.1 AA, 1.4.3): 4.5:1.
 */
export const READABLE_TEXT_CONTRAST = 4.5;

/**
 * How far an icon (or any other graphic a control needs to be understood) and large text have to stand out from
 * what they are drawn on (WCAG 2.1 AA, 1.4.11 and 1.4.3): 3:1.
 */
export const READABLE_ICON_CONTRAST = 3;

interface IColorParts {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

const getColorParts = (color: TReqoreMultiTypeColor | string): IColorParts => {
  if (color === 'transparent') {
    return { red: 0, green: 0, blue: 0, alpha: 0 };
  }

  const parsed = parseToRgb(color) as Omit<IColorParts, 'alpha'> & { alpha?: number };

  return {
    red: parsed.red,
    green: parsed.green,
    blue: parsed.blue,
    alpha: parsed.alpha ?? 1,
  };
};

const toHexColor = ({ red, green, blue }: IColorParts): TReqoreHexColor =>
  `#${[red, green, blue]
    .map((part) =>
      Math.round(Math.min(255, Math.max(0, part)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}` as TReqoreHexColor;

/**
 * `color` as it is drawn over `under`: a translucent color blended into what is under it, the way the browser
 * draws it, and an opaque one as it is. Without `under`, a translucent color counts as its own hue drawn opaque.
 * Always an opaque six-digit hex.
 */
export const getDrawnColor = (
  color: TReqoreMultiTypeColor | string,
  under?: TReqoreMultiTypeColor | string
): TReqoreHexColor => {
  const top = getColorParts(color);

  if (top.alpha >= 1 || !under) {
    return toHexColor(top);
  }

  const bottom = getColorParts(getDrawnColor(under));
  const blend = (above: number, below: number) => above * top.alpha + below * (1 - top.alpha);

  return toHexColor({
    red: blend(top.red, bottom.red),
    green: blend(top.green, bottom.green),
    blue: blend(top.blue, bottom.blue),
    alpha: 1,
  });
};

/**
 * `color` at `opacity` of the alpha it already has: a translucent color (a theme made from the muted intent) drawn
 * at a panel's opacity stays as translucent, and more. `rgba(color, opacity)` replaced its alpha, so a panel in the
 * muted intent's near-white drawn at 19% was drawn near-white and opaque.
 */
export const fadeColor = (color: TReqoreMultiTypeColor | string, opacity: number): string => {
  const { red, green, blue, alpha } = getColorParts(color);

  return rgba(red, green, blue, alpha * opacity);
};

/** The WCAG contrast ratio of two colors, each drawn opaque: from 1 to 21, not rounded. */
export const getContrastRatio = (
  first: TReqoreMultiTypeColor | string,
  second: TReqoreMultiTypeColor | string
): number => {
  const [lighter, darker] = [
    getLuminance(getDrawnColor(first)),
    getLuminance(getDrawnColor(second)),
  ].sort((a, b) => b - a);

  return (lighter + 0.05) / (darker + 0.05);
};

/** The worst contrast `color` has with any of `backgrounds`. */
const getWorstContrast = (color: TReqoreMultiTypeColor | string, backgrounds: TReqoreHexColor[]) =>
  Math.min(...backgrounds.map((background) => getContrastRatio(color, background)));

/**
 * The text color that reads on every one of `backgrounds` (each drawn over `under` when it is translucent - the
 * colors of a gradient, or a single surface): of the theme's text colors for a light and for a dark background
 * (`ifLight`, `ifDark`; black and white, a shade softer when `dim`), the one that stands out more. When even that
 * one does not reach 4.5:1, pure black or white, whichever stands out more: a dimmed shade is a nicety, being read
 * is not.
 */
export const getReadableColorOn = (
  backgrounds: (TReqoreMultiTypeColor | string)[],
  dim?: boolean,
  ifLight?: TReqoreHexColor,
  ifDark?: TReqoreHexColor,
  under?: TReqoreMultiTypeColor | string
): TReqoreHexColor => {
  const surfaces = backgrounds.map((background) => getDrawnColor(background, under));
  const onLight = ifLight || (dim ? (lighten(0.05, Colors.DARK) as TReqoreHexColor) : Colors.DARK);
  const onDark = ifDark || (dim ? (darken(0.05, Colors.LIGHT) as TReqoreHexColor) : Colors.LIGHT);
  const preferred =
    getWorstContrast(onLight, surfaces) >= getWorstContrast(onDark, surfaces) ? onLight : onDark;

  if (getWorstContrast(preferred, surfaces) >= READABLE_TEXT_CONTRAST) {
    return preferred;
  }

  return getWorstContrast(Colors.DARK, surfaces) >= getWorstContrast(Colors.LIGHT, surfaces)
    ? Colors.DARK
    : Colors.LIGHT;
};

/** The contrast of `color`, drawn at `alpha` over the opaque `background`, with that background. */
const getContrastAtAlpha = (
  color: TReqoreMultiTypeColor | string,
  background: TReqoreHexColor,
  alpha: number
): number => {
  const { red, green, blue } = getColorParts(color);

  return getContrastRatio(getDrawnColor(rgba(red, green, blue, alpha), background), background);
};

/** How far past the ratio `getReadableAlpha` aims: see there. */
const READABLE_ALPHA_MARGIN = 0.1;

/** A color, or each of the colors something may be drawn on (a gradient's, or a control's at rest and hovered). */
export type TReqoreReadableBackground = TReqoreMultiTypeColor | string | (TReqoreMultiTypeColor | string)[];

/**
 * The least alpha (or opacity), from `alpha` up, at which `color` drawn over `background` (each of them, for a list)
 * still stands out from it by `minContrast`: secondary text or an icon fades only as far as it can and still be read.
 * `alpha` itself when it already reads; 1 when even the full color does not, which is for whoever chose that color to
 * fix.
 */
export const getReadableAlpha = (
  color: TReqoreMultiTypeColor | string,
  background: TReqoreReadableBackground,
  alpha: number,
  minContrast: number = READABLE_TEXT_CONTRAST
): number =>
  Math.max(
    ...(Array.isArray(background) ? background : [background]).map((each) =>
      getReadableAlphaOn(color, each, alpha, minContrast)
    )
  );

const getReadableAlphaOn = (
  color: TReqoreMultiTypeColor | string,
  background: TReqoreMultiTypeColor | string,
  alpha: number,
  ratio: number
): number => {
  const surface = getDrawnColor(background);
  // A browser blends a translucent color a shade differently (an alpha of 255ths, its own rounding): an alpha
  // that just reaches the ratio here can fall a hair short on the page, so it aims a little past it.
  const minContrast = ratio + READABLE_ALPHA_MARGIN;

  if (alpha >= 1 || getContrastAtAlpha(color, surface, alpha) >= minContrast) {
    return alpha;
  }

  if (getContrastAtAlpha(color, surface, 1) < minContrast) {
    return 1;
  }

  // halve the range in which the alpha starts to read until it is less than half a hundredth wide
  let low = alpha;
  let high = 1;

  while (high - low > 0.005) {
    const middle = (low + high) / 2;

    if (getContrastAtAlpha(color, surface, middle) >= minContrast) {
      high = middle;
    } else {
      low = middle;
    }
  }

  return Math.min(1, Math.ceil(high * 100) / 100);
};

/** `color` at `alpha`, or at as much more as it needs to stand out from `background` (`getReadableAlpha`). */
/** A mark (a text, an icon) as drawn in a group: its color, at `alpha`, on `on` (opaque). */
export interface IReqoreGroupMark {
  color: TReqoreMultiTypeColor | string;
  alpha: number;
  on: TReqoreMultiTypeColor | string;
}

/**
 * How far a group drawn as a whole (`opacity` on it: an idle rail resting dim) can be faded over `under` and every
 * one of `marks` in it still stand out from what it is drawn on by `minContrast`: `opacity`, or as little more as
 * it takes. Faded, a mark and what it is on both fade into `under`, so they draw closer together.
 */
export const getReadableGroupOpacity = (
  marks: IReqoreGroupMark[],
  under: TReqoreMultiTypeColor | string,
  opacity: number,
  minContrast: number = READABLE_TEXT_CONTRAST
): number => {
  const page = getDrawnColor(under);
  // aims a little past the ratio, as getReadableAlpha does: the browser blends a shade differently
  const target = minContrast + READABLE_ALPHA_MARGIN;
  const drawn = marks.map(({ color, alpha, on }) => {
    const fill = getDrawnColor(on);

    return { fill, mark: getDrawnColor(fadeColor(color, alpha), fill) };
  });
  const reads = (at: number) =>
    drawn.every(
      ({ fill, mark }) =>
        getContrastRatio(getDrawnColor(rgba(mark, at), page), getDrawnColor(rgba(fill, at), page)) >=
        target
    );

  if (opacity >= 1 || reads(opacity)) {
    return opacity;
  }

  if (!reads(1)) {
    return 1;
  }

  let low = opacity;
  let high = 1;

  while (high - low > 0.005) {
    const middle = (low + high) / 2;

    if (reads(middle)) {
      high = middle;
    } else {
      low = middle;
    }
  }

  return Math.min(1, Math.ceil(high * 100) / 100);
};

export const getReadableFadedColor = (
  color: TReqoreMultiTypeColor | string,
  background: TReqoreReadableBackground,
  alpha: number,
  minContrast: number = READABLE_TEXT_CONTRAST
): string =>
  rgba(getDrawnColor(color), getReadableAlpha(color, background, alpha, minContrast));

/**
 * The opacity a component draws its secondary text (a description, metadata, a timestamp) or an icon at, on `surface`
 * (its theme's main unless given; translucent, drawn over the theme it was made from): `opacity`, or as much more as
 * the text color (`color`, or the theme's readable one there) needs to stand out by `minContrast`: 4.5:1 for text,
 * `READABLE_ICON_CONTRAST` for an icon.
 */
export const getReadableOpacity = (
  theme: IReqoreTheme,
  opacity: number,
  minContrast: number = READABLE_TEXT_CONTRAST,
  surface: TReqoreMultiTypeColor | string = theme.main,
  color?: TReqoreMultiTypeColor | string
): number => {
  const background = getDrawnColor(surface, theme.originalMain);

  return getReadableAlpha(
    color ?? getReadableColor(theme, undefined, undefined, true, background),
    background,
    opacity,
    minContrast
  );
};

/**
 * A theme's text color on every one of `backgrounds` (what a component is drawn in - each color of its gradient):
 * the theme's own text color when it names one, else the one that reads on all of them (`getReadableColorOn`),
 * dimmed when the theme dims its text.
 */
export const getReadableTextOn = (
  theme: Partial<IReqoreTheme>,
  backgrounds: TReqoreHexColor[],
  dimmed: boolean = true
): TReqoreHexColor =>
  theme.text?.color
    ? getReadableColor(theme, undefined, undefined, dimmed)
    : getReadableColorOn(backgrounds, !!theme.text?.dim && dimmed);

/**
 * The text color that reads on `from` (drawn over `under` when it is translucent): see `getReadableColorOn`.
 */
export const getReadableColorFrom = (
  from: TReqoreMultiTypeColor | string,
  dim?: boolean,
  ifLight?: TReqoreHexColor,
  ifDark?: TReqoreHexColor,
  under?: TReqoreMultiTypeColor | string
): TReqoreHexColor => getReadableColorOn([from], dim, ifLight, ifDark, under);

export const isAchromatic = (color: TReqoreMultiTypeColor): boolean => {
  const fixedColor = getRGBAFromHex(color);

  return fixedColor.r === fixedColor.g && fixedColor.g === fixedColor.b;
};

export const percentToHexAlpha = (p: number) => {
  const percent = Math.max(0, Math.min(100, p)); // bound percent from 0 to 100
  const intValue = Math.round((percent / 100) * 255); // map percent to nearest integer (0 - 255)
  const hexValue = intValue.toString(16); // get hexadecimal representation

  return hexValue.padStart(2, '0').toUpperCase(); // format with leading 0 and upper case characters
};

export const getRGBAFromHex = (
  color: TReqoreMultiTypeColor
): { r: number; g: number; b: number; a: number } => {
  let hexColor = color as TReqoreHexColor;
  // If this is already an rgba color, we need to convert it to hex
  if (color.startsWith('rgba')) {
    hexColor = RGBAToHexA(color);
  }

  const colorWithAlpha = hexColor.length === 4 ? hexColor + hexColor.slice(1, 4) : hexColor;

  const r = parseInt(colorWithAlpha.slice(1, 3), 16);
  const g = parseInt(colorWithAlpha.slice(3, 5), 16);
  const b = parseInt(colorWithAlpha.slice(5, 7), 16);
  const a = parseInt(colorWithAlpha.slice(7, 9) || 'ff', 16) / 255;

  return { r, g, b, a };
};

export const hexAToRGBA = (hex: TReqoreMultiTypeColor): TReqoreRgbaColor => {
  // Check if this color is already in rgba format
  if (hex.startsWith('rgb')) {
    return hex as TReqoreRgbaColor;
  }

  const { r, g, b, a } = getRGBAFromHex(hex as TReqoreHexColor);

  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
};

export const RGBAToHexA = (rgba, forceRemoveAlpha = false): TReqoreHexColor => {
  if (isValidSixCharHex(rgba)) {
    return rgba as TReqoreHexColor;
  }

  return ('#' +
    rgba
      .replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
      .split(',') // splits them at ","
      .filter((_string, index) => !forceRemoveAlpha || index !== 3)
      .map((string) => parseFloat(string)) // Converts them to numbers
      .map((number, index) => (index === 3 ? Math.round(number * 255) : number)) // Converts alpha to 255 number
      .map((number) => number.toString(16)) // Converts numbers to hex
      .map((string) => (string.length === 1 ? '0' + string : string)) // Adds 0 when length of one number is 1
      .join('')) as TReqoreHexColor; // Puts the array to togehter to a string
};

export const shouldDarken = (mainColor: TReqoreMultiTypeColor): boolean => {
  return getLuminance(hexAToRGBA(mainColor)) > 0.2;
};

export const getMainColor: (theme: IReqoreTheme, component: string) => TReqoreHexColor = (
  theme,
  component
) => theme[component]?.main || theme.main;

//export const changeBasedOnContrast = (color: string, lightness?: number): string =>

export const changeLightness = (color: TReqoreHexColor, lightness?: number): TReqoreHexColor => {
  const fixedColor = hexAToRGBA(color);

  return lightness
    ? shouldDarken(fixedColor)
      ? (darken(lightness, fixedColor) as TReqoreHexColor)
      : (lighten(lightness, fixedColor) as TReqoreHexColor)
    : color;
};

export const changeDarkness = (color: TReqoreHexColor, lightness?: number): TReqoreHexColor => {
  const fixedColor = hexAToRGBA(color);

  return lightness
    ? shouldDarken(fixedColor)
      ? (lighten(lightness, fixedColor) as TReqoreHexColor)
      : (darken(lightness, fixedColor) as TReqoreHexColor)
    : color;
};

/**
 * The colour without its alpha channel, as a six-digit hex: `#e6e6e630` → `#e6e6e6`,
 * `rgba(10, 102, 64, 0.5)` → `#0a6640`. For colour maths that needs the hue a colour
 * is drawn in rather than how faintly it is drawn (Reqore's muted intent, for one, is
 * an eight-digit hex).
 */
export const getOpaqueColor = (color: TReqoreMultiTypeColor): TReqoreHexColor => {
  const { r, g, b } = getRGBAFromHex(color);
  const toHex = (value: number) => value.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}` as TReqoreHexColor;
};

/**
 * `color`, pushed lighter (on a dark background) or darker (on a light one) until it
 * reads as TEXT on `background` — the WCAG contrast ratio reaches `minContrast`.
 *
 * Unlike `getReadableColorFrom`, which answers black or white, this keeps the hue: a
 * green stays green, only a shade that can be read. It is what an outlined or
 * text-only status label needs, where the colour itself has to carry the text. A
 * colour that already reads is returned unchanged; one that cannot reach the ratio
 * ends at white or black, which always can.
 */
export const getReadableAccentColor = (
  color: TReqoreMultiTypeColor,
  background: TReqoreMultiTypeColor,
  minContrast: number = READABLE_TEXT_CONTRAST
): TReqoreHexColor => getReadableAccentColorOn(color, [background], minContrast);

/**
 * `color` in the shade that stands out by `minContrast` from every one of `backgrounds` (see
 * `getReadableAccentColor`): moved toward whichever of white and black stands out more from the worst of them, until
 * it stands out from all of them - or is that white or black, when nothing does.
 */
export const getReadableAccentColorOn = (
  color: TReqoreMultiTypeColor,
  backgrounds: TReqoreMultiTypeColor[],
  minContrast: number = READABLE_TEXT_CONTRAST
): TReqoreHexColor => {
  const surfaces = backgrounds.map((background) => getOpaqueColor(background));
  const worst = (candidate: TReqoreMultiTypeColor) =>
    Math.min(...surfaces.map((surface) => getContrastRatio(candidate, surface)));
  const lighter = worst(Colors.LIGHT) >= worst(Colors.DARK);
  let accent: TReqoreHexColor = getOpaqueColor(color);

  // 25 steps of 4% lightness cover the whole range, so the loop always ends.
  for (let step = 0; step < 25 && worst(accent) < minContrast; step++) {
    accent = (lighter ? lighten(0.04, accent) : darken(0.04, accent)) as TReqoreHexColor;
  }

  return accent;
};

/**
 * How a control draws an icon on `backgrounds` (what it is drawn on: one color, or each it may be) beside its `text`:
 * in its own `color` (an intent, a color) in the shade that stands out by 3:1, or else in the text color it
 * inherits; at `opacity`, or as much more as it needs to stand out by 3:1. `color` is undefined when the icon
 * inherits the text color.
 */
export const getReadableIconLook = (
  theme: IReqoreTheme,
  backgrounds: TReqoreHexColor[],
  text: TReqoreMultiTypeColor,
  opacity: number = 1,
  color?: TReqoreEffectColor
): { color?: TReqoreHexColor; opacity: number } => {
  const own = color ? getColorFromMaybeString(theme, color) : undefined;
  const iconColor = own
    ? getReadableAccentColorOn(
        getDrawnColor(own, backgrounds[0]),
        backgrounds,
        READABLE_ICON_CONTRAST
      )
    : undefined;

  return {
    color: iconColor,
    opacity: getReadableAlpha(iconColor ?? text, backgrounds, opacity, READABLE_ICON_CONTRAST),
  };
};

/**
 * What a component is drawn on: one color, or each color of a gradient it is drawn on (a panel's, a card's).
 */
export type TReqoreSurface = TReqoreHexColor | TReqoreHexColor[];

/**
 * What a component is drawn on: `surface`, when a component around it has said (`useReqoreSurface`), or else the
 * surface of the theme it was picked in - the layout's, the theme's main a step lighter (`getMainBackgroundColor`).
 * One color: the first of a gradient's (`getThemeSurfaces` gives every one).
 */
export const getThemeSurface = (
  theme: IReqoreTheme,
  surface?: TReqoreSurface | TReqoreMultiTypeColor | string
): TReqoreHexColor =>
  Array.isArray(surface) && surface.length
    ? getDrawnColor(surface[0])
    : surface && !Array.isArray(surface)
      ? getDrawnColor(surface)
      : getDrawnColor(changeLightness(theme.originalMain || theme.main, 0.02));

/** Every color a component is drawn on (see `getThemeSurface`): each of a gradient's, or the one. */
export const getThemeSurfaces = (
  theme: IReqoreTheme,
  surface?: TReqoreSurface | TReqoreMultiTypeColor | string
): TReqoreHexColor[] =>
  Array.isArray(surface) && surface.length
    ? surface.map((color) => getDrawnColor(color))
    : [getThemeSurface(theme, surface)];

/**
 * Text (or an icon, at `minContrast` 3) in an intent's color on what it is drawn on (`surface`, or the theme's: see
 * `getThemeSurface`): the intent in the shade that stands out there - a warning stays orange, an orange light enough
 * to read on a dark theme. A translucent intent (muted) is drawn over that surface first.
 */
export const getReadableIntentColor = (
  theme: IReqoreTheme,
  intent: TReqoreIntent,
  minContrast: number = READABLE_TEXT_CONTRAST,
  surface?: TReqoreSurface | TReqoreMultiTypeColor | string
): TReqoreHexColor => {
  const unders = getThemeSurfaces(theme, surface);

  return getReadableAccentColorOn(
    getDrawnColor(theme.intents[intent] || unders[0], unders[0]),
    unders,
    minContrast
  );
};

/**
 * A theme's color - an intent, the theme's main, a shade of one ('info', 'success:lighten:5') - in the shade of it
 * that stands out by `minContrast` from what it is drawn on: `backgrounds` when they are known (a tag's fill, each
 * color of a gradient), else `surface` or the theme's (`getThemeSurface`). The theme picks the hue, not how faint
 * it is. Any other color is as it is given.
 */
export const getReadableThemeColor = (
  theme: IReqoreTheme,
  color: TReqoreEffectColor,
  minContrast: number = READABLE_TEXT_CONTRAST,
  surface?: TReqoreSurface | TReqoreMultiTypeColor | string,
  backgrounds?: TReqoreHexColor[]
): TReqoreHexColor => {
  const resolved = getColorFromMaybeString(theme, color);
  const base = typeof color === 'string' ? color.split(':')[0] : undefined;

  if (!resolved || !base || (base !== 'main' && !theme.intents?.[base])) {
    return resolved;
  }

  const under = backgrounds?.length ? backgrounds : getThemeSurfaces(theme, surface);

  return getReadableAccentColorOn(getDrawnColor(resolved, under[0]), under, minContrast);
};

export const getColorByBgColor = (bgColor) => {
  if (!bgColor) {
    return '';
  }
  return parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2 ? '#000000' : '#ffffff';
};

export const isValidSixCharHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/.test(hex);
};

export const buildTheme = (theme: IReqoreTheme): IReqoreTheme => {
  const newTheme: IReqoreTheme = cloneDeep(theme);

  // Check if the main color is a valid hex color
  if (!isValidSixCharHex(newTheme.main)) {
    newTheme.main = '#333333';
  }

  // Add the original theme main color to the theme
  newTheme.originalMain = newTheme.main;

  // Build the muted intent
  const readableColor = getReadableColorFrom(newTheme.main, true);
  newTheme.intents.muted = `${readableColor}30`;

  if (!newTheme.notifications?.info) {
    newTheme.notifications.info = newTheme.intents.info || DEFAULT_INTENTS.info;
  }

  if (!newTheme.notifications?.success) {
    newTheme.notifications.success = newTheme.intents.success || DEFAULT_INTENTS.success;
  }

  if (!newTheme.notifications?.pending) {
    newTheme.notifications.pending = newTheme.intents.pending || DEFAULT_INTENTS.pending;
  }

  if (!newTheme.notifications?.warning) {
    newTheme.notifications.warning = newTheme.intents.warning || DEFAULT_INTENTS.warning;
  }

  if (!newTheme.notifications?.danger) {
    newTheme.notifications.danger = newTheme.intents.danger || DEFAULT_INTENTS.danger;
  }

  if (!newTheme.notifications?.muted) {
    newTheme.notifications.muted = newTheme.intents.muted || `${DEFAULT_INTENTS.muted}30`;
  }

  return newTheme;
};

export const mergeThemes = (element: string, theme: IReqoreTheme, customTheme: any) => {
  const clonedTheme = cloneDeep(theme);

  if (!customTheme) {
    return clonedTheme;
  }

  if (element === 'main') {
    merge(clonedTheme, {
      main: customTheme.main,
      originalMain: clonedTheme.main,
      text: customTheme.text,
    });
  } else {
    merge(clonedTheme, { [element]: customTheme, text: customTheme.text });
  }

  return clonedTheme;
};

export const getNotificationIntent = (theme: IReqoreTheme, intent?: TReqoreIntent) => {
  if (intent) {
    return theme.notifications[intent];
  }

  return changeLightness(theme.main, 0.1);
};

export const getMainBackgroundColor = (theme: IReqoreTheme): TReqoreHexColor =>
  changeLightness(theme.main, 0.02);

export const getColorFromMaybeString = (
  theme: IReqoreTheme,
  color: TReqoreEffectColor
): TReqoreHexColor => {
  if (!color) {
    return undefined;
  }

  if (color.startsWith('rgba')) {
    return RGBAToHexA(color);
  }

  const [providedColor, shading, multiplier = 1, alpha = 1]: TReqoreEffectColorList = color.split(
    ':'
  ) as TReqoreEffectColorList;

  if (providedColor === 'transparent') {
    return theme.originalMain;
  }

  // First we need to get the actual color
  let _color: TReqoreHexColor;

  if (!providedColor || providedColor === 'main') {
    _color = theme.main;
  }

  if (theme.intents[providedColor]) {
    _color = theme.intents[providedColor];
  }

  if (isValidSixCharHex(providedColor)) {
    _color = providedColor as TReqoreHexColor;
  }

  if (shading) {
    if (shading === 'lighten') {
      _color = lighten(0.033 * multiplier, _color) as TReqoreHexColor;
    } else if (shading === 'darken') {
      _color = darken(0.033 * multiplier, _color) as TReqoreHexColor;
    }
  }

  if (_color && _color.length === 7 && alpha < 1) {
    _color = RGBAToHexA(transparentize(1 - alpha, _color));
  }

  return _color;
};

export const createEffectGradient = (
  theme: IReqoreTheme,
  colors: TReqoreEffectGradientColors,
  lighten: number = 0,
  minimal?: boolean,
  active?: boolean,
  transparent?: boolean
): string => {
  let _colors: TReqoreEffectGradientColorsObject;
  // Check if the colors are valid
  if (!colors) {
    throw new Error('You need to provide colors');
  }

  if (typeof colors === 'string') {
    _colors = buildGradientColorsFromString(theme, colors);
  } else {
    _colors = colors;
  }

  return reduce(
    _colors,
    (colorsString, color, percentage) => {
      return `${colorsString}, ${
        transparent
          ? active
            ? theme.originalMain
            : changeLightness(theme.originalMain, lighten)
          : minimal
          ? rgba(changeLightness(getColorFromMaybeString(theme, color), lighten), 0.25)
          : changeLightness(getColorFromMaybeString(theme, color), lighten)
      } ${percentage}%`;
    },
    ''
  );
};

export const buildGradientColorsFromString = (
  theme: IReqoreTheme,
  colorString: TReqoreEffectColor
): TReqoreEffectGradientColorsObject => {
  if (!colorString) {
    throw new Error('You need to provide a color or intent');
  }

  const finalColor: TReqoreHexColor = getColorFromMaybeString(theme, colorString);
  /* A lighter and a darker shade of the color, each as far as five steps from it - but only as far as the text
     that reads on the color still reads on the shade: a gradient made from one color is a color text is put on,
     and a blue lightened past where white reads on it was white text on a light blue at one end. */
  const text = getReadableColorOn([finalColor]);
  // read at rest and a step lighter, as the effect draws it hovered or pressed
  const readsOn = (shade: TReqoreHexColor) =>
    getContrastRatio(text, shade) >= READABLE_TEXT_CONTRAST &&
    getContrastRatio(text, changeLightness(shade, 0.05)) >= READABLE_TEXT_CONTRAST;
  const getShade = (shading: 'lighten' | 'darken'): TReqoreHexColor => {
    for (let steps = 5; steps > 0; steps--) {
      const shade = getColorFromMaybeString(theme, `${finalColor}:${shading}:${steps}:1`);

      if (readsOn(shade)) {
        return shade;
      }
    }

    if (readsOn(finalColor)) {
      return finalColor;
    }

    // the color itself does not read once lightened: as little the other way as it takes
    const opposite = shading === 'lighten' ? 'darken' : 'lighten';

    for (let steps = 1; steps <= 5; steps++) {
      const shade = getColorFromMaybeString(theme, `${finalColor}:${opposite}:${steps}:1`);

      if (readsOn(shade)) {
        return shade;
      }
    }

    return finalColor;
  };
  const colorFrom: TReqoreHexColor = getShade('lighten');
  const colorTo: TReqoreHexColor = getShade('darken');

  return {
    0: colorFrom,
    100: colorTo,
  };
};

export const getNthGradientColor = (
  theme: IReqoreTheme,
  colors?: TReqoreEffectGradientColors,
  nth: number = 1
): TReqoreHexColor | undefined => {
  const _colors =
    typeof colors === 'string' ? buildGradientColorsFromString(theme, colors) : colors;

  if (_colors) {
    return getColorFromMaybeString(theme, Object.values(_colors)[nth - 1]);
  }

  return undefined;
};

export const getGradientMix = (
  theme: IReqoreTheme,
  colors: TReqoreEffectGradientColors,
  fallback?: TReqoreHexColor
): TReqoreHexColor | undefined => {
  const _colors =
    typeof colors === 'string' ? buildGradientColorsFromString(theme, colors) : colors;

  if (!_colors) {
    return fallback;
  }

  // If there are more than 2 colors, we can't mix them, so we get the first and last color
  const gradientColor1: TReqoreHexColor = getNthGradientColor(theme, _colors);
  const gradientColor2: TReqoreHexColor = getNthGradientColor(theme, _colors, size(_colors));

  return RGBAToHexA(
    mix(
      0.5,
      gradientColor1 === '#00000000' ? theme.main : gradientColor1,
      gradientColor2 === '#00000000' ? theme.main : gradientColor2
    ) as TReqoreHexColor
  );
};

/**
 * Each color a gradient is drawn in, as given (a translucent one stays translucent): what text on the gradient has
 * to stand out from, every one of them.
 */
export const getGradientColorList = (
  theme: IReqoreTheme,
  colors?: TReqoreEffectGradientColors
): TReqoreHexColor[] => {
  const _colors =
    typeof colors === 'string' ? buildGradientColorsFromString(theme, colors) : colors;

  if (!_colors) {
    return [];
  }

  return Object.values(_colors)
    .map((color) => getColorFromMaybeString(theme, color))
    .filter((color): color is TReqoreHexColor => !!color);
};
