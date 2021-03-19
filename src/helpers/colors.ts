import { darken, lighten, readableColor } from 'polished';
import { Colors } from '../constants/colors';
import { IReqoreTheme } from '../constants/theme';

export const getReadableColor: (
  theme: IReqoreTheme,
  ifLight?: string,
  ifDark?: string,
  dimmed?: boolean,
  fallback?: string
) => string = (theme, ifLight, ifDark, dimmed, fallback) => {
  if (theme.text?.color) {
    return theme.text.dim
      ? dimmed
        ? changeDarkness(theme.text.color, 0.05)
        : theme.text.color
      : theme.text.color;
  }

  const shouldDim = theme.text?.dim && dimmed;
  const from = fallback || theme.main;

  return getReadableColorFrom(from, shouldDim, ifLight, ifDark);
};

export const getReadableColorFrom = (
  from: string,
  dim?: boolean,
  ifLight?: string,
  ifDark?: string
) => {
  const returnIfLight = ifLight || lighten(dim ? 0.2 : 0, Colors.DARK);
  const returnIfDark = ifDark || darken(dim ? 0.1 : 0, Colors.LIGHT);

  return readableColor(from, returnIfLight, returnIfDark, false);
};

export const shouldDarken = (mainColor: string) => {
  const contrast = getColorByBgColor(mainColor);

  return contrast === '#000000';
};

export const getMainColor: (
  theme: IReqoreTheme,
  component: string
) => string = (theme, component) => theme[component]?.main || theme.main;

export const changeLightness: (color: string, lightness: number) => string = (
  color,
  lightness
) =>
  color
    ? shouldDarken(color)
      ? darken(lightness, color)
      : lighten(lightness, color)
    : undefined;

export const changeDarkness: (color: string, lightness: number) => string = (
  color,
  lightness
) =>
  color
    ? shouldDarken(color)
      ? lighten(lightness, color)
      : darken(lightness, color)
    : undefined;

export const getColorByBgColor = (bgColor) => {
  if (!bgColor) {
    return '';
  }
  return parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2
    ? '#000000'
    : '#ffffff';
};
