import React from 'react';
import styled from 'styled-components';
import { StyledTag } from '.';
import { GAP_FROM_SIZE, TSizes } from '../../constants/sizes';

export interface IReqoreTagGroup extends React.HTMLAttributes<HTMLDivElement> {
  children: any;
  size?: TSizes;
  gapSize?: TSizes;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  hasBottomMargin?: boolean;
}

const StyledTagGroup = styled.div`
  flex-shrink: 0;

  ${StyledTag} {
    &:not(:last-child) {
      margin-right: ${({ gapSize }: IReqoreTagGroup) => `${GAP_FROM_SIZE[gapSize]}px`};
    }

    margin-bottom: ${({ hasBottomMargin }) => (hasBottomMargin ? '5px' : '0px')};
  }
`;

const ReqoreTagGroup = ({
  children,
  size,
  gapSize = 'normal',
  className,
  columns,
  hasBottomMargin = true,
  ...rest
}: IReqoreTagGroup) => (
  <StyledTagGroup
    {...rest}
    gapSize={gapSize}
    hasBottomMargin={hasBottomMargin}
    className={`${className || ''} reqore-tag-group`}
  >
    {React.Children.map(children, (child) =>
      child
        ? React.cloneElement(child, {
            size: child.props?.size || size,
            width: columns ? `calc(${100 / columns}% - 5px)` : child.props.width,
          })
        : null
    )}
  </StyledTagGroup>
);

export default ReqoreTagGroup;
