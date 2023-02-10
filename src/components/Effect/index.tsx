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
export type TReqoreEffectColorManipulationMultiplier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type TReqoreHexColor = `#${string}`;
export type TReqoreColor = TReqoreHexColor | 'transparent';
export type TReqoreEffectColor =
  | TReqoreColor
  | TReqoreIntent
  | `${TReqoreIntent}:${TReqoreEffectColorManipulation}`
  | `${TReqoreIntent}:${TReqoreEffectColorManipulation}:${TReqoreEffectColorManipulationMultiplier}`
  | 'main'
  | `main:${TReqoreEffectColorManipulation}`
  | `main:${TReqoreEffectColorManipulation}:${TReqoreEffectColorManipulationMultiplier}`
  | `${TReqoreHexColor}:${TReqoreEffectColorManipulation}`
  | `${TReqoreHexColor}:${TReqoreEffectColorManipulation}:${TReqoreEffectColorManipulationMultiplier}`;
export type TReqoreEffectColorList = [
  'main' | TReqoreIntent | TReqoreColor,
  TReqoreEffectColorManipulation | undefined,
  TReqoreEffectColorManipulationMultiplier | undefined
];
export type TReqoreEffectGradientColors =
  | 'main'
  | TReqoreIntent
  | TReqoreHexColor
  | TReqoreEffectGradientColorsObject;
export type TReqoreEffectGradientColorsObject = Record<number, TReqoreEffectColor>;
export type TReqoreEffectGradientAnimationTrigger = 'always' | 'hover' | 'active' | 'never';

export interface IReqoreEffectFilters {
  grayscale?: boolean;
  blur?: number;
  sepia?: boolean;
  invert?: boolean;
  opacity?: number;
  brightness?: number;
  contrast?: number;
  saturate?: number;
}

export interface IReqoreEffect extends IReqoreEffectFilters {
  gradient?: {
    type?: 'linear' | 'radial';
    shape?: 'circle' | 'ellipse';
    colors: TReqoreEffectGradientColors;
    direction?: string;
    borderColor?: TReqoreEffectColor;
    animate?: TReqoreEffectGradientAnimationTrigger;
    animationSpeed?: 1 | 2 | 3 | 4 | 5;
  };
  noWrap?: boolean;
  color?: TReqoreEffectColor;
  spaced?: number;
  weight?: number | 'thin' | 'light' | 'normal' | 'bold' | 'thick';
  uppercase?: boolean;
  textSize?: TSizes | string;
  textAlign?: 'left' | 'center' | 'right';
  glow?: {
    size?: number;
    color: TReqoreEffectColor;
    inset?: boolean;
    blur?: number;
  };
  interactive?: boolean;
}

export interface IReqoreTextEffectProps
  extends HTMLAttributes<HTMLSpanElement>,
    IWithReqoreMinimal {
  children: React.ReactNode;
  effect: IReqoreEffect;
  as?: React.ElementType;
  theme?: IReqoreTheme;
  active?: boolean;
  isText?: boolean;
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

export const StyledEffect = styled.span`
  // If gradient was supplied
  ${({ effect, theme, minimal, active, isText }: IReqoreTextEffectProps) => {
    if (!effect || !effect.gradient) {
      return undefined;
    }

    const gradientType: string = effect.gradient.type || 'linear';
    const gradientColors = createEffectGradient(
      theme,
      effect.gradient.colors,
      minimal ? 0.05 : 0,
      !isText && minimal && !active
    );
    const gradientColorsActive = createEffectGradient(
      theme,
      effect.gradient.colors,
      0.05,
      minimal,
      true
    );

    const gradientDirectionOrShape =
      gradientType === 'linear'
        ? effect.gradient.direction || 'to right'
        : `${effect.gradient.shape || 'circle'} ${effect.gradient.direction || 'at center'}`;
    let gradient = `${gradientType}-gradient(${gradientDirectionOrShape}${gradientColors}) padding-box`;
    let gradientActive = `${gradientType}-gradient(${gradientDirectionOrShape}${gradientColorsActive}) padding-box`;

    // Determine the text color based on the gradient colors
    let color: TReqoreHexColor | undefined;
    // Only works if there are 2 colors not more and color was not provided
    if (!effect.color) {
      color = getGradientMix(theme, effect.gradient.colors);
    }

    let borderColor: string;
    let borderHoverColor: string;

    // The user provided a border color - we will use that
    if (effect.gradient.borderColor) {
      borderColor = `${getColorFromMaybeString(theme, effect.gradient.borderColor)}`;
      borderHoverColor = `${changeLightness(
        getColorFromMaybeString(theme, effect.gradient.borderColor),
        0.15
      )}`;
    } else if (!isText) {
      // We will use border-image and create a gradient border
      borderColor = 'transparent';
      borderHoverColor = 'transparent';

      const borderGradientColors: string = createEffectGradient(
        theme,
        effect.gradient.colors,
        0.15
      );
      const borderGradientColorsActive: string = createEffectGradient(
        theme,
        effect.gradient.colors,
        0.25
      );

      gradient = `${gradient}, ${gradientType}-gradient(${gradientDirectionOrShape}${borderGradientColors}) border-box`;
      gradientActive = `${gradientActive}, ${gradientType}-gradient(${gradientDirectionOrShape}${borderGradientColorsActive}) border-box`;
    }

    return css`
      background: ${active ? gradientActive : gradient};
      border-color: ${borderColor} !important;

      ${color && !minimal
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

      ${effect.gradient.animate === 'always' || (effect.gradient.animate === 'active' && active)
        ? css`
            background-size: 200% 200%;
            animation: ${StyledGradientKeyframes} ${effect.gradient.animationSpeed || 2}s linear
              infinite;
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

          ${effect.gradient.animate === 'hover' ||
          (effect.gradient.animate === 'active' && active) ||
          effect.gradient.animate === 'always'
            ? css`
                background-size: 200% 200%;
                animation: ${StyledGradientKeyframes} ${effect.gradient.animationSpeed || 2}s linear
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

    if (!isText) {
      return css`
        box-shadow: ${effect.glow.inset ? 'inset ' : ''} 0 0 ${effect.glow.blur || 0}px
          ${effect.glow.size || 2}px ${getColorFromMaybeString(theme, effect.glow.color)};
      `;
    }

    const color = getColorFromMaybeString(
      theme,
      effect.glow.color === 'main' ? 'main:lighten:2' : effect.glow.color
    );
    const blur = effect.glow.blur || 0;

    return css`
      color: ${Colors.LIGHT};
      text-shadow: 0 0 ${blur}px ${color}, 0 0 ${blur + 5}px ${color}, 0 0 ${blur + 10}px ${color},
        0 0 1px ${getReadableColorFrom(color)}, 0 0 2px ${getReadableColorFrom(color)},
        0 0 3px ${getReadableColorFrom(color)};
    `;
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
    effect && effect.noWrap
      ? css`
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          min-width: 30px;
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
  display: inline-block;

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.gradient
      ? css`
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        `
      : undefined}
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
