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
  theme?: IReqoreTheme;
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
  const _theme: IReqoreTheme = cloneDeep(theme || {});
  const _defaultTheme: IReqoreTheme = cloneDeep(DEFAULT_THEME);
  const [modalPortal, setModalPortal] = useState<any>(false);
  const rebuiltTheme = buildTheme(merge(_defaultTheme, _theme));

  return (
    <>
      <ThemeContext.Provider value={{ ...rebuiltTheme }}>
        <ReqoreLayoutWrapper withSidebar={withSidebar}>
          <ReqoreProvider position={notificationsPosition}>
            <PopoverProvider uiScale={uiScale}>
              {modalPortal ? children : null}
              <StyledPortal id='reqore-portal' ref={setModalPortal} />
            </PopoverProvider>
          </ReqoreProvider>
        </ReqoreLayoutWrapper>
      </ThemeContext.Provider>
    </>
  );
};

export default ReqoreUIProvider;
