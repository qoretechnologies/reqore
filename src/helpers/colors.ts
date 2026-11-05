import { cloneDeep, merge, reduce, size } from 'lodash';
import {
  darken,
  getLuminance,
  lighten,
  mix,
  parseToRgb,
  rgba,
  saturate,
  tint,
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

/**
 * How many results each cached helper keeps. The color maths runs while components render - a button works out its
 * text, its hover and its icons from what it is drawn on, a gradient each of its colors - and a page draws the same
 * few colors over and over (a table of 500 buttons in one theme), so each helper remembers its last results. A
 * page that keeps meeting new colors only ever holds this many: the one used least recently goes first.
 */
const COLOR_CACHE_SIZE = 2000;

/**
 * A helper's memory of its results (see `COLOR_CACHE_SIZE`): `remember(key, compute)`. Also for a component's
 * color work that is a function of its key alone (an effect's gradient pass): not part of the package's API.
 */
export const createColorCache = <T>() => {
  const results = new Map<string, T>();

  return (key: string, compute: () => T): T => {
    if (results.has(key)) {
      const result = results.get(key) as T;

      // the most recently used goes to the end, so the oldest is the first one out
      results.delete(key);
      results.set(key, result);

      return result;
    }

    const result = compute();

    results.set(key, result);

    if (results.size > COLOR_CACHE_SIZE) {
      results.delete(results.keys().next().value as string);
    }

    return result;
  };
};

/** One key for any list of a helper's arguments (colors, numbers, flags, lists of colors). */
export const cacheKey = (...parts: unknown[]): string =>
  parts.map((part) => (Array.isArray(part) ? part.join(',') : String(part))).join('|');

const intentKeys = new WeakMap<object, string>();

/**
 * What of a theme the helpers that take one read: its main, the main it was made from, and its intents. The
 * intents are written out once per intents object.
 */
export const getThemeColorKey = (theme: Partial<IReqoreTheme>): string => {
  const intents = theme.intents as object | undefined;
  let key = intents ? intentKeys.get(intents) : '';

  if (key === undefined) {
    key = JSON.stringify(intents);
    intentKeys.set(intents as object, key);
  }

  return `${theme.main}|${theme.originalMain}|${key}`;
};

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

/** The least size (px) from which bold text is large in WCAG's sense (14pt), and needs to stand out by 3:1 only. */
export const LARGE_BOLD_TEXT_PX = 18.66;

interface IColorParts {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

const rememberParts = createColorCache<IColorParts | undefined>();

/**
 * The red, green, blue and alpha of a color - any a browser and polished both read: a hex of 3, 4, 6 or 8 digits,
 * `rgb()`, `rgba()`, `hsl()`, a named color. Undefined for one they do not (a CSS variable, `currentColor`, a
 * typo), which is the caller's to draw as it is: the helpers below leave such a color alone instead of throwing
 * while a component renders. `'transparent'` is black at no alpha: it draws nothing.
 */
const parseColor = (color: unknown): IColorParts | undefined => {
  if (typeof color !== 'string' || !color) {
    return undefined;
  }

  return rememberParts(color, () => {
    if (color === 'transparent') {
      return { red: 0, green: 0, blue: 0, alpha: 0 };
    }

    try {
      const parsed = parseToRgb(color) as Omit<IColorParts, 'alpha'> & { alpha?: number };

      return {
        red: parsed.red,
        green: parsed.green,
        blue: parsed.blue,
        alpha: parsed.alpha ?? 1,
      };
    } catch {
      return undefined;
    }
  });
};

/** Whether the helpers can read `color` (see `parseColor`). */
export const isReadableColor = (color: unknown): boolean => !!parseColor(color);

/** Whether `color` is a color drawn opaque, which text can be read on. */
const isOpaque = (color: unknown): boolean => parseColor(color)?.alpha === 1;

const toHexColor = ({ red, green, blue }: IColorParts): TReqoreHexColor =>
  `#${[red, green, blue]
    .map((part) =>
      Math.round(Math.min(255, Math.max(0, part)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}` as TReqoreHexColor;

const rememberAlphaColor = createColorCache<string>();

/**
 * `color` at `alpha`, as polished's `rgba(color, alpha)` writes it. A color it cannot read (a CSS variable,
 * `currentColor`) is drawn as given, not thrown on: at an alpha below 1, mixed with nothing by the browser
 * (`color-mix(in srgb, var(--brand) 20%, transparent)`), so a wash of it is still a wash and not the solid color
 * the text on it is written in.
 */
export const getColorAtAlpha = (color: TReqoreMultiTypeColor | string, alpha: number): string => {
  if (typeof color !== 'string' || !color) {
    return color;
  }

  return rememberAlphaColor(cacheKey(color, alpha), () => {
    if (parseColor(color)) {
      return rgba(color, alpha);
    }

    return alpha >= 1
      ? color
      : `color-mix(in srgb, ${color} ${Math.round(Math.max(0, alpha) * 1000) / 10}%, transparent)`;
  });
};

const rememberTint = createColorCache<TReqoreHexColor>();

/**
 * `color` tinted toward white by `amount` and fully saturated: the light shade of it an outlined control (a minimal
 * button, a minimal tag) starts its text from, before it is made to read (`getReadableAccentColorOn`). A translucent
 * color is its own hue drawn opaque; one it cannot read is as it is.
 */
export const getSaturatedTint = (
  color: TReqoreMultiTypeColor | string,
  amount: number
): TReqoreHexColor => {
  const drawn = getDrawnColor(color);

  if (!isOpaque(drawn)) {
    return drawn;
  }

  return rememberTint(cacheKey(drawn, amount), () =>
    getOpaqueColor(saturate(1, tint(amount, drawn)) as TReqoreHexColor)
  );
};

const rememberDrawn = createColorCache<TReqoreHexColor>();

/**
 * `color` as it is drawn over `under`: a translucent color blended into what is under it, the way the browser
 * draws it, and an opaque one as it is. Without `under` (or over one it cannot read), a translucent color counts as
 * its own hue drawn opaque. An opaque six-digit hex - except for a color that draws nothing there
 * (`'transparent'` with nothing under it) or one it cannot read (a CSS variable), which comes back as it is given.
 */
export const getDrawnColor = (
  color: TReqoreMultiTypeColor | string,
  under?: TReqoreMultiTypeColor | string
): TReqoreHexColor =>
  rememberDrawn(cacheKey(color, under), () => {
    const top = parseColor(color);

    if (!top) {
      return color as TReqoreHexColor;
    }

    const bottom = top.alpha < 1 && under ? parseColor(getDrawnColor(under)) : undefined;

    if (!bottom || bottom.alpha < 1) {
      // nothing under it that can be read: its own hue, if it draws anything at all
      return top.alpha > 0 ? toHexColor(top) : (color as TReqoreHexColor);
    }

    const blend = (above: number, below: number) => above * top.alpha + below * (1 - top.alpha);

    return toHexColor({
      red: blend(top.red, bottom.red),
      green: blend(top.green, bottom.green),
      blue: blend(top.blue, bottom.blue),
      alpha: 1,
    });
  });

/**
 * `color` at `opacity` of the alpha it already has: a translucent color (a theme made from the muted intent) drawn
 * at a panel's opacity stays as translucent, and more. `rgba(color, opacity)` replaced its alpha, so a panel in the
 * muted intent's near-white drawn at 19% was drawn near-white and opaque. A color it cannot read is as it is.
 */
export const fadeColor = (color: TReqoreMultiTypeColor | string, opacity: number): string => {
  const parts = parseColor(color);

  if (!parts) {
    return color;
  }

  return rgba(parts.red, parts.green, parts.blue, parts.alpha * opacity);
};

/**
 * The WCAG relative luminance of an opaque color, not rounded: polished's `getLuminance` rounds to three decimals,
 * which moves a ratio near a threshold across it (`#595959` on black is 2.998:1, not 3).
 */
const getRelativeLuminance = ({ red, green, blue }: IColorParts): number => {
  const linear = (channel: number) => {
    const value = channel / 255;

    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
};

const rememberContrast = createColorCache<number>();

/**
 * The WCAG contrast ratio of two colors, each drawn opaque: from 1 to 21, not rounded. NaN when either cannot be
 * read or draws nothing (a CSS variable, `'transparent'`): there is no telling how far it stands out.
 */
export const getContrastRatio = (
  first: TReqoreMultiTypeColor | string,
  second: TReqoreMultiTypeColor | string
): number =>
  rememberContrast(cacheKey(first, second), () => {
    const one = parseColor(getDrawnColor(first));
    const other = parseColor(getDrawnColor(second));

    if (!one || !other || one.alpha < 1 || other.alpha < 1) {
      return NaN;
    }

    const [lighter, darker] = [getRelativeLuminance(one), getRelativeLuminance(other)].sort(
      (a, b) => b - a
    );

    return (lighter + 0.05) / (darker + 0.05);
  });

/** The worst contrast `color` has with any of `backgrounds`. */
const getWorstContrast = (color: TReqoreMultiTypeColor | string, backgrounds: TReqoreHexColor[]) =>
  Math.min(...backgrounds.map((background) => getContrastRatio(color, background)));

/** Of `colors`, as each is drawn over `under`, those text can be read on: opaque, and colors the helpers read. */
const getReadableSurfaces = (
  colors: (TReqoreMultiTypeColor | string)[],
  under?: TReqoreMultiTypeColor | string
): TReqoreHexColor[] =>
  colors.map((color) => getDrawnColor(color, under)).filter((color) => isOpaque(color));

// the theme's text colors, a shade softer (`dim`)
const DIM_ON_LIGHT = lighten(0.05, Colors.DARK) as TReqoreHexColor;
const DIM_ON_DARK = darken(0.05, Colors.LIGHT) as TReqoreHexColor;

const rememberReadableOn = createColorCache<TReqoreHexColor>();

/**
 * The text color that reads on every one of `backgrounds` (each drawn over `under` when it is translucent - the
 * colors of a gradient, or a single surface): of the text colors for a light and for a dark background (`ifLight`,
 * `ifDark`; black and white, a shade softer when `dim`), the one that stands out more. When even that one does not
 * reach 4.5:1, a color the caller gave stays theirs (the better of their pair); the default shades give way to pure
 * black or white, whichever stands out more: a dimmed shade is a nicety, being read is not. A background it cannot
 * read is left out; with none left, the text for a dark background (Reqore's default theme).
 */
export const getReadableColorOn = (
  backgrounds: (TReqoreMultiTypeColor | string)[],
  dim?: boolean,
  ifLight?: TReqoreHexColor,
  ifDark?: TReqoreHexColor,
  under?: TReqoreMultiTypeColor | string
): TReqoreHexColor =>
  rememberReadableOn(cacheKey(backgrounds, dim, ifLight, ifDark, under), () => {
    const surfaces = getReadableSurfaces(backgrounds, under);
    const onLight = ifLight || (dim ? DIM_ON_LIGHT : Colors.DARK);
    const onDark = ifDark || (dim ? DIM_ON_DARK : Colors.LIGHT);

    if (!surfaces.length) {
      return onDark;
    }

    const preferred =
      getWorstContrast(onLight, surfaces) >= getWorstContrast(onDark, surfaces) ? onLight : onDark;

    if (
      getWorstContrast(preferred, surfaces) >= READABLE_TEXT_CONTRAST ||
      (preferred === onLight ? !!ifLight : !!ifDark)
    ) {
      return preferred;
    }

    return getWorstContrast(Colors.DARK, surfaces) >= getWorstContrast(Colors.LIGHT, surfaces)
      ? Colors.DARK
      : Colors.LIGHT;
  });

/** The contrast of `color` (its red, green and blue), drawn at `alpha` over the opaque `background`, with it. */
const getContrastAtAlpha = (
  { red, green, blue }: IColorParts,
  background: TReqoreHexColor,
  alpha: number
): number =>
  getContrastRatio(getDrawnColor(rgba(red, green, blue, alpha), background), background);

/** How far past the ratio `getReadableAlpha` aims: see there. */
const READABLE_ALPHA_MARGIN = 0.1;

/** A color, or each of the colors something may be drawn on (a gradient's, or a control's at rest and hovered). */
export type TReqoreReadableBackground = TReqoreMultiTypeColor | string | (TReqoreMultiTypeColor | string)[];

/**
 * The least alpha (or opacity), from `alpha` up, at which `color` drawn over `background` (each of them, for a list)
 * still stands out from it by `minContrast`: secondary text or an icon fades only as far as it can and still be read.
 * `alpha` itself when it already reads; 1 when even the full color does not, which is for whoever chose that color to
 * fix. A color or a background it cannot read (none given, a CSS variable) leaves `alpha` as it is: there is no
 * telling how far it stands out.
 */
export const getReadableAlpha = (
  color: TReqoreMultiTypeColor | string,
  background: TReqoreReadableBackground,
  alpha: number,
  minContrast: number = READABLE_TEXT_CONTRAST
): number =>
  Math.max(
    alpha,
    ...(Array.isArray(background) ? background : [background]).map((each) =>
      getReadableAlphaOn(color, each, alpha, minContrast)
    )
  );

/**
 * The least alpha from `from` up to 1 at which `reads` holds, to a hundredth, rounded up: `reads` holds at 1 and not
 * at `from`. The range in which it starts to hold is halved until it is less than half a hundredth wide.
 */
const leastReadingAlpha = (from: number, reads: (alpha: number) => boolean): number => {
  let low = from;
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

const rememberAlpha = createColorCache<number>();

const getReadableAlphaOn = (
  color: TReqoreMultiTypeColor | string,
  background: TReqoreMultiTypeColor | string,
  alpha: number,
  ratio: number
): number =>
  rememberAlpha(cacheKey(color, background, alpha, ratio), () => {
    const parts = parseColor(color);
    const surface = getDrawnColor(background);

    if (alpha >= 1 || !parts || !isOpaque(surface)) {
      return alpha;
    }

    // A browser blends a translucent color a shade differently (an alpha of 255ths, its own rounding): an alpha
    // that just reaches the ratio here can fall a hair short on the page, so it aims a little past it.
    const minContrast = ratio + READABLE_ALPHA_MARGIN;

    if (getContrastAtAlpha(parts, surface, alpha) >= minContrast) {
      return alpha;
    }

    if (getContrastAtAlpha(parts, surface, 1) < minContrast) {
      return 1;
    }

    return leastReadingAlpha(alpha, (at) => getContrastAtAlpha(parts, surface, at) >= minContrast);
  });

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
  // a mark, or what it is on, that cannot be read (a CSS variable) cannot be measured: it is left out
  const drawn = marks
    .map(({ color, alpha, on }) => {
      const fill = getDrawnColor(on);

      return { fill, mark: getDrawnColor(fadeColor(color, alpha), fill) };
    })
    .filter(({ fill, mark }) => isOpaque(fill) && isOpaque(mark));

  if (!isOpaque(page) || !drawn.length) {
    return opacity;
  }

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

  return leastReadingAlpha(opacity, reads);
};

/** `color` at `alpha`, or at as much more as it needs to stand out from `background` (`getReadableAlpha`). */
export const getReadableFadedColor = (
  color: TReqoreMultiTypeColor | string,
  background: TReqoreReadableBackground,
  alpha: number,
  minContrast: number = READABLE_TEXT_CONTRAST
): string =>
  isOpaque(getDrawnColor(color))
    ? rgba(getDrawnColor(color), getReadableAlpha(color, background, alpha, minContrast))
    : color;

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

/** Whether `color` is a gray (black and white included); false for one it cannot read. */
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

/** A hex color of 3, 4, 6 or 8 digits: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`. */
const HEX_COLOR = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * A hex color in its long form, as CSS reads a short one - each digit doubled: `#fdc` is `#ffddcc`, `#f00a` is
 * `#ff0000aa`. A long one, or anything that is not a hex color, as it is.
 */
const expandHexColor = (color: string): string =>
  HEX_COLOR.test(color) && color.length <= 5
    ? `#${Array.from(color.slice(1), (digit) => digit + digit).join('')}`
    : color;

const NO_RGBA = { r: NaN, g: NaN, b: NaN, a: NaN };

/**
 * The red, green, blue (0-255) and alpha (0-1) of a color: a hex of 3, 4, 6 or 8 digits, `rgb()`/`rgba()`, or any
 * other color polished reads (`hsl()`, a named one). NaN in each for one it cannot read (a CSS variable).
 *
 * A short hex is each of its digits doubled (`#fdc` is `#ffddcc`). It was repeated (`#fdcfdc`, another hue), and
 * polished writes the colors it works out short wherever it can, so a readable shade made from one of them took
 * the wrong hue: a minimal button in `#ff5500` had lilac text instead of peach.
 */
export const getRGBAFromHex = (
  color: TReqoreMultiTypeColor
): { r: number; g: number; b: number; a: number } => {
  if (typeof color !== 'string') {
    return NO_RGBA;
  }

  // If this is already an rgba color, we need to convert it to hex
  const hexColor = expandHexColor(color.startsWith('rgba') ? RGBAToHexA(color) : color);

  if (!HEX_COLOR.test(hexColor)) {
    const parts = parseColor(color);

    return parts ? { r: parts.red, g: parts.green, b: parts.blue, a: parts.alpha } : NO_RGBA;
  }

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const a = parseInt(hexColor.slice(7, 9) || 'ff', 16) / 255;

  return { r, g, b, a };
};

/** `hex` as `rgba(r, g, b, a)`; an `rgb()`/`rgba()` color, and one it cannot read, as it is. */
export const hexAToRGBA = (hex: TReqoreMultiTypeColor): TReqoreRgbaColor => {
  // Check if this color is already in rgba format
  if (typeof hex !== 'string' || hex.startsWith('rgb')) {
    return hex as TReqoreRgbaColor;
  }

  const { r, g, b, a } = getRGBAFromHex(hex as TReqoreHexColor);

  if (Number.isNaN(r)) {
    return hex as TReqoreRgbaColor;
  }

  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
};

export const RGBAToHexA = (rgba, forceRemoveAlpha = false): TReqoreHexColor => {
  // a hex already, of any length (`#f00a` too, which the parse below would write as `#NaN`)
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

/** Whether `mainColor` is light (a lighter shade of it is made darker); false for one it cannot read. */
export const shouldDarken = (mainColor: TReqoreMultiTypeColor): boolean =>
  isReadableColor(mainColor) && getLuminance(hexAToRGBA(mainColor)) > 0.2;

export const getMainColor: (theme: IReqoreTheme, component: string) => TReqoreHexColor = (
  theme,
  component
) => theme[component]?.main || theme.main;

//export const changeBasedOnContrast = (color: string, lightness?: number): string =>

const rememberLightness = createColorCache<TReqoreHexColor>();

/**
 * `color` moved by `lightness` away from what it is (`towardContrast`: a light color darker, a dark one lighter)
 * or toward it. A color it cannot read is as it is.
 */
const shiftLightness = (
  color: TReqoreHexColor,
  lightness: number | undefined,
  towardContrast: boolean
): TReqoreHexColor => {
  if (!lightness || !isReadableColor(color)) {
    return color;
  }

  return rememberLightness(cacheKey(color, lightness, towardContrast), () => {
    const fixedColor = hexAToRGBA(color);

    return (
      shouldDarken(fixedColor) === towardContrast
        ? darken(lightness, fixedColor)
        : lighten(lightness, fixedColor)
    ) as TReqoreHexColor;
  });
};

export const changeLightness = (color: TReqoreHexColor, lightness?: number): TReqoreHexColor =>
  shiftLightness(color, lightness, true);

export const changeDarkness = (color: TReqoreHexColor, lightness?: number): TReqoreHexColor =>
  shiftLightness(color, lightness, false);

/**
 * The colour without its alpha channel, as a six-digit hex: `#e6e6e630` → `#e6e6e6`,
 * `rgba(10, 102, 64, 0.5)` → `#0a6640`. For colour maths that needs the hue a colour
 * is drawn in rather than how faintly it is drawn (Reqore's muted intent, for one, is
 * an eight-digit hex). A color it cannot read (a CSS variable) is as it is.
 */
export const getOpaqueColor = (color: TReqoreMultiTypeColor): TReqoreHexColor => {
  const { r, g, b } = getRGBAFromHex(color);

  if (Number.isNaN(r)) {
    return color as TReqoreHexColor;
  }

  return toHexColor({ red: r, green: g, blue: b, alpha: 1 });
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

const rememberAccent = createColorCache<TReqoreHexColor>();

/**
 * `color` in the shade that stands out by `minContrast` from every one of `backgrounds` (see
 * `getReadableAccentColor`): moved toward whichever of white and black stands out more from the worst of them, until
 * it stands out from all of them - or is that white or black, when nothing does. Always a six-digit hex; a color it
 * cannot read is as it is, and a background it cannot read is left out.
 */
export const getReadableAccentColorOn = (
  color: TReqoreMultiTypeColor,
  backgrounds: TReqoreMultiTypeColor[],
  minContrast: number = READABLE_TEXT_CONTRAST
): TReqoreHexColor => {
  const start = getOpaqueColor(color);

  if (!isOpaque(start)) {
    return start;
  }

  return rememberAccent(cacheKey(start, backgrounds, minContrast), () => {
    const surfaces = backgrounds
      .map((background) => getOpaqueColor(background))
      .filter((surface) => isOpaque(surface));
    const worst = (candidate: TReqoreMultiTypeColor) =>
      Math.min(...surfaces.map((surface) => getContrastRatio(candidate, surface)));
    const lighter = worst(Colors.LIGHT) >= worst(Colors.DARK);
    let accent: TReqoreHexColor = start;

    // 25 steps of 4% lightness cover the whole range, so the loop always ends.
    for (let step = 0; step < 25 && surfaces.length && worst(accent) < minContrast; step++) {
      accent = (lighter ? lighten(0.04, accent) : darken(0.04, accent)) as TReqoreHexColor;
    }

    // polished writes a color short where it can (`#fff`): the long form, for whoever adds an alpha to it
    return getOpaqueColor(accent);
  });
};

/**
 * How a control draws an icon on `backgrounds` (what it is drawn on: one color, or each it may be) beside its `text`:
 * in its own `color` or else in the text color it inherits; at `opacity`, or as much more as it needs to stand out
 * by 3:1. A theme's color (an intent, the theme's main, a shade of one) is drawn in the shade of it that stands
 * out by 3:1; any other color (an explicit hex) as it is given, as a standalone `ReqoreIcon` draws it. `color` is
 * undefined when the icon inherits the text color.
 */
export const getReadableIconLook = (
  theme: IReqoreTheme,
  backgrounds: TReqoreHexColor[],
  text: TReqoreMultiTypeColor,
  opacity: number = 1,
  color?: TReqoreEffectColor
): { color?: TReqoreHexColor; opacity: number } => {
  const iconColor = color
    ? getReadableThemeColor(theme, color, READABLE_ICON_CONTRAST, undefined, backgrounds)
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
): TReqoreHexColor => getThemeSurfaces(theme, surface)[0];

/**
 * Every color a component is drawn on (see `getThemeSurface`): each of a gradient's, or the one. A color that draws
 * nothing (`'transparent'`) or that cannot be read (a CSS variable) is no surface to read on and is left out; with
 * none left, the theme's.
 */
export const getThemeSurfaces = (
  theme: IReqoreTheme,
  surface?: TReqoreSurface | TReqoreMultiTypeColor | string
): TReqoreHexColor[] => {
  const given = getReadableSurfaces(Array.isArray(surface) ? surface : surface ? [surface] : []);

  return given.length
    ? given
    : [getDrawnColor(changeLightness(theme.originalMain || theme.main, 0.02))];
};

const rememberIntentColor = createColorCache<TReqoreHexColor>();
const rememberThemeColor = createColorCache<TReqoreHexColor>();

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
): TReqoreHexColor =>
  rememberIntentColor(
    cacheKey(getThemeColorKey(theme), intent, minContrast, surface),
    () => {
      const unders = getThemeSurfaces(theme, surface);

      return getReadableAccentColorOn(
        getDrawnColor(theme.intents[intent] || unders[0], unders[0]),
        unders,
        minContrast
      );
    }
  );

/**
 * The color a span, a paragraph or a link writes its text in: an intent in a shade of it that reads on what the text
 * is drawn on (`surface`, or the theme's), else the theme's text color, else what it inherits.
 */
export const getReadableTextColor = (
  theme: IReqoreTheme,
  intent?: TReqoreIntent,
  surface?: TReqoreSurface
): string =>
  intent
    ? getReadableIntentColor(theme, intent, undefined, surface)
    : theme.text?.color || 'inherit';

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

  return rememberThemeColor(
    cacheKey(
      resolved,
      minContrast,
      backgrounds?.length ? backgrounds : '',
      surface,
      theme.originalMain,
      theme.main
    ),
    () => {
      const under = backgrounds?.length ? backgrounds : getThemeSurfaces(theme, surface);

      return getReadableAccentColorOn(getDrawnColor(resolved, under[0]), under, minContrast);
    }
  );
};

/**
 * Black or white for a background, by its value in the long form (a short hex, `#fff`, was read as the number
 * `0xfff`: white text on white). Empty for no background; white for one it cannot read.
 */
export const getColorByBgColor = (bgColor) => {
  if (!bgColor) {
    return '';
  }
  return parseInt(getOpaqueColor(bgColor).replace('#', ''), 16) > 0xffffff / 2
    ? '#000000'
    : '#ffffff';
};

/** A hex color of 3, 4, 6 or 8 digits (the name is older than the rule): one CSS and the helpers read. */
export const isValidSixCharHex = (hex: string): boolean =>
  typeof hex === 'string' && HEX_COLOR.test(hex);

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

/**
 * Whether `color` is one CSS draws though Reqore has no name for it: a color function (`var(--brand)`, `hsl()`,
 * `color-mix()`), `currentColor`, or a color polished reads (a named one, `red`).
 */
const isCssColor = (color: string): boolean =>
  color.includes('(') || /^currentcolor$/i.test(color) || isReadableColor(color);

const rememberColor = createColorCache<TReqoreHexColor>();

/**
 * The color `color` names: an intent, the theme's main (`main`, or nothing before the first colon), a hex (a short
 * one with an alpha, `#f00a`, in its long form), or `transparent` (the theme's original main), lightened or
 * darkened by a number of steps and drawn at an alpha (`info:lighten:2:0.5`). A color CSS draws but Reqore has no
 * name for (`red`, `var(--brand)`, `currentColor`) is as it is given, and so is a color that cannot be lightened (an
 * intent that is a CSS variable); a name nothing knows is undefined.
 */
export const getColorFromMaybeString = (
  theme: IReqoreTheme,
  color: TReqoreEffectColor
): TReqoreHexColor => {
  if (!color || typeof color !== 'string') {
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

  return rememberColor(
    cacheKey(color, theme.main, theme.originalMain, theme.intents?.[providedColor]),
    () => {
      // First we need to get the actual color
      let _color: TReqoreHexColor;

      if (!providedColor || providedColor === 'main') {
        _color = theme.main;
      }

      if (theme.intents?.[providedColor]) {
        _color = theme.intents[providedColor];
      }

      if (HEX_COLOR.test(providedColor)) {
        // a short hex with an alpha (`#f00a`) in its long form; any other hex as it is
        _color = (
          providedColor.length === 5 ? expandHexColor(providedColor) : providedColor
        ) as TReqoreHexColor;
      } else if (!_color && providedColor && isCssColor(providedColor)) {
        _color = providedColor as TReqoreHexColor;
      }

      // a color that cannot be read (a CSS variable) cannot be shaded either: it is drawn as it is
      if (!isReadableColor(_color)) {
        return _color;
      }

      if (shading) {
        if (shading === 'lighten') {
          _color = lighten(0.033 * multiplier, _color) as TReqoreHexColor;
        } else if (shading === 'darken') {
          _color = darken(0.033 * multiplier, _color) as TReqoreHexColor;
        }
      }

      // an opaque hex (polished writes a short one where it can) drawn at an alpha
      if ((_color.length === 7 || _color.length === 4) && alpha < 1) {
        _color = RGBAToHexA(transparentize(1 - alpha, _color));
      }

      return _color;
    }
  );
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

  return rememberEffectGradient(
    cacheKey(
      getThemeColorKey(theme),
      typeof colors === 'string' ? colors : JSON.stringify(colors),
      lighten,
      minimal,
      active,
      transparent
    ),
    () => {
      if (typeof colors === 'string') {
        _colors = buildGradientColorsFromString(theme, colors);
      } else {
        _colors = colors;
      }

      return reduce(
        _colors,
        (colorsString, color, percentage) => {
          // a color nothing knows draws nothing, rather than an `undefined` that drops the whole gradient
          const stop = getColorFromMaybeString(theme, color) || 'transparent';

          return `${colorsString}, ${
            transparent
              ? active
                ? theme.originalMain
                : changeLightness(theme.originalMain, lighten)
              : minimal
                ? getColorAtAlpha(changeLightness(stop as TReqoreHexColor, lighten), 0.25)
                : changeLightness(stop as TReqoreHexColor, lighten)
          } ${percentage}%`;
        },
        ''
      );
    }
  );
};

const rememberEffectGradient = createColorCache<string>();
const rememberGradientColors = createColorCache<TReqoreEffectGradientColorsObject>();

/**
 * A gradient made from one color (`'info'`, `'#0776cb'`): see `buildGradientShades`. A color it cannot read (a CSS
 * variable) is the gradient's both ends.
 */
export const buildGradientColorsFromString = (
  theme: IReqoreTheme,
  colorString: TReqoreEffectColor
): TReqoreEffectGradientColorsObject => {
  if (!colorString) {
    throw new Error('You need to provide a color or intent');
  }

  const finalColor: TReqoreHexColor = getColorFromMaybeString(theme, colorString);

  if (!isReadableColor(finalColor)) {
    return { 0: finalColor, 100: finalColor };
  }

  // the shades depend only on the color: a copy, so a caller that changes it changes nobody else's
  return { ...rememberGradientColors(finalColor, () => buildGradientShades(theme, finalColor)) };
};

const buildGradientShades = (
  theme: IReqoreTheme,
  finalColor: TReqoreHexColor
): TReqoreEffectGradientColorsObject => {
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

const rememberGradientMix = createColorCache<TReqoreHexColor | undefined>();

export const getGradientMix = (
  theme: IReqoreTheme,
  colors: TReqoreEffectGradientColors,
  fallback?: TReqoreHexColor
): TReqoreHexColor | undefined => {
  if (!colors) {
    return fallback;
  }

  return rememberGradientMix(
    cacheKey(
      getThemeColorKey(theme),
      typeof colors === 'string' ? colors : JSON.stringify(colors),
      fallback
    ),
    () => mixGradient(theme, colors, fallback)
  );
};

/** The middle of a gradient, the mix of its first and last colors: see `getGradientMix`. */
const mixGradient = (
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
  const first = gradientColor1 === '#00000000' ? theme.main : gradientColor1;
  const last = gradientColor2 === '#00000000' ? theme.main : gradientColor2;

  // colors it cannot read (a CSS variable) cannot be mixed: the first that can be, or the fallback
  if (!isReadableColor(first) || !isReadableColor(last)) {
    return [first, last].find((color) => isReadableColor(color)) || fallback || first;
  }

  return RGBAToHexA(mix(0.5, first, last) as TReqoreHexColor);
};

const rememberGradientList = createColorCache<TReqoreHexColor[]>();

/**
 * Each color a gradient is drawn in, as given (a translucent one stays translucent): what text on the gradient has
 * to stand out from, every one of them.
 */
export const getGradientColorList = (
  theme: IReqoreTheme,
  colors?: TReqoreEffectGradientColors
): TReqoreHexColor[] => {
  if (!colors) {
    return [];
  }

  // a copy: a caller that changes the list changes nobody else's
  return [
    ...rememberGradientList(
      cacheKey(
        getThemeColorKey(theme),
        typeof colors === 'string' ? colors : JSON.stringify(colors)
      ),
      () => {
        const _colors =
          typeof colors === 'string' ? buildGradientColorsFromString(theme, colors) : colors;

        return Object.values(_colors)
          .map((color) => getColorFromMaybeString(theme, color))
          .filter((color): color is TReqoreHexColor => !!color);
      }
    ),
  ];
};
