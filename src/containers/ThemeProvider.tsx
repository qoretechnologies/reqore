import { ThemeProvider } from 'styled-components';
import { useContext } from 'use-context-selector';
import { IReqoreTheme } from '../constants/theme';
import ThemeContext from '../context/ThemeContext';

const ReqoreThemeProvider = ({ children, theme }: { children: any; theme?: IReqoreTheme }) => {
  const _theme: IReqoreTheme = useContext(ThemeContext);

  return <ThemeProvider theme={theme || _theme}>{children}</ThemeProvider>;
};

export default ReqoreThemeProvider;
