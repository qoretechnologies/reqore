import { cloneDeep } from 'lodash';
import merge from 'lodash/merge';
import React, { useState } from 'react';
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
  const [modalPortal, setModalPortal] = useState<any>(false);

  return (
    <>
      <ThemeContext.Provider value={{ ...merge(_defaultTheme, _theme) }}>
        <ReqoreLayoutWrapper withSidebar={withSidebar}>
          <ReqoreNotifications position={notificationsPosition}>
            <PopoverProvider>
              {modalPortal ? children : null}
              <div id='reqore-modal-portal' ref={setModalPortal} />
            </PopoverProvider>
          </ReqoreNotifications>
        </ReqoreLayoutWrapper>
      </ThemeContext.Provider>
    </>
  );
};

export default ReqoreUIProvider;
