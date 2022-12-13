import { reduce } from 'lodash';
import styled, { css } from 'styled-components';
import { TEXT_FROM_SIZE, TSizes, WEIGHT_TO_NUMBER } from '../../constants/sizes';
import { changeDarkness } from '../../helpers/colors';

export interface IReqoreEffect {
  gradient?: {
    type?: 'linear' | 'radial';
    shape?: 'circle' | 'ellipse';
    colors: { [key: number]: string };
    direction?: string;
  };
  noWrap?: boolean;
  color?: string;
  spaced?: number;
  weight?: number | 'thin' | 'light' | 'normal' | 'bold' | 'thick';
  uppercase?: boolean;
  textSize?: TSizes;
  textAlign?: 'left' | 'center' | 'right';
}

export interface IReqoreTextEffectProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  effect: IReqoreEffect;
  as?: React.ElementType;
}

export const StyledEffect = styled.span`
  // If gradient was supplied
  ${({ effect }: IReqoreTextEffectProps) => {
    if (!effect || !effect.gradient) {
      return undefined;
    }

    const gradientType: string = effect.gradient.type || 'linear';
    const gradientColors = reduce(
      effect.gradient.colors,
      (colorsString, color, percentage) => `${colorsString}, ${color} ${percentage}%`,
      ''
    );
    const gradientDirectionOrShape =
      gradientType === 'linear'
        ? effect.gradient.direction || 'to right'
        : effect.gradient.shape || 'circle';
    const gradient = `${gradientType}-gradient(${gradientDirectionOrShape}${gradientColors})`;

    return css`
      background-image: ${gradient};
      // Get the first color from the colors object
      border-color: ${changeDarkness(Object.values(effect.gradient.colors)[0], 0.05)} !important;
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

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.color
      ? css`
          color: ${effect.color} !important;
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
          text-align: ${effect.textAlign};
        `
      : undefined}
`;

export const StyledTextEffect = styled(StyledEffect)`
  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.gradient
      ? css`
          display: inline-block;
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
