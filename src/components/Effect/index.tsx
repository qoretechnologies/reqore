import { rgba } from 'polished';
import { HTMLAttributes } from 'react';
import { css, keyframes } from 'styled-components';
import { Colors } from '../../constants/colors';
import { getFontFamily, TReqoreFontFamilyShorthand } from '../../constants/fonts';
import { TEXT_FROM_SIZE, TSizes, WEIGHT_TO_NUMBER } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  buildGradientColorsFromString,
  changeLightness,
  createEffectGradient,
  getColorFromMaybeString,
  getDrawnColor,
  getGradientColorList,
  getReadableAccentColorOn,
  getReadableColorFrom,
  getReadableColorOn,
  getReadableFadedColor,
  getReadableThemeColor,
  getReadableAlpha,
  getThemeSurface,
  getThemeSurfaces,
  READABLE_TEXT_CONTRAST,
  TReqoreSurface,
} from '../../helpers/colors';
import styled, { omitStyleProps } from '../../helpers/styled';
import { isStringSize } from '../../helpers/utils';
import { IWithReqoreMinimal } from '../../types/global';

export type TReqoreEffectColorManipulation = 'darken' | 'lighten';
export type TReqoreEffectColorManipulationMultiplier =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30;
export type TReqoreEffectColorManipulationAlpha =
  | 0
  | 0.1
  | 0.2
  | 0.3
  | 0.4
  | 0.5
  | 0.6
  | 0.7
  | 0.8
  | 0.9
  | 1;
export type TReqoreHexColor = `#${string}`;
export type TReqoreRgbColor = `rgb(${number}, ${number}, ${number})`;
export type TReqoreRgbaColor = `rgba(${number}, ${number}, ${number}, ${string})`;
export type TReqoreMultiTypeColor = TReqoreHexColor | TReqoreRgbColor | TReqoreRgbaColor;
export type TReqoreColor = TReqoreHexColor | 'transparent';
/** The colour a modifier applies to: an intent, the theme's own, or a hex. */
export type TReqoreEffectColorBase = TReqoreIntent | 'main' | TReqoreHexColor;

/**
 * A colour, optionally lightened or darkened.
 *
 * The modifier segments are `${number}`, NOT the enumerated
 * `TReqoreEffectColorManipulationMultiplier` / `...Alpha`. Enumerating them
 * spelled this type as roughly ten thousand members (2 manipulations × 30
 * multipliers × 11 alphas × every intent and the hex pattern), and a union
 * that size is a tax paid by every consumer: under TypeScript 7 an expression
 * that merely MENTIONS a value of it — a conditional between two colours, an
 * object literal checked against `IReqoreEffect` — fails to compile with
 * `TS2590: Expression produces a union type that is too complex to represent`.
 * The Qorus IDE's map had to cast correctly-typed colours to `any` to get past
 * it.
 *
 * The accepted spellings are unchanged. The ranges the manipulations are
 * DESIGNED for stay published as `TReqoreEffectColorManipulationMultiplier`
 * (1-30) and `TReqoreEffectColorManipulationAlpha` (0-1 in tenths) for a
 * consumer that wants to pin them; `changeLightness` treats the multiplier as
 * a step count and clamps the result, so a number outside the range is a
 * degree of the same effect rather than an error.
 */
export type TReqoreEffectColor =
  | (TReqoreColor | TReqoreHexColor | 'main' | TReqoreIntent)
  | `${TReqoreEffectColorBase}:${TReqoreEffectColorManipulation}`
  | `${TReqoreEffectColorBase}:${TReqoreEffectColorManipulation}:${number}`
  | `${TReqoreEffectColorBase}:${TReqoreEffectColorManipulation}:${number}:${number}`;
export type TReqoreEffectColorList = [
  'main' | TReqoreIntent | TReqoreColor,
  TReqoreEffectColorManipulation | undefined,
  TReqoreEffectColorManipulationMultiplier | undefined,
  TReqoreEffectColorManipulationAlpha | undefined
];
export type TReqoreEffectGradientColors = TReqoreEffectColor | TReqoreEffectGradientColorsObject;
export type TReqoreEffectGradientColorsObject = Record<number, TReqoreEffectColor>;
export type TReqoreEffectGradientAnimationTrigger = 'always' | 'hover' | 'active' | 'never';

