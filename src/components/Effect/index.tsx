import { rgba } from 'polished';
import { HTMLAttributes } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Colors } from '../../constants/colors';
import { TEXT_FROM_SIZE, TSizes, WEIGHT_TO_NUMBER } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeLightness,
  createEffectGradient,
  getColorFromMaybeString,
  getGradientMix,
  getReadableColorFrom,
} from '../../helpers/colors';
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
export type TReqoreEffectColor =
  | (TReqoreColor | TReqoreHexColor | 'main' | TReqoreIntent)
  | `${TReqoreIntent | 'main' | TReqoreHexColor}:${TReqoreEffectColorManipulation}`
  | `${
      | TReqoreIntent
      | 'main'
      | TReqoreHexColor}:${TReqoreEffectColorManipulation}:${TReqoreEffectColorManipulationMultiplier}`
  | `${
      | TReqoreIntent
      | 'main'
      | TReqoreHexColor}:${TReqoreEffectColorManipulation}:${TReqoreEffectColorManipulationMultiplier}:${TReqoreEffectColorManipulationAlpha}`;
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
  animate?: TReqoreEffectGradientAnimationTrigger;
  animationSpeed?: 1 | 2 | 3 | 4 | 5;
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
  textSize?: TSizes | string;
  textAlign?: 'left' | 'center' | 'right';
  glow?: {
    size?: number;
    color: TReqoreEffectColor;
    inset?: boolean;
    blur?: number;
    opacity?: number;
    when?: 'always' | 'hover' | 'focus' | 'active';
  };
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
}

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

export const StyledEffect = styled.span`
  // If gradient was supplied
  ${({ effect, theme, minimal, active, transparent, isText }: IReqoreTextEffectProps) => {
    const gradients = normalizeGradients(effect?.gradient);
    if (!effect || gradients.length === 0) {
      return undefined;
    }

    // Build padding-box layers (the actual fill) for every gradient in the list.
    const paddingLayers: string[] = [];
    const paddingLayersActive: string[] = [];
    gradients.forEach((g) => {
      const colors = createEffectGradient(
        theme,
        g.colors,
        minimal ? 0.05 : 0,
        !isText && minimal && !active,
        false,
        transparent
      );
      const colorsActive = createEffectGradient(
        theme,
        g.colors,
        0.05,
        minimal,
        true,
        transparent
      );
      paddingLayers.push(buildGradientLayer(g, colors, 'padding-box'));
      paddingLayersActive.push(buildGradientLayer(g, colorsActive, 'padding-box'));
    });

    // The first gradient drives readable-text, animation, and border behaviour
    // (multi-gradient borders would visually fight each other; one is enough).
    const primary = gradients[0];

    // Determine the text color based on the primary gradient
    let color: TReqoreHexColor | undefined;
    if (!effect.color) {
      color = getGradientMix(theme, primary.colors);
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

      const borderGradientColors: string = createEffectGradient(
        theme,
        primary.colors,
        0.15,
        minimal
      );
      const borderGradientColorsActive: string = createEffectGradient(
        theme,
        primary.colors,
        0.25,
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

      ${color && !minimal && !transparent
        ? css`
            color: ${getReadableColorFrom(getColorFromMaybeString(theme, color), false)} !important;
            &::placeholder {
              color: ${rgba(
                getReadableColorFrom(getColorFromMaybeString(theme, color), false),
                0.7
              )} !important;
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

  ${({ effect, theme, isText }: IReqoreTextEffectProps) => {
    if (!effect || !effect.glow) {
      return undefined;
    }

    let glow;

    if (!isText) {
      glow = css`
        box-shadow: ${effect.glow.inset ? 'inset ' : ''} 0 0 ${effect.glow.blur || 0}px
          ${effect.glow.size || 2}px ${getColorFromMaybeString(theme, effect.glow.color)};
      `;
    } else {
      const color = getColorFromMaybeString(
        theme,
        effect.glow.color === 'main' ? 'main:lighten:2' : effect.glow.color
      );
      const blur = effect.glow.blur || 0;
      const opacity = effect.glow.opacity || 1;

      glow = css`
        color: ${Colors.LIGHT};
        text-shadow: 0 0 ${blur}px ${rgba(color, opacity)},
          0 0 ${blur + 5}px ${rgba(color, opacity)}, 0 0 ${blur + 10}px ${rgba(color, opacity)},
          0 0 1px ${rgba(getReadableColorFrom(color), opacity)},
          0 0 2px ${rgba(getReadableColorFrom(color), opacity)},
          0 0 3px ${rgba(getReadableColorFrom(color), opacity)};
      `;
    }

    if (effect.glow.when === 'always' || !effect.glow.when) {
      return glow;
    }

    if (effect.glow.when === 'hover') {
      return css`
        &:hover {
          ${glow}
        }
      `;
    }

    if (effect.glow.when === 'focus') {
      return css`
        &:focus {
          ${glow}
        }
      `;
    }

    if (effect.glow.when === 'active') {
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

  ${({ effect, theme }: IReqoreTextEffectProps) =>
    effect && effect.color
      ? css`
          color: ${getColorFromMaybeString(theme, effect.color)} !important;
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

export const StyledTextEffect = styled(StyledEffect).attrs((props) => ({ ...props, isText: true }))`
  display: ${({ inline, block }) => (inline ? 'inline' : block ? 'block' : 'inline-block')};

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.gradient
      ? css`
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        `
      : undefined}

  ${({ effect, theme }: IReqoreTextEffectProps) => {
    if (!effect?.frost) {
      return undefined;
    }

    const frost = typeof effect.frost === 'boolean' ? {} : effect.frost;
    const color = getColorFromMaybeString(theme, frost.color || 'main:lighten:8');
    const opacity = frost.opacity ?? 0.72;
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
