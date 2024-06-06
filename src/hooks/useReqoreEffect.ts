import { useMemo } from 'react';
import { IReqoreEffect } from '../components/Effect';
import { IReqoreTheme } from '../constants/theme';
import { useReqoreTheme } from './useTheme';

export const useReqoreEffect = (
  component: 'buttons',
  theme: IReqoreTheme,
  effect?: IReqoreEffect
): IReqoreEffect => {
  let _theme: IReqoreTheme = useReqoreTheme();

  // Return the effect if the component is not defined in the theme
  if (!theme[component]?.effect) {
    return effect;
  }

  if (theme) {
    // No other way to conditionally use a hook
    _theme = theme;
  }

  const _effect = useMemo(() => {
    return {
      ...effect,
      ..._theme[component].effect,
    };
  }, [effect, _theme[component].effect]);

  return _effect;
};