export interface IReqoreEffectFilters {
  grayscale?: boolean;
  blur?: number;
  /**
   * Blur radius in pixels applied to whatever is rendered behind this element (frosted-glass
   * effect via `backdrop-filter`). Unlike `blur`, this leaves the element's own content sharp.
   * Requires the element to have a translucent background to be visible.
   */
  backgroundBlur?: number;

  sepia?: boolean;
  invert?: boolean;
  opacity?: number;
  brightness?: number;
  contrast?: number;
  saturate?: number;
}

export interface IReqoreEffectGradient {
  type?: 'linear' | 'radial';
  shape?: 'circle' | 'ellipse';
  /**
   * Radial-gradient size hint. Goes between the shape and the position in the
   * generated CSS (e.g. `ellipse 90% 120% at 0% 50%`). Accepts CSS radial
   * sizing keywords (`closest-side`, `farthest-corner`, …) or an explicit
   * `<width> <height>` pair. Only applies when `type === 'radial'`.
   */
  size?: string;
  colors: TReqoreEffectGradientColors;
  direction?: string;
  borderColor?: TReqoreEffectColor;
  /**
   * Paint the gradient on the BORDER only and fill the surface with this colour
   * instead — a gradient ring around a plain surface (an "AI is working" rail,
   * a highlighted card). Only honoured on the first gradient, which is the one
   * that draws the border, and only where there is a border to draw on (not on
   * text, and not when `borderColor` is set). The readable text colour follows
   * the surface; `animate` still flows the ring. The colour may carry an alpha
   * (`'main:darken:1:0.9'`) for a translucent surface.
   */
  surface?: TReqoreEffectColor;
  animate?: TReqoreEffectGradientAnimationTrigger;
  animationSpeed?: 1 | 2 | 3 | 4 | 5;
}

export interface IReqoreEffectGlow {
  size?: number;
  color: TReqoreEffectColor;
  inset?: boolean;
  blur?: number;
  opacity?: number;
  /** Horizontal offset in px (a non-text glow). Default 0: centred. */
  x?: number;
  /** Vertical offset in px (a non-text glow). Default 0: centred. */
  y?: number;
  when?: 'always' | 'hover' | 'focus' | 'active';
}

export interface IReqoreEffect extends IReqoreEffectFilters {
  /**
   * Background gradient applied to the element. Accepts either a single gradient
   * object or an array of gradient objects — when an array is provided the
   * gradients are stacked as CSS `background-image` layers in the order given
   * (first gradient on top). Border-image / readable-text-color logic and
   * gradient animations are driven by the *first* gradient in the list, so put
   * the gradient that should "lead" first.
   */
  gradient?: IReqoreEffectGradient | IReqoreEffectGradient[];
  noWrap?: boolean;
  spaced?: number;

  weight?: number | 'thin' | 'light' | 'normal' | 'bold' | 'thick';
  italic?: boolean;
  underline?: boolean | string;
  lineThrough?: boolean | string;
  color?: TReqoreEffectColor;

