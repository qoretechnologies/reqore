import classNames from 'classnames';
import { memo } from 'react';
import { css } from 'styled-components';
import styled from '../../helpers/styled';
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
}

/** The track sizes a column's minimum may be that are not lengths, and cannot be compared with one. */
const KEYWORD_TRACK_SIZE = /^(auto|min-content|max-content|fit-content\(.*\))$/;

/**
 * A column's minimum, never more than the container: `minmax(400px, 1fr)` laid a 400px column out in a 342px
 * dialog on a phone, its cards running past the dialog (qorus#646). The width is the narrowest a column is where
 * the container has room for it, not a width it keeps where there is less. A keyword (`auto`, `min-content`, ...)
 * is kept as it is: it already sizes to what is there.
 */
export const getColumnMinimum = (width: string): string =>
  KEYWORD_TRACK_SIZE.test(width.trim()) ? width : `min(${width}, 100%)`;

export const StyledColumns = styled.div<IStyledColumns>`
  display: grid;
  ${({
    minColumnWidth = '300px',
    maxColumnWidth = '1fr',
    columns = 'auto-fit',
    columnsGap,
    alignItems = 'normal',
  }: IStyledColumns) => css`
    grid-template-columns: repeat(
      ${columns},
      minmax(${getColumnMinimum(minColumnWidth)}, ${maxColumnWidth})
    );
    grid-auto-rows: max-content;
    grid-gap: ${columnsGap};
    align-items: ${alignItems};
  `}
`;

export const ReqoreColumns = memo(({ children, className, ...rest }: IReqoreColumnsProps) => {
  return (
    <StyledColumns {...rest} className={classNames('reqore-columns', className)}>
      {children}
    </StyledColumns>
  );
});
