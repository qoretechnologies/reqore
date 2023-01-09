import { cloneDeep } from 'lodash';
import { useContext } from 'react';
import { TReqoreEffectColor } from '../components/Effect';
import { IReqoreTheme, TReqoreIntent } from '../constants/theme';
import ThemeContext from '../context/ThemeContext';
import { getColorFromMaybeString, mergeThemes } from '../helpers/colors';

export interface IReqoreCustomTheme extends Partial<Omit<IReqoreTheme, 'main' | 'text'>> {
  main?: TReqoreEffectColor;
  text?: {
    color?: TReqoreEffectColor;
    dim?: boolean;
  };
  gradient?: boolean;
}

export const useReqoreTheme = (
  element?: string,
  customTheme: IReqoreCustomTheme = {},
  intent?: TReqoreIntent
): IReqoreTheme => {
  const theme: IReqoreTheme = useContext<IReqoreTheme>(ThemeContext);

  if (!element) {
    return theme;
  }

  let _customTheme: IReqoreCustomTheme = cloneDeep(customTheme);

  if (_customTheme.main) {
    _customTheme.main = getColorFromMaybeString(theme, customTheme.main);
  }

  if (_customTheme.text?.color) {
    _customTheme.text.color = getColorFromMaybeString(theme, customTheme.text.color);
  }

  if (element === 'main' && intent) {
    _customTheme.main = theme.intents[intent];
  }

  return mergeThemes(element, theme, _customTheme) as IReqoreTheme;
};
