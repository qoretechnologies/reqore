import { rgba } from 'polished';
import { HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { TEXT_FROM_SIZE, TSizes, WEIGHT_TO_NUMBER } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeLightness,
  createEffectGradient,
  getColorFromMaybeString,
  getGradientMix,
  getReadableColorFrom,
} from '../../helpers/colors';
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
  | `main:${TReqoreEffectColorManipulation}:${TReqoreEffectColorManipulationMultiplier}`;
export type TReqoreEffectColorList = [
  'main' | TReqoreIntent | TReqoreColor,
  TReqoreEffectColorManipulation | undefined,
  TReqoreEffectColorManipulationMultiplier | undefined
];

export interface IReqoreEffect {
  gradient?: {
    type?: 'linear' | 'radial';
    shape?: 'circle' | 'ellipse';
    colors: Record<number, TReqoreEffectColor>;
    direction?: string;
    borderColor?: TReqoreEffectColor;
  };
  noWrap?: boolean;
  color?: TReqoreEffectColor;
  spaced?: number;
  weight?: number | 'thin' | 'light' | 'normal' | 'bold' | 'thick';
  uppercase?: boolean;
  textSize?: TSizes;
  textAlign?: 'left' | 'center' | 'right';
  glow?: {
    size?: number;
    color: TReqoreEffectColor;
    inset?: boolean;
    blur?: number;
    useBorder?: boolean;
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
}

export const StyledEffect = styled.span`
  transition: all 0.2s ease-in-out;

  // If gradient was supplied
  ${({ effect, theme, minimal, active }: IReqoreTextEffectProps) => {
    if (!effect || !effect.gradient) {
      return undefined;
    }

    const gradientType: string = effect.gradient.type || 'linear';
    const gradientColors = createEffectGradient(
      theme,
      effect.gradient.colors,
      0,
      minimal && !active
    );
    const gradientColorsActive = createEffectGradient(theme, effect.gradient.colors, 0.05);

    const gradientDirectionOrShape =
      gradientType === 'linear'
        ? effect.gradient.direction || 'to right'
        : effect.gradient.shape || 'circle';
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
    } else {
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

      ${color &&
      css`
        color: ${getReadableColorFrom(getColorFromMaybeString(theme, color), false)} !important;
        &::placeholder {
          color: ${rgba(
            getReadableColorFrom(getColorFromMaybeString(theme, color), false),
            0.7
          )} !important;
        }
      `}

      ${effect.interactive &&
      css`
        cursor: pointer;

        &:hover,
        &:focus,
        &:active {
          background: ${gradientActive};
          border-color: ${borderHoverColor} !important;
        }
      `}
    `;
  }}

  ${({ effect, theme }: IReqoreTextEffectProps) => {
    if (!effect || !effect.glow) {
      return undefined;
    }

    if (effect.glow.useBorder) {
      return css`
        border: ${effect.glow.size || 2}px solid
          ${getColorFromMaybeString(theme, effect.glow.color)} !important;
      `;
    }

    return css`
      box-shadow: ${effect.glow.inset ? 'inset ' : ''} 0 0 ${effect.glow.blur || 0}px
        ${effect.glow.size || 2}px ${getColorFromMaybeString(theme, effect.glow.color)};
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
          font-size: ${TEXT_FROM_SIZE[effect.textSize]}px !important;
        `
      : undefined}

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.textAlign
      ? css`
          width: 100%;
          text-align: ${effect.textAlign};
        `
      : undefined}
`;

export const StyledTextEffect = styled(StyledEffect)`
  display: inline-block;

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.gradient
      ? css`
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
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

export const ReqoreTextEffect = ({ children, ...rest }: IReqoreTextEffectProps) => {
  return (
    <StyledTextEffect className='reqore-text-effect' {...rest}>
      {children}
    </StyledTextEffect>
  );
};
