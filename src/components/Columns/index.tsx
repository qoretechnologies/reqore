import classNames from 'classnames';
import { memo } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';

export interface IReqoreColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  minColumnWidth?: string;
  maxColumnWidth?: string;
  columns?: number | 'auto-fit' | 'auto-fill';
  columnsGap?: string;
  className?: string;
  alignItems?: string;
}

export interface IStyledColumns extends IReqoreColumnsProps {
  theme?: IReqoreTheme;
  $minColumnWidth?: string;
  $maxColumnWidth?: string;
  $columns?: number | 'auto-fit' | 'auto-fill';
  $columnsGap?: string;
  $alignItems?: string;
}

export const StyledColumns = styled.div<IStyledColumns>`
  display: grid;
  ${({
    $minColumnWidth = '300px',
    $maxColumnWidth = '1fr',
    $columns = 'auto-fit',
    $columnsGap,
    $alignItems = 'normal',
  }: IStyledColumns) => css`
    grid-template-columns: repeat(${$columns}, minmax(${$minColumnWidth}, ${$maxColumnWidth}));
    grid-auto-rows: max-content;
    grid-gap: ${$columnsGap};
    align-items: ${$alignItems};
  `}
`;

export const ReqoreColumns = memo(({ children, className, ...rest }: IReqoreColumnsProps) => {
  return (
    <StyledColumns 
      className={classNames('reqore-columns', className)}
      $minColumnWidth={rest.minColumnWidth}
      $maxColumnWidth={rest.maxColumnWidth}
      $columns={rest.columns}
      $columnsGap={rest.columnsGap}
      $alignItems={rest.alignItems}
    >
      {children}
    </StyledColumns>
  );
});
