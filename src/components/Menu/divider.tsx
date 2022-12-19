import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { getReadableColor } from '../../helpers/colors';
import { IWithReqoreEffect } from '../../types/global';
import { IReqoreEffect, StyledTextEffect } from '../Effect';

export interface IReqoreMenuDividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreEffect {
  label?: string;
}

const StyledMenuDivider = styled(StyledTextEffect)`
  width: 100%;
  padding: 8px 0;
  background-color: ${({ theme }) => theme.main};

  color: ${({ theme }) => getReadableColor(theme, undefined, undefined)};
`;

const ReqoreMenuDivider = forwardRef(
  ({ label, className, effect, ...rest }: IReqoreMenuDividerProps, ref: any) => (
    <StyledMenuDivider
      as='div'
      {...rest}
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
