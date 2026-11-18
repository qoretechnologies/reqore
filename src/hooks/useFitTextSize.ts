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
   * How many lines the text may occupy. A label allowed to wrap keeps its natural size while
   * its words fit that many lines of `available` - wrapping is cheaper than shrinking, so it
   * happens first - and shrinks only to make them fit.
   *
   * The words are packed into lines the way the browser breaks them (greedily, at spaces), not
   * poured in as one run: "Design changes built" in a 98px box is 156px, under two lines' 196px,
   * but breaks "Design / changes / built" at 16px, so a clamp at two lines cut "built" from a
   * title kept at full size (the admin portal's 200px tile). Shrinking comes before cutting.
   *
   * @default 1
   */
  lines?: number;
  /** Off returns `max`. */
  enabled?: boolean;
}

/**
 * Whether words of these widths (in px at the size being tried) fit `lines` lines of
 * `available` when packed the way a browser breaks them: greedily, a word to the next line when
 * it does not fit beside the last. A word wider than a line on its own does not fit at all.
 *
 * One line keeps `FIT_TOLERANCE_PX` of slack, so a label that fits to the pixel is not shrunk
 * by one for nothing. Several lines get none: the browser breaks a line at its edge, so a word
 * judged to fit a line by a pixel of slack goes to the next one, and on the last line that is
 * the word the clamp cuts ("changes built" at 103px in a 102px line, the portal's tile).
 */
export const wordsFitLines = (
  words: number[],
  space: number,
  available: number,
  lines: number
): boolean => {
  const room = lines > 1 ? available : available + FIT_TOLERANCE_PX;
  let line = 1;
  let used = 0;

  for (const word of words) {
    if (word > room) {
      return false;
    }

    if (used === 0) {
      used = word;
    } else if (used + space + word <= room) {
      used += space + word;
    } else {
      line += 1;
      used = word;

      if (line > lines) {
        return false;
      }
    }
  }

  return true;
};

/**
 * The element that paints a text: the innermost first child under the measured box. A wrapper
 * inherits a normal weight while the heading inside it is bold, and the heading's own font is not
 * the text's either: a panel's `labelEffect` (a monospace family, a letter spacing) is drawn by the
 * span inside the heading. Measured with the heading's font, a monospace title was narrower on
 * paper than on screen, so the bar counted three lines for it beside its actions where it took two,
 * and put its actions under it (qlip-ui's review drawer on a phone, board f66).
 */
export const textPaintingElement = (node: HTMLElement): HTMLElement => {
  let element = node;

  while (element.firstElementChild instanceof HTMLElement) {
    element = element.firstElementChild;
  }

  return element;
};

/**
 * The size to draw a text at: `max` when its words fit `lines` lines of `available` there, else
 * the largest whole px down to `floor` at which they do, else `floor` (the clamp cuts what a
 * floored size still cannot hold). `words` and `space` are widths at `max`.
 */
export const largestFittingTextSize = ({
  words,
  space,
  available,
  max,
  floor,
  lines = 1,
}: {
  words: number[];
  space: number;
  available: number;
  max: number;
  floor: number;
  lines?: number;
}): number => {
  const capacity = Math.max(1, Math.floor(lines) || 1);
  const fitsAt = (size: number) => {
    const ratio = size / max;

    return wordsFitLines(
      words.map((word) => word * ratio),
      space * ratio,
      available,
      capacity
    );
  };

  if (fitsAt(max)) {
    return max;
  }

  // Whole px below the natural size: a size that is itself fractional (a type scale's 14.4)
  // still shrinks to whole px, which keeps snapshots stable across platforms.
  for (let size = Math.ceil(max) - 1; size >= floor; size -= 1) {
    if (fitsAt(size)) {
      return size;
    }
  }

  return floor;
};

/**
 * The largest whole px in `[min, max]` at which `text` fits `available`.
 *
 * Each word is measured once, at the natural size: text width is linear in font size, so a
 * smaller size is arithmetic on those widths, packed into lines the way the browser breaks
 * them (`largestFittingTextSize`), with no further measuring.
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

    // The font comes from the element that PAINTS the text (`textPaintingElement`): measuring
    // the wrong weight or family picks a size that still clips.
    const style = getComputedStyle(textPaintingElement(node));
    // Letter-spacing is not part of the canvas font shorthand, so it is added back per
    // character. A spaced heading measured without it fits on paper and clips in the DOM.

    context.font = `${style.fontStyle} ${style.fontWeight} ${max}px ${style.fontFamily}`;
    const letterSpacing = parseFloat(style.letterSpacing) || 0;
    // Each word measured once, at the natural size; text width is linear in the font size, so
    // every smaller size is these times its ratio.
    const words = text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => context.measureText(word).width + letterSpacing * word.length);
    const space = context.measureText(' ').width + letterSpacing;

    setSize(largestFittingTextSize({ words, space, available, max, floor, lines }));
  }, [text, available, max, floor, lines, enabled]);

  return [ref, size];
};
