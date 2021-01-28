import { cloneDeep } from 'lodash';
import merge from 'lodash/merge';
import React from 'react';
import { IReqoreNotificationsPosition } from '../components/Notifications';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';
import ThemeContext from '../context/ThemeContext';
import ReqoreNotifications from './NotificationsProvider';

export interface IReqoreUIProviderProps {
  children: any;
  theme?: IReqoreTheme;
  notificationsPosition?: IReqoreNotificationsPosition;
}

const ReqoreUIProvider: React.FC<IReqoreUIProviderProps> = ({
  children,
  theme,
  notificationsPosition,
}) => {
  const _theme: IReqoreTheme = cloneDeep(theme || {});
  const _defaultTheme: IReqoreTheme = cloneDeep(DEFAULT_THEME);

  return (
    <ThemeContext.Provider value={{ ...merge(_defaultTheme, _theme) }}>
      <ReqoreNotifications position={notificationsPosition}>
        {children}
      </ReqoreNotifications>
    </ThemeContext.Provider>
  );
};

export default ReqoreUIProvider;
