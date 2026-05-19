export type TSizes = 'micro' | 'tiny' | 'small' | 'normal' | 'big' | 'huge' | 'massive';
export type TWeights = 'soft' | 'normal' | 'heavy';

export const ReqoreSizes = {
  MICRO: 'micro',
  TINY: 'tiny',
  SMALL: 'small',
  NORMAL: 'normal',
  BIG: 'big',
  HUGE: 'huge',
  MASSIVE: 'massive',
};

export const SIZES = ['micro', 'tiny', 'small', 'normal', 'big', 'huge', 'massive'] as const;

export const SIZE_TO_MODIFIER = {
  micro: 0.6,
  tiny: 0.7,
  small: 0.9,
  normal: 1,
  big: 1.1,
  huge: 1.2,
  massive: 1.4,
};

export const LINE_SIZE_TO_NUMBER = {
  none: 0,
  micro: 0.5,
  tiny: 1,
  small: 1,
  normal: 1.5,
  big: 2,
  huge: 3,
  massive: 4,
};

export const SIZE_TO_NUMBER = {
  none: 0,
  micro: 1,
  tiny: 2,
  small: 3,
  normal: 4,
  big: 5,
  huge: 6,
  massive: 7,
};

export const NUMBER_TO_SIZE = {
  1: 'micro',
  2: 'tiny',
  3: 'small',
  4: 'normal',
  5: 'big',
  6: 'huge',
  7: 'massive',
};

export const HEADER_SIZE_TO_NUMBER = {
  micro: 6,
  tiny: 5,
  small: 4,
  normal: 3,
  big: 2,
  huge: 1,
  massive: 1,
};

export const SWITCH_SIZE_TO_PX = {
  micro: 16,
  tiny: 20,
  small: 26,
  normal: 32,
  big: 38,
  huge: 48,
  massive: 56,
};

export const SIZE_TO_PX = {
  micro: 22,
  tiny: 26,
  small: 32,
  normal: 38,
  big: 48,
  huge: 58,
  massive: 68,
};

export const TAG_SIZE_TO_PX = {
  micro: 10,
  tiny: 14,
  small: 20,
  normal: 26,
  big: 42,
  huge: 52,
  massive: 62,
};

export const BADGE_SIZE_TO_PX = {
  micro: 14,
  tiny: 17,
  small: 20,
  normal: 26,
  big: 32,
  huge: 38,
  massive: 44,
};

export const TABS_SIZE_TO_PX = {
  micro: 16,
  tiny: 20,
  small: 30,
  normal: 40,
  big: 50,
  huge: 60,
  massive: 70,
};

export const TABLE_SIZE_TO_PX = SIZE_TO_PX;

export const TABS_PADDING_TO_PX = {
  micro: 5,
  tiny: 5,
  small: 5,
  normal: 5,
  big: 5,
  huge: 5,
  massive: 5,
};

export const TAG_HORIZONTAL_PADDING_FROM_SIZE = {
  micro: 2,
  tiny: 3,
  small: 5,
  normal: 6,
  big: 9,
  huge: 13,
  massive: 17,
};

export const MARGIN_FROM_SIZE = {
  micro: 0,
  tiny: 0,
  small: 0,
  normal: 10,
  big: 20,
  huge: 30,
  massive: 40,
};

export const TEXT_FROM_SIZE = {
  micro: 7,
  tiny: 9,
  small: 12,
  normal: 15,
  big: 18,
  huge: 21,
  massive: 24,
};

export const CONTROL_TEXT_FROM_SIZE = {
  micro: 7,
  tiny: 9,
  small: 12,
  normal: 14,
  big: 17,
  huge: 20,
  massive: 23,
};

export const TAG_TEXT_FROM_SIZE = {
  micro: 8,
  tiny: 10,
  small: 13,
  normal: 15,
  big: 18,
  huge: 21,
  massive: 24,
};

export const TAG_ICON_FROM_SIZE = {
  micro: 10,
  tiny: 12,
  small: 14,
  normal: 16,
  big: 19,
  huge: 22,
  massive: 25,
};

export const ICON_FROM_SIZE = {
  micro: 10,
  tiny: 13,
  small: 17,
  normal: 20,
  big: 26,
  huge: 33,
  massive: 40,
};

export const HALF_PADDING_FROM_SIZE = {
  micro: 1.5,
  tiny: 2,
  small: 3,
  normal: 4,
  big: 5.5,
  huge: 7,
  massive: 8.5,
};

export const PADDING_FROM_SIZE = {
  micro: 3,
  tiny: 4,
  small: 6,
  normal: 8,
  big: 11,
  huge: 14,
  massive: 17,
};

