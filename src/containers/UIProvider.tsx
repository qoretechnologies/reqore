import { cloneDeep } from 'lodash';
import merge from 'lodash/merge';
import { rgba } from 'polished';
import React, { forwardRef, memo, useMemo, useState } from 'react';
import styled, { createGlobalStyle, css } from 'styled-components';
import ReqoreLayoutWrapper from '../components/Layout';
import { IReqoreNotificationsPosition } from '../components/Notifications';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';
import ThemeContext from '../context/ThemeContext';
import { buildTheme, getMainBackgroundColor, getReadableColor } from '../helpers/colors';
import ReqoreProvider from './ReqoreProvider';
import ReqoreThemeProvider from './ThemeProvider';

export interface IReqoreOptions {
  withSidebar?: boolean;
  notificationsPosition?: IReqoreNotificationsPosition;
  uiScale?: number;
  animations?: {
    buttons?: boolean;
    dialogs?: boolean;
  };
  tooltips?: {
    /**
     * Delay in ms before showing the tooltip
     * @default 0
     * Works only for `hover` handler
     * */
    delay?: number;
  };
  closePopoversOnEscPress?: boolean;
}
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
        <StyledPortal id='reqore-portal' ref={ref} />
      </ReqoreThemeProvider>
    );
  })
);

const ReqoreUIProvider: React.FC<IReqoreUIProviderProps> = memo(({ children, theme, options }) => {
  const [modalPortal, setModalPortal] = useState<any>(false);

  const _theme: Partial<IReqoreTheme> = useMemo(() => cloneDeep(theme || {}), [theme]);
  const _defaultTheme: IReqoreTheme = useMemo(() => cloneDeep(DEFAULT_THEME), [DEFAULT_THEME]);
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
          {modalPortal ? <ReqoreProvider options={options}>{children}</ReqoreProvider> : null}
        </ReqoreLayoutWrapper>
        <ReqorePortal ref={setModalPortal} />
      </ThemeContext.Provider>
    </>
  );
});

export default ReqoreUIProvider;
