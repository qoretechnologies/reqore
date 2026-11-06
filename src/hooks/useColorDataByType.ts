import { useReqoreProperty } from './useReqoreContext';

/**
 * Whether the data viewers colour keys and values by their type. `theme.colorDataByType`,
 * decided once for the whole app; `true` unless the theme says `false`.
 */
export const useColorDataByType = (): boolean =>
  useReqoreProperty('theme')?.colorDataByType !== false;
