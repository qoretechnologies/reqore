import React from 'react';
import styled from 'styled-components';
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
}

const StyledTagGroup = styled.div`
  flex-shrink: ${({ wrap }: IReqoreTagGroup) => (wrap ? 1 : 0)};
  display: flex;
  flex-wrap: ${({ wrap }: IReqoreTagGroup) => (wrap ? 'wrap' : 'nowrap')};
  gap: ${({ gapSize }: IReqoreTagGroup) => GAP_FROM_SIZE[gapSize]}px;
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
    {...rest}
    gapSize={gapSize}
    wrap={wrap}
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