  uppercase?: boolean;
  /**
   * Font family for the text. Accepts the `'mono'` / `'system'` shorthands — which
   * resolve to Reqore's own stacks — or any raw CSS font stack.
   *
   * Applied with `!important`, like the other text effects here, because several
   * components declare a `font-family` of their own further down the cascade
   * (`ReqoreTag`, `ReqoreKeyboardShortcut`); without it, whether the effect wins
   * would depend on which styled-component happened to mount last.
   */
  fontFamily?: TReqoreFontFamilyShorthand | string;
  textSize?: TSizes | string;
  textAlign?: 'left' | 'center' | 'right';
  /**
   * How a border is drawn, for any component that draws one.
   *
   * `'dashed'` / `'dotted'` read as "this is a slot, not a thing" — the
   * convention for an *add* affordance, where the control stands in for
   * content that does not exist yet. Living on `effect` rather than on
   * one component's props means every effect-aware surface gets it at
   * once: a button, a panel, a tag, a callout, an entity row.
   *
   * Applied with `!important` for the same reason `borderColor` and
   * `fontFamily` are: components declare their border with the `border`
   * SHORTHAND (`1px solid …`), which resets `border-style`, and that
   * shorthand sits further down the cascade than this block.
   *
   * Sets the style only — it never draws a border that was not there.
   * On a `flat` surface, which has `border: 0`, it is inert rather than
   * wrong.
   */
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  /**
   * A glow around the element — or a list of them, painted together (the first
   * is on top). A list is how a surface gets a two-tone glow: one colour to the
   * left (`x: -14`), another to the right (`x: 14`). The trigger (`when`) is the
   * FIRST glow's; a text glow only paints the first. Because it may be a list,
   * code that reads a glow back must not reach into `effect.glow.color`
   * directly — use `getPrimaryGlow(effect.glow)` / `normalizeGlows(effect.glow)`.
   */
  glow?: IReqoreEffectGlow | IReqoreEffectGlow[];
  frost?:
    | boolean
    | {
        color?: TReqoreEffectColor;
        opacity?: number;
        shadowOpacity?: number;
        blur?: number;
      };
  interactive?: boolean;
}

export interface IReqoreTextEffectProps
  extends HTMLAttributes<HTMLSpanElement>,
    IWithReqoreMinimal {
  children: React.ReactNode;
  effect: IReqoreEffect;
  inline?: boolean;
  as?: React.ElementType;
  theme?: IReqoreTheme;
  active?: boolean;
  isText?: boolean;
  transparent?: boolean;
  /** What the text is drawn on (`useReqoreSurface`), when the component knows: the theme's surface when not. */
  $surface?: TReqoreSurface;
  /** Every color the text is drawn on, when the component knows them better (a tag's fill, each color of its gradient). */
  $backgrounds?: TReqoreHexColor[];
}

/**
 * The colors a (non-text) gradient effect paints, each as the browser draws it: the fill (a step lighter and at a
 * quarter when minimal) over the lighter ring the effect draws under it (border-box, a quarter too when minimal),
 * over the element's own `base` color, over what is under the element. With an opaque fill the ring is hidden;
 * with a translucent one it shows through, and text drawn there is drawn on all of it.
 */
export const getEffectGradientBackgrounds = (
  theme: IReqoreTheme,
  colors: TReqoreEffectGradientColors,
  minimal: boolean | undefined,
  base: string,
  under: TReqoreHexColor
): TReqoreHexColor[] => {
  const behind = base === 'transparent' ? under : getDrawnColor(base, under);

  return getGradientColorList(theme, colors).map((stop) => {
    const fill = minimal ? rgba(changeLightness(stop, 0.05), 0.25) : stop;
    const ring = minimal ? rgba(changeLightness(stop, 0.15), 0.25) : changeLightness(stop, 0.15);

    return getDrawnColor(fill, getDrawnColor(ring, behind));
  });
};

/**
 * What a component with this effect is drawn in: each color of its gradient (its `surface` fill, when the gradient
 * is only its ring), each over what is under the component; `flat` when it has no gradient. What it holds is read
 * against all of them.
 */
export const getEffectBackgrounds = (
  theme: IReqoreTheme,
  effect: IReqoreEffect | undefined,
  flat: TReqoreHexColor,
  under: TReqoreHexColor
): TReqoreHexColor[] => {
  const gradient = getPrimaryGradient(effect?.gradient);

  if (!gradient) {
    return [flat];
  }

  if (gradient.surface && !gradient.borderColor) {
    return [getDrawnColor(getColorFromMaybeString(theme, gradient.surface) || under, under)];
  }

  // a list of gradients is drawn as layers: each over the ones after it
  const stops = drawGradientLayers(
    normalizeGradients(effect?.gradient).map((each) => getGradientColorList(theme, each.colors)),
    under
  );

  return stops.length ? stops : [flat];
};

/**
 * The colors gradient layers are drawn in: each layer (the first on top) as each of its colors, over each color of
 * the layers under it, over `under` - every color the stack can show somewhere. A step lighter with `lighten`, as
 * an effect draws them hovered or pressed.
 */
