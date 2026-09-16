import { describe, expect, it } from 'vitest';
import { panelIsSmall } from '../src/components/Panel/responsive';

/**
 * The first paint of a panel must not be a narrow one.
 *
 * `useMeasure` reports `width: 0` until its ResizeObserver fires, one frame
 * after the first paint. `width < 480` alone was therefore true for EVERY panel
 * on its first render: each painted with its control buttons hidden and its
 * action groups wrapped, then snapped to the wide layout a frame later, moving
 * everything below it.
 *
 * Measured in the Qorus IDE's test editor before this: 33 elements jumped down
 * 51px in one frame when the case panel's action row appeared.
 */
describe('panelIsSmall', () => {
  it('is false before the panel has been measured', () => {
    // The whole bug: zero is the absence of a width, not a small one.
    expect(panelIsSmall(0, true)).toBe(false);
  });

  it('is true for a genuinely narrow measured panel', () => {
    expect(panelIsSmall(479, true)).toBe(true);
    expect(panelIsSmall(1, true)).toBe(true);
  });

  it('is false at and above the breakpoint', () => {
    expect(panelIsSmall(480, true)).toBe(false);
    expect(panelIsSmall(1198, true)).toBe(false);
  });

  it('is false whenever the panel opts out of a responsive title', () => {
    expect(panelIsSmall(100, false)).toBe(false);
    expect(panelIsSmall(0, false)).toBe(false);
  });
});
