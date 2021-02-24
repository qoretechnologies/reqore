import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import usePopover from '../../hooks/usePopover';

export interface IReqoreTableCellProps
  extends React.HTMLAttributes<HTMLTableCellElement> {
  children: any;
  colspan?: number;
  tooltip?: string;
  width?: number;
}

export interface IReqoreTableCellStyle {
  theme: IReqoreTheme;
  width?: number;
}

const StyledTableCell = styled.td<IReqoreTableCellStyle>`
  ${({ width }) => css`
    width: ${width ? `${width}px` : 'auto'};
    padding: 5px 10px;
    height: 40px;
  `}
`;

const ReqoreTableCell = ({
  colspan,
  className,
  children,
  width,
  tooltip,
  ...rest
}: IReqoreTableCellProps) => {
  const [ref, setRef] = useState(null);

  usePopover(ref, tooltip, undefined, undefined, !!tooltip);

  return (
    <ReqoreThemeProvider>
      <StyledTableCell
        {...rest}
        width={width}
        ref={setRef}
        colSpan={colspan}
        className={`${className || ''} reqore-table-cell`}
      >
        {children}
      </StyledTableCell>
    </ReqoreThemeProvider>
  );
};

export default ReqoreTableCell;
