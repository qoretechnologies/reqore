import { useContext } from 'react';
import { IReqoreTheme } from '../constants/theme';
import ThemeContext from '../context/ThemeContext';
import { mergeThemes } from '../helpers/colors';

export const useReqoreTheme = (element: string, customTheme?: any) => {
  const theme: IReqoreTheme = useContext<IReqoreTheme>(ThemeContext);

  return mergeThemes(element, theme, customTheme);
};
