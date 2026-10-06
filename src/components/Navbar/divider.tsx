import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import { omitStyleProps } from '../../helpers/styled';
import { getReadableColor } from '../../helpers/colors';

export interface IReqoreNavbarDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'header' | 'footer';
  theme?: IReqoreTheme;
}

// The navbar's `type` (`header` / `footer`) picks its theme; it is not the element's `type`.
const StyledNavbarDivider = styled.div.withConfig({
  shouldForwardProp: omitStyleProps('type'),
})<{
  theme: IReqoreTheme;
  type?: 'header' | 'footer';
}>`
  position: relative;
  width: 20px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  &:before {
    content: '';
    display: block;
    width: 1px;
    height: 50%;
    background-color: ${({ theme, type }) =>
      getReadableColor(
        theme,
        undefined,
        undefined,
        true,
        theme[type]?.background || theme[type]?.main || theme.main
      )};
    opacity: 0.2;
  }
`;

const ReqoreNavbarDivider = forwardRef<HTMLDivElement, IReqoreNavbarDividerProps>(
  ({ type, ...rest }: IReqoreNavbarDividerProps, ref: any) => (
    <StyledNavbarDivider
      {...rest}
      type={type}
      className={`${rest.className || ''} reqore-navbar-divider`}
      ref={ref}
    />
  )
);

export default ReqoreNavbarDivider;
