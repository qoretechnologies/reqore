import { ThemeProvider } from 'styled-components';
import { useContext } from 'use-context-selector';
import { IReqoreTheme } from '../constants/theme';
import CustomThemeContext from '../context/CustomThemeContext';
import ThemeContext from '../context/ThemeContext';
import { IReqoreCustomTheme } from '../hooks/useTheme';

const ReqoreThemeProvider = ({
  children,
  theme,
  customTheme,
}: {
  children: any;
  theme?: IReqoreTheme;
  customTheme?: IReqoreCustomTheme;
}) => {
  const _theme: IReqoreTheme = useContext(ThemeContext);

  return (
    <CustomThemeContext.Provider value={customTheme}>
      <ThemeProvider theme={theme || _theme}>{children}</ThemeProvider>
    </CustomThemeContext.Provider>
  );
};

export default ReqoreThemeProvider;
