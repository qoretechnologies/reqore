import React from 'react';
import styled from 'styled-components';
import { StyledTag } from '.';
import { TSizes } from '../../constants/sizes';

export interface IReqoreTagGroup extends React.HTMLAttributes<HTMLDivElement> {
  children: any;
  size?: TSizes;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

const StyledTagGroup = styled.div`
  ${StyledTag} {
    margin-right: 5px;
    margin-bottom: 5px;
  }
`;

const ReqoreTagGroup = ({ children, size, className, columns, ...rest }: IReqoreTagGroup) => (
  <StyledTagGroup {...rest} className={`${className || ''} reqore-tag-group`}>
    {React.Children.map(children, (child) =>
      child
        ? React.cloneElement(child, {
            size,
            width: columns ? `calc(${100 / columns}% - 5px)` : child.props.width,
          })
        : null
    )}
  </StyledTagGroup>
);

export default ReqoreTagGroup;
