import { cloneDeep } from 'lodash';
import merge from 'lodash/merge';
import React, { useState } from 'react';
import { useMount } from 'react-use';
import ReqoreLayoutWrapper from '../components/Layout';
import { IReqoreNotificationsPosition } from '../components/Notifications';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';
import ThemeContext from '../context/ThemeContext';
import ReqoreNotifications from './NotificationsProvider';
import PopoverProvider from './PopoverProvider';

export interface IReqoreUIProviderProps {
  children: any;
  theme?: IReqoreTheme;
  notificationsPosition?: IReqoreNotificationsPosition;
  withSidebar?: boolean;
}

const ReqoreUIProvider: React.FC<IReqoreUIProviderProps> = ({
  children,
  theme,
  notificationsPosition,
  withSidebar,
}) => {
  const _theme: IReqoreTheme = cloneDeep(theme || {});
  const _defaultTheme: IReqoreTheme = cloneDeep(DEFAULT_THEME);
  const [_isMounted, _setIsMounted] = useState(false);

  useMount(() => {
    _setIsMounted(true);
  });

  return (
    <>
      <ThemeContext.Provider value={{ ...merge(_defaultTheme, _theme) }}>
        <ReqoreLayoutWrapper withSidebar={withSidebar}>
          <ReqoreNotifications position={notificationsPosition}>
            <PopoverProvider>
              {_isMounted ? children : null}
              <div id='reqore-modal-portal' />
            </PopoverProvider>
          </ReqoreNotifications>
        </ReqoreLayoutWrapper>
      </ThemeContext.Provider>
    </>
  );
};

export default ReqoreUIProvider;
