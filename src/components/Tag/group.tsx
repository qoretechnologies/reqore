import React from 'react';
import styled from 'styled-components';
import { StyledTag } from '.';
import { TSizes } from '../../constants/sizes';

export interface IReqoreTagGroup extends React.HTMLAttributes<HTMLDivElement> {
  children: any;
  size?: TSizes;
}

const StyledTagGroup = styled.div`
  ${StyledTag} {
    margin-right: 5px;
    margin-bottom: 5px;
  }
`;

const ReqoreTagGroup = ({
  children,
  size,
  className,
  ...rest
}: IReqoreTagGroup) => (
  <StyledTagGroup {...rest} className={`${className || ''} reqore-tag-group`}>
    {React.Children.map(children, (child) =>
      child
        ? React.cloneElement(child, {
            size,
          })
        : null
    )}
  </StyledTagGroup>
);

export default ReqoreTagGroup;
