import { cloneDeep } from 'lodash';
import { useContext } from 'react';
import { IReqoreTheme, TReqoreIntent } from '../constants/theme';
import ThemeContext from '../context/ThemeContext';
import { mergeThemes } from '../helpers/colors';

export const useReqoreTheme = (
  element: string,
  customTheme: Partial<IReqoreTheme> = {},
  intent?: TReqoreIntent
) => {
  const theme: IReqoreTheme = useContext<IReqoreTheme>(ThemeContext);
  let _customTheme: Partial<IReqoreTheme> = cloneDeep(customTheme);

  if (element === 'main' && intent) {
    _customTheme.main = theme.intents[intent];
  }

  return mergeThemes(element, theme, _customTheme) as IReqoreTheme;
};
