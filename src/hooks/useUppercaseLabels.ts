import { useReqoreProperty } from './useReqoreContext';

/**
 * Whether the small labels Reqore names things with — a statistic's label, a menu heading,
 * a collection's group header, a switch's on / off text, a progress target, a data view's
 * type tag, a spacer's label — are tracked uppercase. `theme.uppercaseLabels`, decided once
 * for the whole app; `true` unless the theme says `false`.
 */
export const useUppercaseLabels = (): boolean =>
  useReqoreProperty('theme')?.uppercaseLabels !== false;
