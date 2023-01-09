import { useContext, useMemo } from 'react';
import {
  IReqoreEffect,
  TReqoreEffectGradientAnimationTrigger,
  TReqoreHexColor,
} from '../components/Effect';
import { IReqoreTheme } from '../constants/theme';
import ThemeContext from '../context/ThemeContext';

export const useReqoreEffect = (
  component: 'buttons',
  theme: IReqoreTheme,
  effect?: IReqoreEffect
): IReqoreEffect => {
  let _theme: IReqoreTheme = useContext<IReqoreTheme>(ThemeContext);

  // Return the effect if the component is not defined in the theme
  if (!theme[component]) {
    return effect;
  }

  if (theme) {
    // No other way to conditionally use a hook
    _theme = theme;
  }

  const colors: TReqoreHexColor = useMemo(() => {
    return _theme[component].gradient ? _theme.main : undefined;
  }, [_theme, effect]);

  const animate: TReqoreEffectGradientAnimationTrigger = useMemo(() => {
    return _theme[component].animate;
  }, [_theme, effect]);

  const _effect = useMemo(() => {
    return {
      ...effect,
      gradient: {
        colors,
        animate,

        // If the user has defined a gradient, we don't want to override it
        ...effect?.gradient,
      },
    };
  }, [colors, animate, effect]);

  return _effect;
};
