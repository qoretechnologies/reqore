import { cloneDeep, merge, reduce } from 'lodash';
import { darken, getLuminance, lighten, mix, readableColor } from 'polished';
import {
  TReqoreEffectColor,
  TReqoreEffectColorList,
  TReqoreEffectGradientColors,
  TReqoreEffectGradientColorsObject,
  TReqoreHexColor,
} from '../components/Effect';
import { Colors } from '../constants/colors';
import { DEFAULT_INTENTS, IReqoreTheme, TReqoreIntent } from '../constants/theme';

export const getReadableColor: (
  theme: Partial<IReqoreTheme>,
  ifLight?: TReqoreHexColor,
  ifDark?: TReqoreHexColor,
  dimmed?: boolean,
  fallback?: TReqoreHexColor
) => TReqoreHexColor = (theme, ifLight, ifDark, dimmed, fallback) => {
  if (theme.text?.color) {
    return theme.text.dim
      ? dimmed
        ? changeDarkness(theme.text.color, 0.05)
        : theme.text.color
      : theme.text.color;
  }

  const shouldDim = theme.text?.dim && dimmed;
  const from = fallback || theme.main!;

  return getReadableColorFrom(from, shouldDim, ifLight, ifDark);
};

export const getReadableColorFrom = (
  from: TReqoreHexColor,
  dim?: boolean,
  ifLight?: TReqoreHexColor,
  ifDark?: TReqoreHexColor
): TReqoreHexColor => {
  const returnIfLight = ifLight || lighten(dim ? 0.05 : 0, Colors.DARK);
  const returnIfDark = ifDark || darken(dim ? 0.05 : 0, Colors.LIGHT);

  return readableColor(from, returnIfLight, returnIfDark, false) as TReqoreHexColor;
};

export const percentToHexAlpha = (p: number) => {
  const percent = Math.max(0, Math.min(100, p)); // bound percent from 0 to 100
  const intValue = Math.round((percent / 100) * 255); // map percent to nearest integer (0 - 255)
  const hexValue = intValue.toString(16); // get hexadecimal representation

  return hexValue.padStart(2, '0').toUpperCase(); // format with leading 0 and upper case characters
};

export const shouldDarken = (mainColor: TReqoreHexColor): boolean => {
  return getLuminance(mainColor) > 0.2;
};

export const getMainColor: (theme: IReqoreTheme, component: string) => TReqoreHexColor = (
  theme,
  component
) => theme[component]?.main || theme.main;

//export const changeBasedOnContrast = (color: string, lightness?: number): string =>

export const changeLightness = (color: TReqoreHexColor, lightness?: number): TReqoreHexColor => {
  return lightness
    ? shouldDarken(color)
      ? (darken(lightness, color) as TReqoreHexColor)
      : (lighten(lightness, color) as TReqoreHexColor)
    : color;
};

export const changeDarkness = (color: TReqoreHexColor, lightness?: number): TReqoreHexColor =>
  lightness
    ? shouldDarken(color)
      ? (lighten(lightness, color) as TReqoreHexColor)
      : (darken(lightness, color) as TReqoreHexColor)
    : color;

export const getColorByBgColor = (bgColor) => {
  if (!bgColor) {
    return '';
  }
  return parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2 ? '#000000' : '#ffffff';
};

export const isValidSixCharHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/.test(hex);
};

export const buildTheme = (theme: IReqoreTheme): IReqoreTheme => {
  const newTheme: IReqoreTheme = cloneDeep(theme);

  // Check if the main color is a valid hex color
  if (!isValidSixCharHex(newTheme.main)) {
    newTheme.main = '#333333';
  }

  // Add the original theme main color to the theme
  newTheme.originalMain = newTheme.main;

  if (!newTheme.notifications?.info) {
    newTheme.notifications.info = newTheme.intents.info || DEFAULT_INTENTS.info;
  }

  if (!newTheme.notifications?.success) {
    newTheme.notifications.success = newTheme.intents.success || DEFAULT_INTENTS.success;
  }

  if (!newTheme.notifications?.pending) {
    newTheme.notifications.pending = newTheme.intents.pending || DEFAULT_INTENTS.pending;
  }

  if (!newTheme.notifications?.warning) {
    newTheme.notifications.warning = newTheme.intents.warning || DEFAULT_INTENTS.warning;
  }

  if (!newTheme.notifications?.danger) {
    newTheme.notifications.danger = newTheme.intents.danger || DEFAULT_INTENTS.danger;
  }

  if (!newTheme.notifications?.muted) {
    newTheme.notifications.muted = `${newTheme.intents.muted || DEFAULT_INTENTS.muted}30`;
  }

  return newTheme;
};

