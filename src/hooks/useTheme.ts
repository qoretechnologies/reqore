import { cloneDeep } from 'lodash';
import { useMemo } from 'react';
import { TReqoreEffectColor } from '../components/Effect';
import { IReqoreTheme, TReqoreIntent } from '../constants/theme';
import { getColorFromMaybeString, mergeThemes } from '../helpers/colors';
import { useReqoreProperty } from './useReqoreContext';

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
  intent?: TReqoreIntent,
  intentsKey: 'intents' | 'notifications' = 'intents'
): IReqoreTheme => {
  const theme: IReqoreTheme = useReqoreProperty('theme');

  const finalTheme = useMemo(() => {
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
      _customTheme.main = theme[intentsKey][intent];
    }

    return mergeThemes(element, theme, _customTheme) as IReqoreTheme;
  }, [JSON.stringify(theme), element, JSON.stringify(customTheme), intent, intentsKey]);

  return finalTheme;
};
