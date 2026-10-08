/**
 * The swipe judgement every swipe in the library shares (`helpers/gestures`): a sheet pushed
 * away and the tier stack both decide "did that count?" here, so the thresholds are pinned once.
 */
import { describe, expect, it } from 'vitest';
// The package index first: the Tier module is reached through it, and reached directly it
// evaluates ahead of the styled primitives it builds on.
import { SWIPE } from '../src';
import { getTierSwipeStep, TIER_STACK } from '../src/components/Tier/group';
import { getSwipeStep } from '../src/helpers/gestures';

const size = 300;
const far = size * SWIPE.distance + 1;

describe('getSwipeStep', () => {
  it('pins the thresholds', () => {
    expect(SWIPE).toEqual({ distance: 0.18, velocity: 0.35, slop: 8, resistance: 0.3 });
  });

  it('is the sign of a drag that went far enough along the axis', () => {
    expect(getSwipeStep(far, 0, size)).toBe(1);
    expect(getSwipeStep(-far, 0, size)).toBe(-1);
    expect(getSwipeStep(far - 2, 0, size)).toBe(0);
    expect(getSwipeStep(-(far - 2), 0, size)).toBe(0);
  });

  it('or of a flick, however short, in the direction it went', () => {
    expect(getSwipeStep(30, SWIPE.velocity, size)).toBe(1);
    expect(getSwipeStep(-30, -SWIPE.velocity, size)).toBe(-1);
    // Fast the other way: the finger came back before letting go.
    expect(getSwipeStep(30, -SWIPE.velocity, size)).toBe(0);
    // Short and not fast enough.
    expect(getSwipeStep(30, SWIPE.velocity - 0.05, size)).toBe(0);
  });

  it('a press that moved less than the slop is a click, however fast', () => {
    expect(getSwipeStep(SWIPE.slop - 1, 5, size)).toBe(0);
    expect(getSwipeStep(-(SWIPE.slop - 1), -5, size)).toBe(0);
  });

  it('with no size to measure against, only a flick counts', () => {
    expect(getSwipeStep(200, 0, 0)).toBe(0);
    expect(getSwipeStep(200, 1, 0)).toBe(1);
  });

  it('judges by the thresholds it is given', () => {
    const strict = { distance: 0.5, velocity: 1, slop: 20 };

    expect(getSwipeStep(far, 0, size, strict)).toBe(0);
    expect(getSwipeStep(size * 0.5, 0, size, strict)).toBe(1);
    expect(getSwipeStep(30, 0.9, size, strict)).toBe(0);
    expect(getSwipeStep(30, 1, size, strict)).toBe(1);
    expect(getSwipeStep(19, 5, size, strict)).toBe(0);
  });

  it('is what the tier stack swipes by, read against the finger', () => {
    expect(TIER_STACK.swipeDistance).toBe(SWIPE.distance);
    expect(TIER_STACK.swipeVelocity).toBe(SWIPE.velocity);
    expect(TIER_STACK.slop).toBe(SWIPE.slop);
    expect(TIER_STACK.resistance).toBe(SWIPE.resistance);
    // Dragged to the left, the NEXT tier comes to the front.
    expect(getTierSwipeStep(-far, 0, size)).toBe(1);
    expect(getTierSwipeStep(far, 0, size)).toBe(-1);
    expect(getTierSwipeStep(30, 0, size)).toBe(0);
  });
});
