import { cloneDeep } from 'lodash';
import merge from 'lodash/merge';
import React, { useState } from 'react';
import styled from 'styled-components';
import ReqoreLayoutWrapper from '../components/Layout';
import { IReqoreNotificationsPosition } from '../components/Notifications';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';
import ThemeContext from '../context/ThemeContext';
import { buildTheme } from '../helpers/colors';
import PopoverProvider from './PopoverProvider';
import ReqoreProvider from './ReqoreProvider';

export interface IReqoreUIProviderProps {
  children: any;
  theme?: Partial<IReqoreTheme>;
  notificationsPosition?: IReqoreNotificationsPosition;
  withSidebar?: boolean;
  uiScale?: number;
}

const StyledPortal = styled.div`
  z-index: 9999;
`;

const ReqoreUIProvider: React.FC<IReqoreUIProviderProps> = ({
  children,
  theme,
  notificationsPosition,
  withSidebar,
  uiScale,
}) => {
  const [modalPortal, setModalPortal] = useState<any>(false);

  const _theme: Partial<IReqoreTheme> = cloneDeep(theme || {});
  const _defaultTheme: IReqoreTheme = cloneDeep(DEFAULT_THEME);
  const rebuiltTheme: IReqoreTheme = buildTheme(merge(_defaultTheme, _theme));

  return (
    <>
      <ThemeContext.Provider value={{ ...rebuiltTheme }}>
        <ReqoreLayoutWrapper withSidebar={withSidebar}>
          {modalPortal ? (
            <ReqoreProvider position={notificationsPosition}>
              <PopoverProvider uiScale={uiScale}>{children}</PopoverProvider>
            </ReqoreProvider>
          ) : null}
        </ReqoreLayoutWrapper>
      </ThemeContext.Provider>
      <StyledPortal id='reqore-portal' ref={setModalPortal} />
    </>
  );
};

export default ReqoreUIProvider;
