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

export const SIZE_TO_MODIFIER = {
  tiny: 0.6,
  small: 0.8,
  normal: 1,
  big: 1.2,
  huge: 1.4,
};

export const LINE_SIZE_TO_NUMBER = {
  none: 0,
  tiny: 1,
  small: 1,
  normal: 1.5,
  big: 2,
  huge: 3,
};

export const SIZE_TO_NUMBER = {
  none: 0,
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
  tiny: 26,
  small: 32,
  normal: 38,
  big: 48,
  huge: 58,
};

export const TAG_SIZE_TO_PX = {
  tiny: 14,
  small: 20,
  normal: 26,
  big: 42,
  huge: 52,
};

export const BADGE_SIZE_TO_PX = {
  tiny: 14,
  small: 20,
  normal: 26,
  big: 32,
  huge: 38,
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

export const TAG_HORIZONTAL_PADDING_FROM_SIZE = {
  tiny: 3,
  small: 5,
  normal: 6,
  big: 9,
  huge: 13,
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

export const CONTROL_TEXT_FROM_SIZE = {
  tiny: 9,
  small: 12,
  normal: 14,
  big: 17,
  huge: 20,
};

export const TAG_TEXT_FROM_SIZE = {
  tiny: 8,
  small: 11,
  normal: 14,
  big: 17,
  huge: 19,
};

export const TAG_ICON_FROM_SIZE = {
  tiny: 10,
  small: 13,
  normal: 16,
  big: 19,
  huge: 22,
};

export const ICON_FROM_SIZE = {
  tiny: 13,
  small: 17,
  normal: 20,
  big: 26,
  huge: 33,
};

export const HALF_PADDING_FROM_SIZE = {
  tiny: 2,
  small: 3,
  normal: 4,
  big: 5.5,
  huge: 7,
};

export const PADDING_FROM_SIZE = {
  tiny: 4,
  small: 6,
  normal: 8,
  big: 11,
  huge: 14,
};

export const TEXTAREA_PADDING_FROM_SIZE = {
  tiny: 2,
  small: 5.5,
  normal: 6,
  big: 9,
  huge: 12,
};

export const CONTROL_HORIZONTAL_PADDING_FROM_SIZE = {
  tiny: 9,
  small: 12,
  normal: 14,
  big: 17,
  huge: 21,
};

export const CONTROL_VERTICAL_PADDING_FROM_SIZE = {
  tiny: 6,
  small: 8,
  normal: 10,
  big: 13,
  huge: 16,
};

export const CONTROL_VERTICAL_PADDING_MODIFIER_FROM_SIZE = {
  tiny: -4,
  small: -2,
  normal: 0,
  big: 3,
  huge: 6,
};

export const RADIUS_FROM_SIZE = {
  tiny: 2,
  small: 3,
  normal: 4.5,
  big: 6,
  huge: 8,
};

export const TAG_RADIUS_FROM_SIZE = {
  tiny: 2,
  small: 3,
  normal: 5,
  big: 7,
  huge: 9,
};

export const BADGE_RADIUS_FROM_SIZE = {
  tiny: 6,
  small: 7,
  normal: 9,
  big: 11,
  huge: 13,
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
  bold: 500,
  thick: 600,
};

export const PILL_RADIUS_MODIFIER = 3.5;
