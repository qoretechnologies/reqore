export interface IReqoreTheme {
  main: string;
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
}

export const DEFAULT_THEME = {
  main: '#333',
};
