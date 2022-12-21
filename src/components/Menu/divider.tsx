import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import { getReadableColor } from '../../helpers/colors';
import { IWithReqoreEffect, IWithReqoreSize } from '../../types/global';
import { IReqoreEffect, StyledTextEffect } from '../Effect';

export interface IReqoreMenuDividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreEffect,
    IWithReqoreSize {
  label?: string;
}

const StyledMenuDivider = styled(StyledTextEffect)`
  width: 100%;
  padding: ${({ size }) => `${PADDING_FROM_SIZE[size]}px 0`};
  background-color: ${({ theme }) => theme.main};

  color: ${({ theme }) => getReadableColor(theme, undefined, undefined)};
`;

const ReqoreMenuDivider = forwardRef<HTMLDivElement, IReqoreMenuDividerProps>(
  ({ label, className, effect, size = 'normal', ...rest }: IReqoreMenuDividerProps, ref: any) => (
    <StyledMenuDivider
      as='div'
      {...rest}
      size={size}
      className={`${className || ''} reqore-menu-divider`}
      ref={ref}
      effect={
        {
          uppercase: true,
          spaced: 2,
          textAlign: 'center',
          textSize: 'small',
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
