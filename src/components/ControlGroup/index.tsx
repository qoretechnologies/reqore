import React from 'react';
import styled, { css } from 'styled-components';
import { RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';

export interface IReqoreControlGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  stack?: boolean;
  minimal?: boolean;
  size?: TSizes;
  children: any;
  fluid?: boolean;
  rounded?: boolean;
}

export interface IReqoreControlGroupStyle extends IReqoreControlGroupProps {
  theme: IReqoreTheme;
}

const StyledControlGroup = styled.div<IReqoreControlGroupStyle>`
  display: flex;
  flex: ${({ fluid }) => (fluid ? '1' : '0 auto')};
  width: ${({ fluid }) => (fluid ? '100%' : undefined)};

  > .reqore-control-wrapper .reqore-control {
    border-radius: ${({ stack }) => (!stack ? undefined : 0)};
  }

  > .reqore-control,
  > .reqore-control-wrapper,
  > * {
    &:not(:last-child) {
      margin-right: ${({ stack }) => (!stack ? '5px' : undefined)};
    }

    border-radius: ${({ stack }) => (!stack ? undefined : 0)};

    ${({ rounded, size }) =>
      rounded &&
      css`
        &:first-child {
          border-top-left-radius: ${RADIUS_FROM_SIZE[size]}px;
          border-bottom-left-radius: ${RADIUS_FROM_SIZE[size]}px;
        }

        &:last-child {
          border-top-right-radius: ${RADIUS_FROM_SIZE[size]}px;
          border-bottom-right-radius: ${RADIUS_FROM_SIZE[size]}px;
        }
      `}
  }
`;

const ReqoreControlGroup = ({
  children,
  className,
  minimal,
  size = 'normal',
  fluid,
  rounded = true,
  ...rest
}: IReqoreControlGroupProps) => (
  <StyledControlGroup
    {...rest}
    size={size}
    rounded={rounded}
    fluid={fluid}
    className={`${className || ''} reqore-control-group`}
  >
    {React.Children.map(children, (child) =>
      child
        ? React.cloneElement(child, {
            minimal: minimal || child.props?.minimal,
            size,
            fluid,
          })
        : null
    )}
  </StyledControlGroup>
);

export default ReqoreControlGroup;
