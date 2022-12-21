import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';

export interface IReqoreNavbarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'right' | 'left';
  type?: 'footer' | 'header';
  children?: any;
  theme?: IReqoreTheme;
}

export interface IReqoreNavbarGroupStyle extends IReqoreNavbarGroupProps {
  theme: IReqoreTheme;
}

export const StyledNavbarGroup = styled.div<IReqoreNavbarGroupStyle>`
  ${({ position }: IReqoreNavbarGroupStyle) => css`
    height: 100%;
    float: ${position};
    color: inherit;
    background-color: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

const ReqoreNavbarGroup = forwardRef<HTMLDivElement, IReqoreNavbarGroupProps>(
  ({ position = 'left', children, type, ...rest }: IReqoreNavbarGroupProps, ref: any) => (
    <StyledNavbarGroup
      {...rest}
      className={`${rest.className || ''} reqore-navbar-group`}
      position={position}
      ref={ref}
    >
      {React.Children.map(children, (child) =>
        child
          ? React.cloneElement(child, {
              type,
              theme: rest.theme,
              componentProps: {
                ...child.props?.componentProps,
                type,
                theme: rest.theme,
              },
            })
          : null
      )}
    </StyledNavbarGroup>
  )
);

export default ReqoreNavbarGroup;
