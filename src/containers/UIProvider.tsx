import React from 'react';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';
import ThemeContext from '../context/ThemeContext';

export interface IReqoreUIProviderProps {
  children: any;
  theme?: IReqoreTheme;
}

const ReqoreUIProvider: React.FC<IReqoreUIProviderProps> = ({
  children,
  theme,
}) => {
  const _theme: IReqoreTheme = theme || DEFAULT_THEME;

  return (
    <ThemeContext.Provider value={{ ..._theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ReqoreUIProvider;
