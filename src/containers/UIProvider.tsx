import { cloneDeep } from 'lodash';
import type { IReqoreNotificationDefaults } from '../components/Notifications/notification';
import merge from 'lodash/merge';
import { rgba } from 'polished';
import React, { forwardRef, memo, useMemo, useState } from 'react';
import { createGlobalStyle, css } from 'styled-components';
import styled from '../helpers/styled';
import ReqoreLayoutWrapper, { IReqoreLayoutWrapperProps } from '../components/Layout';
import { getFontFamily } from '../constants/fonts';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';
import { IReqoreContext } from '../context/ReqoreContext';
import { TReqoreDataAttributes } from '../types/global';
import ThemeContext from '../context/ThemeContext';
import { buildTheme, getMainBackgroundColor, getReadableColor } from '../helpers/colors';
import ReqoreProvider from './ReqoreProvider';
import ReqoreThemeProvider from './ThemeProvider';

export interface IReqoreOptions
  extends Pick<
    IReqoreContext,
    | 'closeModalsOnEscPress'
    | 'closePopoversOnEscPress'
    | 'animations'
    | 'tooltips'
    | 'customPortalId'
    | 'errorBoundaryOptions'
    | 'glowingIcons'
    | 'shortcutHints'
  > {
  withSidebar?: boolean;
  uiScale?: number;
  /** Defaults for every notification added through `addNotification`. */
  notifications?: IReqoreNotificationDefaults;
}
/**
 * Props for the top-level UI provider that wires Reqore theme and global layout.
 */
export interface IReqoreUIProviderProps {
  children?: any;
  theme?: Partial<IReqoreTheme>;
  options?: IReqoreOptions;
  /**
   * Props for the layout wrapper the provider renders around the app (`.reqore-layout-wrapper`):
   * `transparent` to let the page's own background show through, plus any `div` attribute —
   * `className`, `style`, `data-*`, `aria-*`. `className` is merged with the wrapper's own;
   * `options.withSidebar` keeps deciding the direction.
   */
  layoutWrapperProps?: Omit<IReqoreLayoutWrapperProps, 'children' | 'withSidebar'> &
    TReqoreDataAttributes;
}

const GlobalStyle = createGlobalStyle`
  .reqore-blur-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 8998;
    cursor: pointer;
    background-color: ${({ theme }) => rgba(getMainBackgroundColor(theme), 0.3)};
    backdrop-filter: blur(3px);
  }

  .reqore-blur-z-index {
    z-index: 8999;
  }
`;

const StyledPortal = styled.div`
  * {
    box-sizing: border-box;
  }

  ${({ theme }) => css`
    color: ${getReadableColor(theme, undefined, undefined, true)};
  `}

  /* The portal is outside the layout wrapper, so it names the theme's font itself. */
  ${({ theme }) =>
    theme.fontFamily &&
    css`
      font-family: ${getFontFamily(theme.fontFamily)};
    `}
`;

const ReqorePortal = memo(
  forwardRef<HTMLDivElement, object>((_props, ref) => {
    return (
      <ReqoreThemeProvider>
        <StyledPortal id='reqore-portal' ref={ref} />
      </ReqoreThemeProvider>
    );
  })
);

/**
 * Wrap your application with Reqore's theme, layout, and modal portal context.
 */
const ReqoreUIProvider: React.FC<IReqoreUIProviderProps> = memo(
  ({ children, theme, options, layoutWrapperProps }) => {
    const [modalPortal, setModalPortal] = useState<any>(false);

    const _theme: Partial<IReqoreTheme> = useMemo(() => cloneDeep(theme || {}), [theme]);
    const _defaultTheme: IReqoreTheme = useMemo(() => cloneDeep(DEFAULT_THEME), []);
    const rebuiltTheme: IReqoreTheme = useMemo(
      () => buildTheme(merge(_defaultTheme, _theme)),
      [_defaultTheme, _theme]
    );

    return (
      <>
        <ThemeContext.Provider value={{ ...rebuiltTheme }}>
          <ReqoreThemeProvider>
            <GlobalStyle />
          </ReqoreThemeProvider>
          <ReqoreLayoutWrapper {...layoutWrapperProps} withSidebar={options?.withSidebar}>
            {modalPortal ? <ReqoreProvider options={options}>{children}</ReqoreProvider> : null}
          </ReqoreLayoutWrapper>
          <ReqorePortal ref={setModalPortal} />
        </ThemeContext.Provider>
      </>
    );
  }
);

export default ReqoreUIProvider;
