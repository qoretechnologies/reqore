import { createContext } from 'use-context-selector';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';

export default createContext<IReqoreTheme>(DEFAULT_THEME);
