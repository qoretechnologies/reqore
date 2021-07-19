import { cloneDeep } from 'lodash';
import { useContext } from 'react';
import { IReqoreIntent, IReqoreTheme } from '../constants/theme';
import ThemeContext from '../context/ThemeContext';
import { mergeThemes } from '../helpers/colors';

export const useReqoreTheme = (
  element: string,
  customTheme: IReqoreTheme = {},
  intent?: IReqoreIntent
) => {
  const theme: IReqoreTheme = useContext<IReqoreTheme>(ThemeContext);
  let _customTheme: IReqoreTheme = cloneDeep(customTheme);

  if (element === 'main' && intent) {
    _customTheme.main = theme.intents[intent];
  }

  return mergeThemes(element, theme, _customTheme);
};
