import { cloneDeep } from 'lodash';
import type { IReqoreNotificationDefaults } from '../components/Notifications/notification';
import merge from 'lodash/merge';
import { rgba } from 'polished';
import React, { forwardRef, memo, useMemo, useState } from 'react';
import styled, { createGlobalStyle, css } from 'styled-components';
import ReqoreLayoutWrapper from '../components/Layout';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';
import { IReqoreContext } from '../context/ReqoreContext';
import ThemeContext from '../context/ThemeContext';
import { buildTheme, getMainBackgroundColor, getReadableColor } from '../helpers/colors';
import { REQORE_PORTAL_ID } from '../helpers/portal';
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
`;

const ReqorePortal = memo(
  forwardRef<HTMLDivElement, object>((_props, ref) => {
    return (
      <ReqoreThemeProvider>
        <StyledPortal id={REQORE_PORTAL_ID} ref={ref} />
      </ReqoreThemeProvider>
    );
  })
);

/**
 * Wrap your application with Reqore's theme, layout, and modal portal context.
 */
const ReqoreUIProvider: React.FC<IReqoreUIProviderProps> = memo(({ children, theme, options }) => {
  // One re-render after the portal node commits, so anything that portalled
  // during the very first client render re-targets from document.body to the
  // portal node (see helpers/portal.ts). Never read for anything else: the
  // children render on the first pass regardless — withholding them until the
  // portal existed is what left server-rendered HTML empty.
  const [, setPortalNode] = useState<HTMLDivElement | null>(null);

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
        <ReqoreLayoutWrapper withSidebar={options?.withSidebar}>
          <ReqoreProvider options={options}>{children}</ReqoreProvider>
        </ReqoreLayoutWrapper>
        <ReqorePortal ref={setPortalNode} />
      </ThemeContext.Provider>
    </>
  );
});

export default ReqoreUIProvider;
