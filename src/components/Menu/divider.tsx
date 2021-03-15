import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';

const StyledMenuDivider = styled.div<{ theme: IReqoreTheme }>`
  width: 100%;
  padding: 3px 0;
  background-color: transparent;
  font-size: 11px;
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 2px;
  font-weight: 600;

  color: ${({ theme }) => getReadableColor(theme, undefined, undefined)};
`;

const ReqoreMenuDivider = forwardRef(
  ({ label }: { label?: string }, ref: any) => (
    <StyledMenuDivider className='reqore-menu-divider' ref={ref}>
      {label}
    </StyledMenuDivider>
  )
);

export default ReqoreMenuDivider;
