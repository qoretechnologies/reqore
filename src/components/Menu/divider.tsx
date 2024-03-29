import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import { getReadableColor } from '../../helpers/colors';
import { getOneLessSize, isStringSize } from '../../helpers/utils';
import { IWithReqoreEffect, IWithReqoreSize } from '../../types/global';
import { IReqoreEffect, StyledTextEffect } from '../Effect';
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

export const StyledMenuDivider = styled(StyledTextEffect)`
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

  color: ${({ theme }) => getReadableColor(theme, undefined, undefined)};
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
  ) =>
    line ? (
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
    )
);

export default ReqoreMenuDivider;
