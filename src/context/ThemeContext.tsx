import { createContext } from 'react';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';

export default createContext<IReqoreTheme>(DEFAULT_THEME);
