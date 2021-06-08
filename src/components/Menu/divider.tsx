import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';

export interface IReqoreMenuDividerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

const StyledMenuDivider = styled.div<{ theme: IReqoreTheme }>`
  width: 100%;
  padding: 8px 0;
  background-color: ${({ theme }) => theme.main};
  font-size: 11px;
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 2px;
  font-weight: 600;

  color: ${({ theme }) => getReadableColor(theme, undefined, undefined)};
`;

const ReqoreMenuDivider = forwardRef(
  ({ label, className, ...rest }: IReqoreMenuDividerProps, ref: any) => (
    <StyledMenuDivider
      {...rest}
      className={`${className || ''} reqore-menu-divider`}
      ref={ref}
    >
      {label}
    </StyledMenuDivider>
  )
);

export default ReqoreMenuDivider;