export const mergeThemes = (element: string, theme: IReqoreTheme, customTheme: any) => {
  const clonedTheme = cloneDeep(theme);

  if (!customTheme) {
    return clonedTheme;
  }

  if (element === 'main') {
    merge(clonedTheme, {
      main: customTheme.main,
      originalMain: clonedTheme.main,
      text: customTheme.text,
    });
  } else {
    merge(clonedTheme, { [element]: customTheme, text: customTheme.text });
  }

  return clonedTheme;
};

export const getNotificationIntent = (theme: IReqoreTheme, intent?: TReqoreIntent) => {
  if (intent) {
    return theme.notifications[intent];
  }

  return changeLightness(theme.main, 0.1);
};

export const getMainBackgroundColor = (theme: IReqoreTheme): TReqoreHexColor =>
  changeLightness(theme.main, 0.02);

export const getColorFromMaybeString = (
  theme: IReqoreTheme,
  color: TReqoreEffectColor
): TReqoreHexColor => {
  if (!color) {
    return undefined;
  }

  const [providedColor, shading, multiplier = 1]: TReqoreEffectColorList = color.split(
    ':'
  ) as TReqoreEffectColorList;

  if (providedColor === 'transparent') {
    return theme.originalMain;
  }

  // First we need to get the actual color
  let _color: TReqoreHexColor;

  if (!providedColor || providedColor === 'main') {
    _color = theme.main;
  }

  if (theme.intents[providedColor]) {
    _color = theme.intents[providedColor];
  }

  if (isValidSixCharHex(providedColor)) {
    _color = providedColor as TReqoreHexColor;
  }

  if (shading) {
    if (shading === 'lighten') {
      _color = lighten(0.1 * multiplier, _color) as TReqoreHexColor;
    } else if (shading === 'darken') {
      _color = darken(0.1 * multiplier, _color) as TReqoreHexColor;
    }
  }

  return _color;
};

export const createEffectGradient = (
  theme: IReqoreTheme,
  colors: TReqoreEffectGradientColors,
  lighten: number = 0,
  minimal?: boolean,
  active?: boolean
): string => {
  let _colors: TReqoreEffectGradientColorsObject;
  // Check if the colors are valid
  if (!colors) {
    throw new Error('You need to provide colors');
  }

  if (typeof colors === 'string') {
    _colors = buildGradientColorsFromString(theme, colors);
  } else {
    _colors = colors;
  }

  return reduce(
    _colors,
    (colorsString, color, percentage) => {
      return `${colorsString}, ${
        minimal
          ? active
            ? theme.originalMain
            : changeLightness(theme.originalMain, lighten)
          : changeLightness(getColorFromMaybeString(theme, color), lighten)
      } ${percentage}%`;
    },
    ''
  );
};

export const buildGradientColorsFromString = (
  theme: IReqoreTheme,
  color: 'main' | TReqoreHexColor | TReqoreIntent
): TReqoreEffectGradientColorsObject => {
  if (!color) {
    throw new Error('You need to provide a color or intent');
  }

  const colorFrom: TReqoreHexColor = getColorFromMaybeString(theme, `${color}:lighten:1`);
  const colorTo: TReqoreHexColor = getColorFromMaybeString(theme, `${color}`);

  return {
    0: colorFrom,
    100: colorTo,
  };
};

export const getNthGradientColor = (
  theme: IReqoreTheme,
  colors?: TReqoreEffectGradientColors,
  nth: number = 1
): TReqoreHexColor | undefined => {
  const _colors =
    typeof colors === 'string' ? buildGradientColorsFromString(theme, colors) : colors;

  if (_colors) {
    return getColorFromMaybeString(theme, Object.values(_colors)[nth - 1]);
  }

  return undefined;
};

export const getGradientMix = (
  theme: IReqoreTheme,
  colors: TReqoreEffectGradientColors,
  fallback?: TReqoreHexColor
): TReqoreHexColor | undefined => {
  const _colors =
    typeof colors === 'string' ? buildGradientColorsFromString(theme, colors) : colors;

  if (colors && Object.keys(colors).length === 2) {
    const gradientColor1: TReqoreHexColor = getNthGradientColor(theme, _colors);
    const gradientColor2: TReqoreHexColor = getNthGradientColor(theme, _colors, 2);

    return mix(
      0.5,
      gradientColor1 === '#00000000' ? theme.main : gradientColor1,
      gradientColor2 === '#00000000' ? theme.main : gradientColor2
    ) as TReqoreHexColor;
  }

  return fallback;
};
