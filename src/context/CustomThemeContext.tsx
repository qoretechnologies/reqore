import { createContext } from 'use-context-selector';
import { IReqoreCustomTheme } from '../hooks/useTheme';

const CustomThemeContext = createContext<IReqoreCustomTheme | undefined>(undefined);

export default CustomThemeContext;
