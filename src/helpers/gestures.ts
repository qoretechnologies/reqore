/**
 * Pointer gestures: the thresholds every swipe in the library is judged by, and the judgement
 * itself. Shared so that a sheet pushed away, a tier stack swiped and whatever swipes next all
 * feel the same under the finger.
 */

/** What a swipe is judged by. */
export interface ISwipeThresholds {
  /** A swipe counts past this share of the swiped thing's size on the axis it moved along... */
  distance: number;
  /** ...or faster than this, in px per ms, in the direction it went. */
  velocity: number;
  /** How far a press moves, in px, before it is a drag and not a click. */
  slop: number;
}

/** The library's thresholds. */
export const SWIPE = {
  distance: 0.18,
  velocity: 0.35,
  slop: 8,
  /** How much a drag past a limit moves the thing, as a share of the drag. */
  resistance: 0.3,
} as const;

/**
 * What a released swipe along one axis did: `1` carried past the threshold in the positive
 * direction, `-1` in the negative, `0` neither — it was short and slow, or a click. It counts when
 * it went far enough (`distance` of `size`) or was quick enough (`velocity`, in the direction it
 * went). With no `size` to measure against, only a flick counts.
 */
export const getSwipeStep = (
  distance: number,
  velocity: number,
  size: number,
  thresholds: ISwipeThresholds = SWIPE
): -1 | 0 | 1 => {
  if (Math.abs(distance) < thresholds.slop) {
    return 0;
  }

  const far = size > 0 && Math.abs(distance) >= size * thresholds.distance;
  const fast =
    Math.abs(velocity) >= thresholds.velocity && Math.sign(velocity) === Math.sign(distance);

  if (!far && !fast) {
    return 0;
  }

  return distance < 0 ? -1 : 1;
};
