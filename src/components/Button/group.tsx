import React from 'react';
import styled from 'styled-components';
import { StyledButton } from '.';
import { IReqoreTheme } from '../../constants/theme';

export interface IReqoreButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  stack?: boolean;
}

export interface IReqoreButtonGroupStyle extends IReqoreButtonGroupProps {
  theme: IReqoreTheme;
}

const StyledButtonGroup = styled.div<IReqoreButtonGroupStyle>`
  display: flex;
  ${StyledButton} {
    &:not(:last-child) {
      margin-right: ${({ stack }) => !stack ? '5px' : undefined};
    }

    border-radius: ${({ stack }) => !stack ? undefined : 0};

    &:first-child {
      border-top-left-radius: 3px;
      border-bottom-left-radius: 3px;
    }

    &:last-child {
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
    }
  }
`

const ReqoreButtonGroup = ({ children, className, ...rest }: IReqoreButtonGroupProps) => (
  <StyledButtonGroup {...rest} className={`${className || ''} reqore-button-group`}>
    {children}
  </StyledButtonGroup>
);

export default ReqoreButtonGroup;