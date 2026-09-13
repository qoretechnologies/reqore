import { useEffect, useRef, useState } from 'react';

/**
 * The smallest a label may shrink to, as a fraction of its natural size.
 *
 * Shrinking is worth doing only while the result still reads as a heading — past roughly two
 * thirds it becomes fine print, and ellipsizing a legible label beats keeping every character
 * at a size nobody reads.
 */
export const FIT_TEXT_MIN_RATIO = 0.65;

/** Never shrink below this, whatever the ratio works out to. */
export const FIT_TEXT_FLOOR_PX = 11;

/**
 * Rounding slack, in px. Sub-pixel layout and text measurement disagree by a fraction, and
 * without slack a label that fits exactly is shrunk by a pixel for no visible reason.
 */
const FIT_TOLERANCE_PX = 2;

export interface IUseFitTextSizeOptions {
  /** The string being measured. */
  text: string;
  /**
   * Space the text has, in px. The CALLER measures this, and it must not be derived from the
   * text: a box that sizes to its own content makes the calculation circular — shrinking the
   * font shrinks the box, which asks for another shrink, and the size ratchets to the floor on
   * the first narrow render and never comes back.
   *
   * `undefined` means "not measured yet" and keeps the natural size.
   */
  available?: number;
  /** Natural size in px — used when the text fits, and the ceiling. */
  max: number;
  /** Floor in px. Defaults to `max * FIT_TEXT_MIN_RATIO`, never below `FIT_TEXT_FLOOR_PX`. */
  min?: number;
  /**
   * How many lines the text may occupy. The fit measures against `available * lines`, so a
   * label allowed to wrap keeps its natural size until it overruns BOTH lines — wrapping is
   * cheaper than shrinking, so it should happen first.
   *
   * A first-order approximation: a wrapped line breaks on a word and rarely fills to its last
   * pixel, so the real capacity is a little under this. Being slightly optimistic is the right
   * side to err on — whatever still overflows is ellipsized by the clamp, which is the end of
   * the cascade anyway.
   *
   * @default 1
   */
  lines?: number;
  /** Off returns `max`. */
  enabled?: boolean;
}

/**
 * The largest whole px in `[min, max]` at which `text` fits `available`.
 *
 * Ratio, not search. Text width is linear in font size, so one measurement answers it:
 * `size = available / widthAtMax * max`, clamped — the same arithmetic
 * [fitty](https://github.com/rikschennink/fitty) settles on, where a binary search would take
 * ~10 iterations to reach the same number.
 *
 * Measured with `canvas.measureText` against the font of the element that PAINTS the text, so
 * there is no write-then-read cycle at all — the layout thrashing that makes fit-to-width
 * implementations janky comes from applying a size and measuring the result, and this never
 * applies anything to measure it. Returning a whole px keeps snapshots stable across platforms.
 *
 * Returns a ref to put on the text element (for its font) and the size.
 */
export const useFitTextSize = <T extends HTMLElement = HTMLDivElement>({
  text,
  available,
  max,
  min,
  lines = 1,
  enabled = true,
}: IUseFitTextSizeOptions): [React.MutableRefObject<T | null>, number] => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState(max);
  /** Reused: allocating a canvas per measurement is the expensive part. */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const floor = Math.max(min ?? Math.round(max * FIT_TEXT_MIN_RATIO), FIT_TEXT_FLOOR_PX);

  useEffect(() => {
    const node = ref.current;

    if (!enabled || !node || !text || !available) {
      setSize(max);

      return;
    }

    canvasRef.current = canvasRef.current || document.createElement('canvas');
    const context = canvasRef.current.getContext('2d');

    if (!context) {
      setSize(max);

      return;
    }

    // The font comes from the element that PAINTS the text: a wrapper inherits a normal
    // weight while the heading inside it is bold, and measuring the wrong weight picks a size
    // that still clips.
    const style = getComputedStyle((node.firstElementChild as HTMLElement) || node);
    // Letter-spacing is not part of the canvas font shorthand, so it is added back per
    // character. A spaced heading measured without it fits on paper and clips in the DOM.
    const spacing = (parseFloat(style.letterSpacing) || 0) * text.length;

    context.font = `${style.fontStyle} ${style.fontWeight} ${max}px ${style.fontFamily}`;
    const widthAtMax = context.measureText(text).width + spacing;
    // The budget is the row width times the number of lines the label may use: the text is
    // one continuous run being poured into `lines` boxes of `available` each.
    const budget = available * Math.max(1, lines) + FIT_TOLERANCE_PX;

    if (widthAtMax <= budget) {
      setSize(max);

      return;
    }

    setSize(Math.max(floor, Math.min(max, Math.floor((budget / widthAtMax) * max))));
  }, [text, available, max, floor, lines, enabled]);

  return [ref, size];
};
