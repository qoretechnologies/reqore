export interface IReqoreTheme {
  main?: string;
  sidebar?: {
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
  };
  notifications?: {
    info?: IReqoreThemeNotification;
    success?: IReqoreThemeNotification;
    warning?: IReqoreThemeNotification;
    pending?: IReqoreThemeNotification;
    danger?: IReqoreThemeNotification;
  };
  popover?: {
    main: string;
  };
  header?: {
    main?: string;
    color?: string;
    border?: string;
    background?: string;
    hoverColor?: string;
  };
  footer?: {
    main?: string;
    color?: string;
    border?: string;
    background?: string;
    hoverColor?: string;
  };
}

export interface IReqoreThemeNotification {
  background: string;
  titleColor?: string;
  contentColor?: string;
  iconColor?: string;
}

export const DEFAULT_THEME: IReqoreTheme = {
  main: '#333333',
  notifications: {
    info: {
      background: '#bdebff',
    },
    success: {
      background: '#a7e38f',
    },
    pending: {
      background: '#f5efa2',
    },
    warning: {
      background: '#edcc93',
    },
    danger: {
      background: '#e3aa98',
    },
  },
};
