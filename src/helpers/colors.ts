import { darken, lighten, readableColor } from 'polished';
import { Colors } from '../constants/colors';
import { IReqoreTheme } from '../constants/theme';

export const getReadableColor: (
  from: string,
  ifLight?: string,
  ifDark?: string,
  dimmed?: boolean
) => string = (from, ifLight, ifDark, dimmed) =>
  readableColor(
    from,
    ifLight || dimmed ? lighten(0.1, Colors.DARK) : Colors.DARK,
    ifDark || dimmed ? darken(0.1, Colors.LIGHT) : Colors.LIGHT
  );

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
  shouldDarken(color) ? darken(lightness, color) : lighten(lightness, color);

export const getColorByBgColor = (bgColor) => {
  if (!bgColor) {
    return '';
  }
  return parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2
    ? '#000000'
    : '#ffffff';
};