export const drawGradientLayers = (
  layers: TReqoreHexColor[][],
  under: TReqoreHexColor,
  lighten: number = 0
): TReqoreHexColor[] =>
  layers.reduceRight<TReqoreHexColor[]>(
    (below, layer) =>
      Array.from(
        new Set(
          below.flatMap((beneath) =>
            layer.map((stop) =>
              getDrawnColor(lighten ? changeLightness(stop, lighten) : stop, beneath)
            )
          )
        )
      ),
    [under]
  );

/**
 * The color an effect writes its text in. A theme's color - an intent, the theme's main, a shade of one ('info',
 * 'success:lighten:5') - in the shade of it that reads on what the text is drawn on, as an intent's text does: the
 * theme picks the hue, not how faint it is. Any other color as it is given.
 */
export const getEffectTextColor = (
  theme: IReqoreTheme,
  color: TReqoreEffectColor,
  surface?: TReqoreSurface,
  backgrounds?: TReqoreHexColor[]
): TReqoreHexColor =>
  getReadableThemeColor(theme, color, READABLE_TEXT_CONTRAST, surface, backgrounds);

/**
 * The colors of a gradient the text is drawn in (`background-clip: text`), each in the shade of it that reads on
 * what the text is drawn on: the letters are drawn in every one of them.
 */
export const getReadableTextGradient = (
  theme: IReqoreTheme,
  gradient: IReqoreEffectGradient,
  surface?: TReqoreSurface,
  backgrounds?: TReqoreHexColor[]
): IReqoreEffectGradient => {
  const colors =
    typeof gradient.colors === 'string'
      ? buildGradientColorsFromString(theme, gradient.colors)
      : gradient.colors;
  const under = backgrounds?.length ? backgrounds : [getThemeSurface(theme, surface)];

  return {
    ...gradient,
    colors: Object.fromEntries(
      Object.entries(colors || {}).map(([at, color]) => [
        at,
        getReadableAccentColorOn(
          getDrawnColor(getColorFromMaybeString(theme, color) || under[0], under[0]),
          under
        ),
      ])
    ),
  };
};

// Animate the gradient
const StyledGradientKeyframes = keyframes`
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
`;

export const normalizeGradients = (
  gradient?: IReqoreEffectGradient | IReqoreEffectGradient[]
): IReqoreEffectGradient[] => {
  if (!gradient) return [];
  return Array.isArray(gradient) ? gradient : [gradient];
};

/**
 * Returns the primary (first) gradient. Convenience for callers that only care
 * about a single gradient's stops/colors/animation — preserves pre-array
 * semantics.
 */
export const getPrimaryGradient = (
  gradient?: IReqoreEffectGradient | IReqoreEffectGradient[]
): IReqoreEffectGradient | undefined => normalizeGradients(gradient)[0];

/**
 * Returns a new gradient (or gradient list) with `patch` merged into the
 * primary entry. Use this when a consumer needs to override e.g. `borderColor`
 * from intent without losing the multi-gradient list shape.
 */
export const patchPrimaryGradient = (
  gradient: IReqoreEffectGradient | IReqoreEffectGradient[] | undefined,
  patch: Partial<IReqoreEffectGradient>
): IReqoreEffectGradient | IReqoreEffectGradient[] | undefined => {
  if (!gradient) return gradient;
  if (Array.isArray(gradient)) {
    if (gradient.length === 0) return gradient;
    return [{ ...gradient[0], ...patch }, ...gradient.slice(1)];
  }
  return { ...gradient, ...patch };
};

const buildGradientLayer = (
  g: IReqoreEffectGradient,
  colorString: string,
  box: 'padding-box' | 'border-box'
): string => {
  const type = g.type || 'linear';
  const directionOrShape =
    type === 'linear'
      ? g.direction || 'to right'
      : [g.shape || 'circle', g.size, g.direction || 'at center']
          .filter(Boolean)
          .join(' ');
  return `${type}-gradient(${directionOrShape}${colorString}) ${box}`;
};

/**
 * The `box-shadow` a (non-text) glow paints. Exported so a surface that needs
 * shadow layers of its own — an inset ring, a raised highlight — can compose
 * them with the glow in one declaration instead of overriding it. `opacity`
 * applies here as it does to a text glow.
 */
