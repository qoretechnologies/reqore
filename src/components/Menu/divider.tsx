import React, { forwardRef, useMemo } from 'react';
import { css } from 'styled-components';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { useReqoreSurface } from '../../context/SurfaceContext';
import { getReadableTextOn, getThemeSurfaces } from '../../helpers/colors';
import styled, { omitStyleProps } from '../../helpers/styled';
import { getOneLessSize, isStringSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IWithReqoreEffect, IWithReqoreSize } from '../../types/global';
import { IReqoreEffect, StyledTextEffect, TReqoreHexColor } from '../Effect';
import { ReqoreVerticalSpacer } from '../Spacer';

export interface IReqoreMenuDividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    IWithReqoreEffect,
    IWithReqoreSize {
  label?: string | number;
  margin?: 'left' | 'right' | 'both' | 'none';
  align?: 'left' | 'center' | 'right';
  padded?: 'top' | 'bottom' | 'both' | 'none';
  line?: boolean;
}

// A menu hands every child its `wrap`; the divider has no text to wrap, and a `div` would
// keep the attribute.
export const StyledMenuDivider = styled(StyledTextEffect).withConfig({
  shouldForwardProp: omitStyleProps('wrap'),
})`
  width: 100%;
  padding: 0;
  padding-top: ${({ padded, size }) =>
    padded === 'top' || padded === 'both' ? `${PADDING_FROM_SIZE[size]}px` : undefined};
  padding-bottom: ${({ padded, size }) =>
    padded === 'bottom' || padded === 'both' ? `${PADDING_FROM_SIZE[size]}px` : undefined};
  background-color: transparent;

  ${({ margin, size }) =>
    margin &&
    css`
      margin-left: ${margin === 'left' || margin === 'both'
        ? isStringSize(size)
          ? `${PADDING_FROM_SIZE[size]}px`
          : '10px'
        : undefined};
      margin-right: ${margin === 'right' || margin === 'both'
        ? isStringSize(size)
          ? `${PADDING_FROM_SIZE[size]}px`
          : '10px'
        : undefined};
    `}

  color: ${({ theme, $backgrounds }: { theme: IReqoreTheme; $backgrounds?: TReqoreHexColor[] }) =>
    getReadableTextOn(theme, $backgrounds || [], false)};
`;

const ReqoreMenuDivider = forwardRef<HTMLDivElement, IReqoreMenuDividerProps>(
  (
    {
      label,
      className,
      effect,
      size = 'normal',
      align = 'center',
      padded = 'both',
      line,
      ...rest
    }: IReqoreMenuDividerProps,
    ref: any
  ) => {
    const theme = useReqoreTheme();
    const around = useReqoreSurface();
    const surfaces = useMemo(() => getThemeSurfaces(theme, around), [theme, around]);

    return line ? (
      <ReqoreVerticalSpacer
        className={`${className || ''} reqore-menu-divider`}
        height={PADDING_FROM_SIZE[size]}
        lineSize={size}
      />
    ) : (
      <StyledMenuDivider
        as='div'
        {...rest}
        padded={padded}
        size={size}
        // what the menu is drawn in: the label, or the gradient it is drawn in, reads on it
        $backgrounds={surfaces}
        className={`${className || ''} reqore-menu-divider`}
        ref={ref}
        effect={
          {
            uppercase: true,
            spaced: 2,
            textAlign: align,
            textSize: getOneLessSize(size),
            weight: 'bold',
            ...effect,
          } as IReqoreEffect
        }
      >
        {label}
      </StyledMenuDivider>
    );
  }
);

export default ReqoreMenuDivider;
