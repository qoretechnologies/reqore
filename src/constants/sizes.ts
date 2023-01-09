export type TSizes = 'tiny' | 'small' | 'normal' | 'big' | 'huge';
export type TWeights = 'soft' | 'normal' | 'heavy';

export const ReqoreSizes = {
  TINY: 'tiny',
  SMALL: 'small',
  NORMAL: 'normal',
  BIG: 'big',
  HUGE: 'huge',
};

export const SIZES = ['tiny', 'small', 'normal', 'big', 'huge'] as const;

export const SIZE_TO_NUMBER = {
  tiny: 1,
  small: 2,
  normal: 3,
  big: 4,
  huge: 5,
};

export const NUMBER_TO_SIZE = {
  1: 'tiny',
  2: 'small',
  3: 'normal',
  4: 'big',
  5: 'huge',
};

export const HEADER_SIZE_TO_NUMBER = {
  tiny: 5,
  small: 4,
  normal: 3,
  big: 2,
  huge: 1,
};

export const SIZE_TO_PX = {
  tiny: 10,
  small: 20,
  normal: 30,
  big: 40,
  huge: 50,
};

export const BADGE_SIZE_TO_PX = {
  tiny: 10,
  small: 18,
  normal: 24,
  big: 30,
  huge: 36,
};

export const TABS_SIZE_TO_PX = {
  tiny: 20,
  small: 30,
  normal: 40,
  big: 50,
  huge: 60,
};

export const TABLE_SIZE_TO_PX = {
  tiny: 20,
  small: 30,
  normal: 40,
  big: 50,
  huge: 60,
};

export const TABS_PADDING_TO_PX = {
  tiny: 5,
  small: 5,
  normal: 5,
  big: 5,
  huge: 5,
};

export const MARGIN_FROM_SIZE = {
  tiny: 0,
  small: 0,
  normal: 10,
  big: 20,
  huge: 30,
};

export const TEXT_FROM_SIZE = {
  tiny: 9,
  small: 12,
  normal: 15,
  big: 18,
  huge: 21,
};

export const ICON_FROM_SIZE = {
  tiny: 11,
  small: 14,
  normal: 17,
  big: 20,
  huge: 23,
};

export const PADDING_FROM_SIZE = {
  tiny: 5,
  small: 8,
  normal: 11,
  big: 14,
  huge: 17,
};

export const RADIUS_FROM_SIZE = {
  tiny: 1,
  small: 3,
  normal: 5,
  big: 7,
  huge: 9,
};

export const GAP_FROM_SIZE = {
  tiny: 1,
  small: 3,
  normal: 5,
  big: 18,
  huge: 30,
};

export const ICON_FROM_HEADER_SIZE = {
  1: 23,
  2: 20,
  3: 17,
  4: 14,
  5: 11,
  6: 8,
};

export const ICON_WRAPPER_FROM_HEADER_SIZE = {
  huge: 34,
  big: 26,
  normal: 19,
  small: 17,
  tiny: 15,
};

export const WEIGHT_TO_NUMBER = {
  thin: 100,
  light: 250,
  normal: 400,
  bold: 550,
  thick: 700,
};