export const getGlowBoxShadow = (
  theme: IReqoreTheme,
  glow: NonNullable<IReqoreEffect['glow']>
): string =>
  normalizeGlows(glow)
    .map((g) => {
      const color = getColorFromMaybeString(theme, g.color);
      const painted = g.opacity !== undefined && g.opacity < 1 ? rgba(color, g.opacity) : color;

      // `size` 0 still means the default 2px spread, as it always has.
      // An offset is written only when set, so a centred glow is the same CSS as ever.
      const offset = (v?: number) => (v ? `${v}px` : '0');
      return `${g.inset ? 'inset ' : ''}${offset(g.x)} ${offset(g.y)} ${g.blur || 0}px ${
        g.size || 2
      }px ${painted}`;
    })
    .join(', ');

/** Every glow in `effect.glow`, whether it was given as one or as a list. */
export const normalizeGlows = (glow?: IReqoreEffectGlow | IReqoreEffectGlow[]): IReqoreEffectGlow[] => {
  if (!glow) return [];
  return Array.isArray(glow) ? glow : [glow];
};

/** The first glow: the one whose `when` triggers the list, and the one a text glow paints. */
export const getPrimaryGlow = (
  glow?: IReqoreEffectGlow | IReqoreEffectGlow[]
): IReqoreEffectGlow | undefined => normalizeGlows(glow)[0];

/**
 * `box-shadow` rules for a surface that paints shadow layers of its own (a
 * raised highlight, an inset ring, a floating lift) AND may carry an effect
 * glow. `StyledEffect` paints the glow as a `box-shadow` too, so the surface's
 * later declaration would win and the glow would never show — the two are
 * composed into one declaration instead, under the glow's own trigger state
 * when it has one. Shared by `ReqoreNavRail` and `ReqoreButtonRail`.
 */
export const withGlow = (theme: IReqoreTheme, effect: IReqoreEffect | undefined, own: string) => {
  const base = css`
    box-shadow: ${own};
  `;

  const primaryGlow = getPrimaryGlow(effect?.glow);

  if (!effect?.glow || !primaryGlow) {
    return base;
  }

  const both = css`
    box-shadow: ${getGlowBoxShadow(theme, effect.glow)}, ${own};
  `;

  switch (primaryGlow.when) {
    case 'hover':
      return css`
        ${base}
        &:hover {
          ${both}
        }
      `;
    case 'focus':
      return css`
        ${base}
        &:focus {
          ${both}
        }
      `;
    case 'active':
      return css`
        ${base}
        &:active {
          ${both}
        }
      `;
    default:
      return both;
  }
};

/**
 * Props every effect-based component styles itself with, and nothing it renders should get.
 * A DOM tag drops most of them on its own, but `color` is an HTML attribute, and a component
 * given as `as` (`animated.div`, re-resizable, a router link, react-aria's `DateInput`) receives
 * every prop and writes them onto its own element — `theme="[object Object]"` and the like.
 * Components built on `StyledEffect` inherit this filter (styled-components combines it with
 * their own `shouldForwardProp`).
 */
const REQORE_EFFECT_STYLE_PROPS = ['color', 'effect', 'intent', 'isText', 'theme'];

