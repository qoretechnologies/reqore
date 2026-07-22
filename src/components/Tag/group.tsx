import React from 'react';
import styled, { css } from 'styled-components';
import { GAP_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IWithReqoreMinimal, IWithReqoreSize } from '../../types/global';

export interface IReqoreTagGroup
  extends React.HTMLAttributes<HTMLDivElement>, IWithReqoreSize, IWithReqoreMinimal {
  children: any;
  gapSize?: TSizes;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  wrap?: boolean;
  fluid?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface IStyledTagGroupProps {
  $align?: IReqoreTagGroup['align'];
  $fluid?: boolean;
  $gapSize: TSizes;
  $wrap: boolean;
}

const StyledTagGroup = styled.div<IStyledTagGroupProps>`
  flex-shrink: ${({ $wrap }) => ($wrap ? 1 : 0)};
  flex-grow: ${({ $fluid }) => ($fluid ? 1 : undefined)};
  display: flex;
  flex-wrap: ${({ $wrap }) => ($wrap ? 'wrap' : 'nowrap')};
  gap: ${({ $gapSize }) => GAP_FROM_SIZE[$gapSize]}px;
  align-items: center;

  ${({ $align }) => {
    if ($align === 'right') {
      return css`
        margin-left: auto;
        justify-content: flex-end;
      `;
    }

    if ($align === 'center') {
      return css`
        margin: 0 auto;
        justify-content: center;
      `;
    }
  }}
`;

const ReqoreTagGroup = ({
  children,
  size,
  gapSize = 'normal',
  minimal,
  className,
  columns,
  wrap = true,
  fluid,
  align,
  ...rest
}: IReqoreTagGroup) => (
  <StyledTagGroup
    {...rest}
    $align={align}
    $fluid={fluid}
    $gapSize={gapSize}
    $wrap={wrap}
    className={`${className || ''} reqore-tag-group`}
  >
    {React.Children.map(children, (child) =>
      child
        ? React.cloneElement(child, {
            size: child.props?.size || size,
            width: columns ? `calc(${100 / columns}% - 5px)` : child.props.width,
            minimal:
              child.props?.minimal || child.props?.minimal === false
                ? child.props.minimal
                : minimal,
          })
        : null
    )}
  </StyledTagGroup>
);

export default ReqoreTagGroup;
