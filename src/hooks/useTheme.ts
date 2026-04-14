import { cloneDeep } from 'lodash';
import { useMemo } from 'react';
import { useContext } from 'use-context-selector';
import { TReqoreEffectColor } from '../components/Effect';
import { IReqoreTheme, TReqoreIntent } from '../constants/theme';
import CustomThemeContext from '../context/CustomThemeContext';
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
  customTheme?: IReqoreCustomTheme,
  intent?: TReqoreIntent,
  intentsKey: 'intents' | 'notifications' = 'intents',
  inheritCustomTheme: boolean = true
): IReqoreTheme => {
  const theme: IReqoreTheme = useReqoreProperty('theme');
  const parentCustomTheme = useContext(CustomThemeContext);

  const resolvedCustomTheme = useMemo(() => {
    // Explicit customTheme always wins
    if (customTheme) {
      return customTheme;
    }
    // Inherit from parent context if allowed
    if (inheritCustomTheme && parentCustomTheme) {
      return parentCustomTheme;
    }
    return {};
  }, [customTheme, inheritCustomTheme, parentCustomTheme]);

  const finalTheme = useMemo(() => {
    if (!element) {
      return theme;
    }

    const _customTheme: IReqoreCustomTheme = cloneDeep(resolvedCustomTheme);

    if (_customTheme.main) {
      _customTheme.main = getColorFromMaybeString(theme, resolvedCustomTheme.main);
    }

    if (_customTheme.text?.color) {
      _customTheme.text.color = getColorFromMaybeString(theme, resolvedCustomTheme.text.color);
    }

    if (element === 'main' && intent) {
      _customTheme.main = theme[intentsKey][intent];
    }

    return mergeThemes(element, theme, _customTheme) as IReqoreTheme;
  }, [JSON.stringify(theme), element, JSON.stringify(resolvedCustomTheme), intent, intentsKey]);

  return finalTheme;
};