export const SPECIAL_PADDING_FROM_SIZE = {
  micro: 3,
  tiny: 4,
  small: 6,
  normal: 8,
  big: 15,
  huge: 28,
  massive: 40,
};

export const TEXTAREA_PADDING_FROM_SIZE = {
  micro: 1.5,
  tiny: 2,
  small: 5.5,
  normal: 6,
  big: 9,
  huge: 12,
  massive: 15,
};

export const CONTROL_HORIZONTAL_PADDING_FROM_SIZE = {
  micro: 7,
  tiny: 9,
  small: 12,
  normal: 14,
  big: 17,
  huge: 21,
  massive: 25,
};

export const CONTROL_VERTICAL_PADDING_FROM_SIZE = {
  micro: 4,
  tiny: 5,
  small: 6,
  normal: 8,
  big: 11,
  huge: 14,
  massive: 17,
};

export const CONTROL_VERTICAL_PADDING_MODIFIER_FROM_SIZE = {
  micro: -5,
  tiny: -4,
  small: -2,
  normal: 0,
  big: 3,
  huge: 6,
  massive: 9,
};

export const RADIUS_FROM_SIZE = {
  micro: 3,
  tiny: 4,
  small: 4,
  normal: 5,
  big: 6,
  huge: 8,
  massive: 10,
};

/**
 * Scale used when a component receives an explicit `radiusSize` prop.
 * Decoupled from `RADIUS_FROM_SIZE` so consumers can opt into a more
 * pronounced corner curve (marketing surfaces, hero cards, …) without
 * changing the default look of every Reqore component.
 */
export const RADIUS_FROM_RADIUS_SIZE = {
  micro: 3,
  tiny: 5,
  small: 8,
  normal: 12,
  big: 18,
  huge: 26,
  massive: 36,
};

/**
 * Resolve the border-radius pixel value for a component.
 * - When `radiusSize` is set, picks from the pronounced `radiusScale`.
 * - Otherwise falls back to the default `sizeScale[size]`.
 *
 * Most components use `RADIUS_FROM_SIZE` + `RADIUS_FROM_RADIUS_SIZE`, but
 * Tag/Badge ship their own scales (`TAG_RADIUS_FROM_*`, `BADGE_RADIUS_FROM_*`)
 * and pass those in instead.
 */
export const resolveRadius = (
  size: TSizes,
  radiusSize: TSizes | undefined,
  sizeScale: Record<TSizes, number> = RADIUS_FROM_SIZE,
  radiusScale: Record<TSizes, number> = RADIUS_FROM_RADIUS_SIZE
): number => (radiusSize ? radiusScale[radiusSize] : sizeScale[size]);

export const TAG_RADIUS_FROM_SIZE = {
  micro: 1,
  tiny: 2,
  small: 3,
  normal: 5,
  big: 7,
  huge: 9,
  massive: 11,
};

/** More pronounced radius for `radiusSize`-driven tag corners. */
export const TAG_RADIUS_FROM_RADIUS_SIZE = {
  micro: 2,
  tiny: 4,
  small: 6,
  normal: 9,
  big: 14,
  huge: 20,
  massive: 28,
};

export const BADGE_RADIUS_FROM_SIZE = {
  micro: 5,
  tiny: 6,
  small: 7,
  normal: 9,
  big: 11,
  huge: 13,
  massive: 15,
};

/** More pronounced radius for `radiusSize`-driven badge corners. */
export const BADGE_RADIUS_FROM_RADIUS_SIZE = {
  micro: 6,
  tiny: 8,
  small: 12,
  normal: 16,
  big: 20,
  huge: 26,
  massive: 32,
};

export const GAP_FROM_SIZE = {
  micro: 0.5,
  tiny: 1,
  small: 3,
  normal: 5,
  big: 18,
  huge: 30,
  massive: 42,
};

export const RATING_GAP_FROM_SIZE = {
  micro: 0.5,
  tiny: 1,
  small: 3,
  normal: 5,
  big: 7,
  huge: 9,
  massive: 12,
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
  massive: 38,
  huge: 34,
  big: 26,
  normal: 19,
  small: 17,
  tiny: 15,
  micro: 13,
};

export const WEIGHT_TO_NUMBER = {
  thin: 100,
  light: 250,
  normal: 400,
  bold: 500,
  thick: 600,
};

export const PILL_RADIUS_MODIFIER = 3.5;

export const PROGRESS_HEIGHT_FROM_SIZE = {
  micro: 2,
  tiny: 3,
  small: 4,
  normal: 6,
  big: 8,
  huge: 10,
  massive: 14,
};
