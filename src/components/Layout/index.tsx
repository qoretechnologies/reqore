import React from 'react';
import { css } from 'styled-components';
import styled from '../../helpers/styled';
import { getFontFamily } from '../../constants/fonts';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness, getReadableColor } from '../../helpers/colors';

export interface IReqoreLayoutWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  withSidebar?: boolean;
  /**
   * Paint no background, so the page's own colour shows through the whole layout.
   *
   * By default the wrapper paints the theme's surface (`theme.main` lightened a step, what
   * `getMainBackgroundColor` returns) over everything it holds. A page that sets its own
   * background behind the app — on `body`, a section, an image — sees that surface as a
   * rectangle of a slightly different colour, with a seam where it meets the rest. With
   * `transparent` the wrapper keeps its layout and its readable text colour and draws no
   * surface at all.
   */
  transparent?: boolean;
}

const StyledReqoreLayoutWrapper = styled.div<{
  withSidebar: boolean;
  $transparent?: boolean;
  theme: IReqoreTheme;
}>`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 14px;

  * {
    box-sizing: border-box;
  }

  a {
    text-decoration: none;
  }

  ${({ withSidebar, theme, $transparent }) => css`
    flex-flow: ${withSidebar ? 'row' : 'column'};
    background-color: ${$transparent ? 'transparent' : changeLightness(theme.main, 0.02)};
    color: ${getReadableColor(theme, undefined, undefined, true)};
  `}

  /* Only when the theme names a font: without one, Reqore's text is in the page's font. */
  ${({ theme }) =>
    theme.fontFamily &&
    css`
      font-family: ${getFontFamily(theme.fontFamily)};
    `}
`;

const ReqoreLayoutWrapper = ({
  withSidebar,
  transparent,
  children,
  className,
  ...rest
}: IReqoreLayoutWrapperProps) => (
  <ReqoreThemeProvider>
    <StyledReqoreLayoutWrapper
      {...rest}
      className={`${className || ''} reqore-layout-wrapper`}
      withSidebar={withSidebar}
      $transparent={transparent}
    >
      {children}
    </StyledReqoreLayoutWrapper>
  </ReqoreThemeProvider>
);

export default ReqoreLayoutWrapper;
