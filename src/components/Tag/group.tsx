import React from 'react';
import styled, { css } from 'styled-components';
import { GAP_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IWithReqoreMinimal, IWithReqoreSize } from '../../types/global';

export interface IReqoreTagGroup
  extends React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreSize,
    IWithReqoreMinimal {
  children: any;
  gapSize?: TSizes;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  wrap?: boolean;
  fluid?: boolean;
  align?: 'left' | 'center' | 'right';
}

const StyledTagGroup = styled.div`
  flex-shrink: ${({ $wrap }: { $wrap?: boolean }) => ($wrap ? 1 : 0)};
  flex-grow: ${({ $fluid }: { $fluid?: boolean }) => ($fluid ? 1 : undefined)};
  display: flex;
  flex-wrap: ${({ $wrap }: { $wrap?: boolean }) => ($wrap ? 'wrap' : 'nowrap')};
  gap: ${({ $gapSize }: { $gapSize?: TSizes }) => GAP_FROM_SIZE[$gapSize]}px;
  align-items: center;

  ${({ $align }: { $align?: 'left' | 'center' | 'right' }) => {
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
  ...rest
}: IReqoreTagGroup) => (
  <StyledTagGroup
    $gapSize={gapSize}
    $wrap={wrap}
    $fluid={rest.fluid}
    $align={rest.align}
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
