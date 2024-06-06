import { IReqoreEffect, TReqoreEffectColor, TReqoreHexColor } from '../components/Effect';
import { Colors } from './colors';

export interface IReqoreSidebarTheme {
  main?: TReqoreHexColor;
  color?: TReqoreHexColor;
  border?: TReqoreHexColor;
  item?: {
    color?: TReqoreHexColor;
    background?: TReqoreHexColor;
    border?: TReqoreHexColor;
    hoverColor?: TReqoreHexColor;
    hoverBackground?: TReqoreHexColor;
    activeColor?: TReqoreHexColor;
    activeBackground?: TReqoreHexColor;
  };
  subItem?: {
    color?: TReqoreHexColor;
    border?: TReqoreHexColor;
    background?: TReqoreHexColor;
    hoverColor?: TReqoreHexColor;
    hoverBackground?: TReqoreHexColor;
    activeColor?: TReqoreHexColor;
    activeBackground?: TReqoreHexColor;
  };
  icon?: {
    color?: TReqoreHexColor;
    hoverColor?: TReqoreHexColor;
    activeColor?: TReqoreHexColor;
  };
  section?: {
    background?: TReqoreHexColor;
  };
}

export interface IReqoreBreadcrumbsTheme {
  main?: TReqoreHexColor;
  item?: {
    color?: TReqoreHexColor;
    hoverColor?: TReqoreHexColor;
    activeColor?: TReqoreHexColor;
  };
}

export interface IReqoreNavbarTheme {
  main?: TReqoreHexColor;
  color?: TReqoreHexColor;
  border?: TReqoreHexColor;
  background?: TReqoreHexColor;
  hoverColor?: TReqoreHexColor;
}

export interface IReqoreTheme {
  main: TReqoreHexColor;
  originalMain?: TReqoreHexColor;
  text?: {
    color?: TReqoreHexColor;
    dim?: boolean;
  };
  intents: IReqoreIntents;
  sidebar?: IReqoreSidebarTheme;
  notifications: IReqoreIntents;
  popover?: {
    main: TReqoreHexColor;
  };
  header?: IReqoreNavbarTheme;
  footer?: IReqoreNavbarTheme;
  breadcrumbs?: IReqoreBreadcrumbsTheme;
  buttons?: IReqoreCustomTheme;
}

export interface IReqoreCustomTheme {
  main?: TReqoreEffectColor;
  text?: {
    color?: TReqoreEffectColor;
    dim?: boolean;
  };
  effect?: IReqoreEffect;
  compact?: boolean;
}

export interface IReqoreIntents {
  info?: TReqoreHexColor;
  success?: TReqoreHexColor;
  pending?: TReqoreHexColor;
  warning?: TReqoreHexColor;
  danger?: TReqoreHexColor;
  muted?: TReqoreHexColor;
  black?: TReqoreHexColor;
  white?: TReqoreHexColor;

  custom1?: TReqoreHexColor;
  custom2?: TReqoreHexColor;
  custom3?: TReqoreHexColor;
  custom4?: TReqoreHexColor;
  custom5?: TReqoreHexColor;
}

export const DEFAULT_INTENTS: IReqoreIntents = {
  info: Colors.BLUE,
  success: Colors.GREEN,
  pending: Colors.YELLOW,
  warning: Colors.ORANGE,
  danger: Colors.RED,
  muted: Colors.GRAY,
  black: Colors.DARK,
  white: Colors.LIGHT,

  custom1: Colors.GRAY,
  custom2: Colors.GRAY,
  custom3: Colors.GRAY,
  custom4: Colors.GRAY,
  custom5: Colors.GRAY,
};

export type TReqoreIntent = keyof IReqoreIntents;

export const DEFAULT_THEME: IReqoreTheme = {
  main: Colors.DARK_THEME,
  text: {
    dim: true,
  },
  intents: DEFAULT_INTENTS,
  notifications: {},
};

export const ReqoreIntents: { [key: string]: TReqoreIntent } = {
  INFO: 'info',
  SUCCESS: 'success',
  PENDING: 'pending',
  WARNING: 'warning',
  DANGER: 'danger',
  MUTED: 'muted',
  BLACK: 'black',
  WHITE: 'white',
  CUSTOM1: 'custom1',
  CUSTOM2: 'custom2',
  CUSTOM3: 'custom3',
  CUSTOM4: 'custom4',
  CUSTOM5: 'custom5',
};
