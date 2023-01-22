import { cloneDeep } from 'lodash';
import merge from 'lodash/merge';
import { rgba } from 'polished';
import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import ReqoreLayoutWrapper from '../components/Layout';
import { IReqoreNotificationsPosition } from '../components/Notifications';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';
import ThemeContext from '../context/ThemeContext';
import { buildTheme, getMainBackgroundColor } from '../helpers/colors';
import PopoverProvider from './PopoverProvider';
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
    z-index: 999998;
    cursor: pointer;
    background-color: ${({ theme }) => rgba(getMainBackgroundColor(theme), 0.3)};
    backdrop-filter: blur(3px);
  }

  .reqore-blur-z-index {
    z-index: 999999;
  }
`;

const StyledPortal = styled.div`
  z-index: 9999;
  * {
    box-sizing: border-box;
  }
`;

const ReqoreUIProvider: React.FC<IReqoreUIProviderProps> = ({ children, theme, options }) => {
  const [modalPortal, setModalPortal] = useState<any>(false);

  const _theme: Partial<IReqoreTheme> = cloneDeep(theme || {});
  const _defaultTheme: IReqoreTheme = cloneDeep(DEFAULT_THEME);
  const rebuiltTheme: IReqoreTheme = buildTheme(merge(_defaultTheme, _theme));

  return (
    <>
      <ThemeContext.Provider value={{ ...rebuiltTheme }}>
        <ReqoreThemeProvider>
          <GlobalStyle />
        </ReqoreThemeProvider>
        <ReqoreLayoutWrapper withSidebar={options?.withSidebar}>
          {modalPortal ? (
            <ReqoreProvider options={options}>
              <PopoverProvider uiScale={options?.uiScale}>{children}</PopoverProvider>
            </ReqoreProvider>
          ) : null}
        </ReqoreLayoutWrapper>
      </ThemeContext.Provider>
      <StyledPortal id='reqore-portal' ref={setModalPortal} />
    </>
  );
};

export default ReqoreUIProvider;