export const StyledEffect = styled.span.withConfig({
  shouldForwardProp: omitStyleProps(...REQORE_EFFECT_STYLE_PROPS),
})`
  // If gradient was supplied
  ${({
    effect,
    theme,
    minimal,
    active,
    transparent,
    isText,
    $surface,
    $backgrounds,
  }: IReqoreTextEffectProps) => {
    // text drawn in a gradient is drawn in colors that read
    const gradients = normalizeGradients(effect?.gradient).map((gradient) =>
      isText ? getReadableTextGradient(theme, gradient, $surface, $backgrounds) : gradient
    );
    if (!effect || gradients.length === 0) {
      return undefined;
    }

    // Build padding-box layers (the actual fill) for every gradient in the list.
    const paddingLayers: string[] = [];
    const paddingLayersActive: string[] = [];
    // `surface` on the first gradient: the ring is the gradient, the fill is a colour.
    const surfaceColor =
      !isText && gradients[0].surface && !gradients[0].borderColor
        ? getColorFromMaybeString(theme, gradients[0].surface)
        : undefined;

    gradients.forEach((g, index) => {
      if (index === 0 && surfaceColor) {
        const fill = `linear-gradient(${surfaceColor}, ${surfaceColor}) padding-box`;
        paddingLayers.push(fill);
        paddingLayersActive.push(fill);
        return;
      }

      const colors = createEffectGradient(
        theme,
        g.colors,
        // text is drawn in the colors made to read (`getReadableTextGradient`), not a minimal fill's step off them
        minimal && !isText ? 0.05 : 0,
        !isText && minimal && !active,
        false,
        transparent
      );
      const colorsActive = isText
        ? colors
        : createEffectGradient(theme, g.colors, 0.05, minimal, true, transparent);
      paddingLayers.push(buildGradientLayer(g, colors, 'padding-box'));
      paddingLayersActive.push(buildGradientLayer(g, colorsActive, 'padding-box'));
    });

    // The first gradient drives readable-text, animation, and border behaviour
    // (multi-gradient borders would visually fight each other; one is enough).
    const primary = gradients[0];

    // The text stands out from every color the primary gradient is drawn in (a translucent one over the theme),
    // hovered too when the effect answers the pointer - not from a mix of them, which none of it is drawn in.
    let readableColor: TReqoreHexColor | undefined;
    let readableHoverColor: TReqoreHexColor | undefined;
    let readableBackgrounds: TReqoreHexColor[] = [];
    if (!effect.color) {
      const under = getThemeSurface(theme, $surface);
      // every layer (the first is on top) drawn over the ones under it, each as each of its colors
      const layers = surfaceColor
        ? [[getColorFromMaybeString(theme, primary.surface!) as TReqoreHexColor]]
        : gradients.map((gradient) => getGradientColorList(theme, gradient.colors));
      const restStops = drawGradientLayers(layers, under);
      const activeStops = drawGradientLayers(layers, under, 0.05);

      // as it is drawn now: at rest, or lighter when active; hovered it is lighter, and gets its own
      readableBackgrounds = active ? activeStops : restStops;
      readableColor = readableBackgrounds.length
        ? getReadableColorOn(readableBackgrounds)
        : undefined;
      readableHoverColor =
        effect.interactive && activeStops.length ? getReadableColorOn(activeStops) : undefined;
    }

    let borderColor: string;
    let borderHoverColor: string;

    if (primary.borderColor) {
      borderColor = `${getColorFromMaybeString(theme, primary.borderColor)}`;
      borderHoverColor = `${changeLightness(
        getColorFromMaybeString(theme, primary.borderColor),
        0.15
      )}`;
    } else if (!isText) {
      borderColor = 'transparent';
      borderHoverColor = 'transparent';

      // A `surface` ring shows the gradient's own colours; the default ring is a
      // lighter echo of the fill it borders.
      const borderGradientColors: string = createEffectGradient(
        theme,
        primary.colors,
        surfaceColor ? 0 : 0.15,
        minimal
      );
      const borderGradientColorsActive: string = createEffectGradient(
        theme,
        primary.colors,
        surfaceColor ? 0.1 : 0.25,
        minimal
      );

      paddingLayers.push(buildGradientLayer(primary, borderGradientColors, 'border-box'));
      paddingLayersActive.push(
        buildGradientLayer(primary, borderGradientColorsActive, 'border-box')
      );
    }

    const gradient = paddingLayers.join(', ');
    const gradientActive = paddingLayersActive.join(', ');

    return css`
      background: ${active ? gradientActive : gradient};
      border-color: ${borderColor} !important;

      ${readableColor && !minimal && !transparent
        ? css`
            color: ${readableColor} !important;
            &::placeholder {
              color: ${getReadableFadedColor(readableColor, readableBackgrounds, 0.7)} !important;
            }
          `
        : undefined}

      ${primary.animate === 'always' || (primary.animate === 'active' && active)
        ? css`
            background-size: 200% 200%;
            animation: ${StyledGradientKeyframes} ${primary.animationSpeed || 2}s linear infinite;
          `
        : undefined}

      ${effect.interactive &&
      css`
        cursor: pointer;

        &:hover,
        &:focus,
        &:active {
          background: ${gradientActive};
          border-color: ${borderHoverColor} !important;
          ${readableHoverColor && !minimal && !transparent
            ? css`
                color: ${readableHoverColor} !important;
              `
            : undefined}

          ${primary.animate === 'hover' ||
          (primary.animate === 'active' && active) ||
          primary.animate === 'always'
            ? css`
                background-size: 200% 200%;
                animation: ${StyledGradientKeyframes} ${primary.animationSpeed || 2}s linear
                  infinite;
              `
            : undefined}
        }
      `}
    `;
  }}

  ${({ effect, theme, isText, $surface }: IReqoreTextEffectProps) => {
    const primaryGlow = getPrimaryGlow(effect?.glow);

    if (!effect || !effect.glow || !primaryGlow) {
      return undefined;
    }

    let glow;

    if (!isText) {
      glow = css`
        box-shadow: ${getGlowBoxShadow(theme, effect.glow)};
      `;
    } else {
      const color = getColorFromMaybeString(
        theme,
        primaryGlow.color === 'main' ? 'main:lighten:2' : primaryGlow.color
      );
      const blur = primaryGlow.blur || 0;
      const opacity = primaryGlow.opacity || 1;
      const halo = rgba(color, opacity);

      /* The letters sit in their glow, a halo of its color right around them, and are drawn in the color that
         reads on it - a light glow's letters dark. A halo in the letters' own color around them hid them (white
         letters in a white halo inside a red glow: 3.85:1). */
      glow = css`
        color: ${getReadableColorFrom(halo, false, undefined, undefined, getThemeSurface(theme, $surface))};
        text-shadow: 0 0 ${blur}px ${halo}, 0 0 ${blur + 5}px ${halo}, 0 0 ${blur + 10}px ${halo},
          0 0 1px ${halo}, 0 0 2px ${halo}, 0 0 3px ${halo};
      `;
    }

    if (primaryGlow.when === 'always' || !primaryGlow.when) {
      return glow;
    }

    if (primaryGlow.when === 'hover') {
      return css`
        &:hover {
          ${glow}
        }
      `;
    }

    if (primaryGlow.when === 'focus') {
      return css`
        &:focus {
          ${glow}
        }
      `;
    }

    if (primaryGlow.when === 'active') {
      return css`
        &:active {
          ${glow}
        }
      `;
    }
  }}

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.spaced
      ? css`
          letter-spacing: ${effect.spaced}px;
        `
      : undefined}

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.uppercase
      ? css`
          text-transform: uppercase;
        `
      : undefined}

  ${({ effect }: IReqoreTextEffectProps) => {
    if (!effect || !effect.weight) {
      return undefined;
    }

    const weight =
      typeof effect.weight === 'number' ? effect.weight : WEIGHT_TO_NUMBER[effect.weight];

    return css`
      font-weight: ${weight} !important;
    `;
  }}

${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.italic
      ? css`
          font-style: italic;
        `
      : undefined}

${({ effect }: IReqoreTextEffectProps) =>
    effect?.underline
      ? css`
          text-decoration: ${typeof effect.underline === 'string' ? effect.underline : 'underline'};
        `
      : undefined}

${({ effect }: IReqoreTextEffectProps) =>
    effect?.lineThrough
      ? css`
          text-decoration: ${typeof effect.lineThrough === 'string'
            ? effect.lineThrough
            : '2px solid line-through'};
        `
      : undefined}

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.noWrap
      ? css`
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        `
      : undefined}

  ${({ effect, theme, $surface, $backgrounds }: IReqoreTextEffectProps) =>
    effect && effect.color
      ? css`
          color: ${getEffectTextColor(theme, effect.color, $surface, $backgrounds)} !important;
        `
      : undefined}

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.fontFamily
      ? css`
          font-family: ${getFontFamily(effect.fontFamily)} !important;
        `
      : undefined}

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.borderStyle
      ? css`
          border-style: ${effect.borderStyle} !important;
        `
      : undefined}

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.textSize
      ? css`
          font-size: ${isStringSize(effect.textSize)
            ? `${TEXT_FROM_SIZE[effect.textSize]}px`
            : effect.textSize} !important;
        `
      : undefined}

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.textAlign
      ? css`
          width: 100%;
          text-align: ${effect.textAlign};
        `
      : undefined}

  ${({ effect }) =>
    effect &&
    effect.grayscale &&
    css`
      filter: grayscale(100%);
    `};
  ${({ effect }) =>
    effect &&
    effect.blur &&
    css`
      filter: blur(${effect.blur}px);
    `};
  ${({ effect }) =>
    effect &&
    effect.backgroundBlur &&
    css`
      backdrop-filter: blur(${effect.backgroundBlur}px);
      -webkit-backdrop-filter: blur(${effect.backgroundBlur}px);
    `};
  ${({ effect }) =>
    effect &&
    effect.sepia &&
    css`
      filter: sepia(100%);
    `};
  ${({ effect }) =>
    effect &&
    effect.invert &&
    css`
      filter: invert(100%);
    `};
  ${({ effect }) =>
    effect && (effect.opacity || effect.opacity === 0)
      ? css`
          opacity: ${effect.opacity};
        `
      : undefined};
  ${({ effect }) =>
    effect &&
    effect.brightness &&
    css`
      filter: brightness(${effect.brightness}%);
    `};
  ${({ effect }) =>
    effect &&
    effect.contrast &&
    css`
      filter: contrast(${effect.contrast}%);
    `};
  ${({ effect }) =>
    effect &&
    effect.saturate &&
    css`
      filter: saturate(${effect.saturate}%);
    `};
`;

