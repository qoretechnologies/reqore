export interface IReqoreSidebarTheme {
  main?: string;
  color?: string;
  border?: string;
  item?: {
    color?: string;
    background?: string;
    border?: string;
    hoverColor?: string;
    hoverBackground?: string;
    activeColor?: string;
    activeBackground?: string;
  };
  subItem?: {
    color?: string;
    border?: string;
    background?: string;
    hoverColor?: string;
    hoverBackground?: string;
    activeColor?: string;
    activeBackground?: string;
  };
  icon?: {
    color?: string;
    hoverColor?: string;
    activeColor?: string;
  };
  section?: {
    background?: string;
  };
}

export interface IReqoreBreadcrumbsTheme {
  main?: string;
  item?: {
    color?: string;
    hoverColor?: string;
    activeColor?: string;
  };
}

export interface IReqoreNavbarTheme {
  main?: string;
  color?: string;
  border?: string;
  background?: string;
  hoverColor?: string;
}

export interface IReqoreTheme {
  main: string;
  text?: {
    color?: string;
    dim?: boolean;
  };
  intents: IReqoreIntents;
  sidebar?: IReqoreSidebarTheme;
  notifications: IReqoreIntents;
  popover?: {
    main: string;
  };
  header?: IReqoreNavbarTheme;
  footer?: IReqoreNavbarTheme;
  breadcrumbs?: IReqoreBreadcrumbsTheme;
}

export interface IReqoreCustomTheme {
  main?: string;
  text?: {
    color?: string;
    dim?: boolean;
  };
}

export interface IReqoreIntents {
  info?: string;
  success?: string;
  pending?: string;
  warning?: string;
  danger?: string;
  muted?: string;
}

export type TReqoreIntent = 'info' | 'success' | 'pending' | 'warning' | 'danger' | 'muted';

export const DEFAULT_INTENTS: IReqoreIntents = {
  info: '#0E5A8A',
  success: '#0A6640',
  pending: '#d1a036',
  warning: '#A66321',
  danger: '#A82A2A',
  muted: '#444444',
};

export const DEFAULT_THEME: IReqoreTheme = {
  main: '#333333',
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
};