// `attrs` only needs to add `isText` — styled-components already forwards all
// other props. Spreading `...props` here re-injects `className`, which styled-
// components then concatenates on top of the prop className, duplicating any
// custom class (e.g. `reqore-link` / `reqore-span`) on every text-effect element.
//
// `inline` and `block` pick the display below. Neither is the element's: a `p` or `span` drops
// them, but a component given as `as` would write them onto its own element.
export const StyledTextEffect = styled(StyledEffect)
  .withConfig({ shouldForwardProp: omitStyleProps('block', 'inline') })
  .attrs({ isText: true })`
  display: ${({ inline, block }) => (inline ? 'inline' : block ? 'block' : 'inline-block')};

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.gradient
      ? css`
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        `
      : undefined}

  ${({ effect, theme, $surface, $backgrounds }: IReqoreTextEffectProps) => {
    if (!effect?.frost) {
      return undefined;
    }

    const frost = typeof effect.frost === 'boolean' ? {} : effect.frost;
    // a theme's color in a shade that reads where the text is drawn (any other color as given)
    const color = getReadableThemeColor(
      theme,
      frost.color || 'main:lighten:8',
      READABLE_TEXT_CONTRAST,
      $surface,
      $backgrounds
    );
    const under = $backgrounds?.length ? $backgrounds : getThemeSurfaces(theme, $surface);
    // the frost fades the letters toward their foot, but only as far as they stay readable
    const opacity = getReadableAlpha(
      color,
      under,
      (frost.opacity ?? 0.72) * 0.52
    ) / 0.52;
    const shadowOpacity = frost.shadowOpacity ?? 0.28;
    const blur = frost.blur ?? 0.4;

    return css`
      color: transparent !important;
      background: linear-gradient(
        180deg,
        ${rgba(color, Math.min(opacity + 0.18, 1))},
        ${rgba(color, opacity * 0.52)}
      );
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      text-shadow:
        0 1px 0 ${rgba(Colors.LIGHT, shadowOpacity)},
        0 -1px 0 ${rgba(Colors.DARK, shadowOpacity * 0.7)},
        0 0 ${blur}px ${rgba(color, shadowOpacity)};
    `;
  }}
`;

export const ReqoreEffect = ({ children, ...rest }: IReqoreTextEffectProps) => {
  return (
    <StyledEffect className='reqore-effect' {...rest}>
      {children}
    </StyledEffect>
  );
};

export const ReqoreTextEffect = ({ children, className, ...rest }: IReqoreTextEffectProps) => {
  return (
    <StyledTextEffect className={`${className || ''} reqore-text-effect`} {...rest}>
      {children}
    </StyledTextEffect>
  );
};
