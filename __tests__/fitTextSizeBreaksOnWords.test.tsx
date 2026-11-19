/**
 * A title allowed to wrap shrinks to fit its WORDS into its lines, not its length.
 *
 * `useFitTextSize` poured the text into `available * lines` as one run: "Design changes built" is
 * 160px at 16px, under two 98px lines' 196px, so it kept 16px. But a line breaks on a word, and
 * the words break "Design / changes / built" - three lines, and the clamp at two cut "built" from
 * a title at full size (the admin portal's 200px tile, 17 Nov). Decision 029: a title wraps, then
 * shrinks, then is cut. It now packs the words the way the browser does, and shrinks before the
 * clamp has to cut.
 */
import { render } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  largestFittingTextSize,
  textPaintingElement,
  useFitTextSize,
  wordsFitLines,
} from '../src/hooks/useFitTextSize';

/** Every character 8px wide at the natural size, a space included. */
const CHARACTER_PX = 8;

const Probe = ({
  text,
  available,
  lines,
  onSize,
}: {
  text: string;
  available: number;
  lines: number;
  onSize: (size: number) => void;
}) => {
  const [ref, size] = useFitTextSize<HTMLDivElement>({ text, available, max: 16, min: 11, lines });

  useEffect(() => {
    onSize(size);
  }, [size, onSize]);

  return (
    <div ref={ref}>
      <span>{text}</span>
    </div>
  );
};

const sizeOf = (text: string, available: number, lines: number) => {
  let size = 0;

  render(<Probe text={text} available={available} lines={lines} onSize={(s) => (size = s)} />);

  return size;
};

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () =>
      ({
        font: '',
        measureText: (text: string) => ({ width: text.length * CHARACTER_PX }),
      }) as unknown as CanvasRenderingContext2D
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useFitTextSize with more than one line', () => {
  it('shrinks a title whose words break onto a third line, though its length fits two', () => {
    // 160px of text in two 98px lines: 196px by length, but "changes built" is 104px.
    expect(sizeOf('Design changes built', 98, 2)).toBe(15);
  });

  it('keeps the natural size when the words fit the lines there', () => {
    // "Design" / "changes" in two 98px lines: wrapping, not shrinking.
    expect(sizeOf('Design changes', 98, 2)).toBe(16);
  });

  it('fits one line as before: the largest whole px at which the text fits', () => {
    // 160px in 98px (+2px tolerance): floor(100 / 160 * 16) = 10, held at the 11px floor.
    expect(sizeOf('Design changes built', 98, 1)).toBe(11);
    // 112px in 98px: floor(100 / 112 * 16) = 14.
    expect(sizeOf('Design changes', 98, 1)).toBe(14);
  });
});

describe('largestFittingTextSize', () => {
  it('goes to the floor for a word wider than a line even there', () => {
    expect(
      largestFittingTextSize({ words: [300], space: 8, available: 98, max: 16, floor: 11, lines: 2 })
    ).toBe(11);
  });

  it('shrinks a fractional natural size to whole px', () => {
    // At 14.4 the words take three lines; at 14 they take two.
    const size = largestFittingTextSize({
      words: [48, 56, 40],
      space: 8,
      available: 98,
      max: 16 * 0.9,
      floor: 11,
      lines: 2,
    });

    expect(Number.isInteger(size)).toBe(true);
    expect(size).toBeLessThan(14.4);
  });

  it('packs greedily, as a browser breaks a line', () => {
    expect(wordsFitLines([48, 56, 40], 8, 98, 2)).toBe(false);
    expect(wordsFitLines([48, 56, 40], 8, 98, 3)).toBe(true);
    expect(wordsFitLines([45, 52.5, 37.5], 7.5, 98, 2)).toBe(true);
  });

  it('breaks a line at its edge, with no slack, when the text may wrap', () => {
    // Measured in Chromium (Helvetica Neue 600 16px): "changes built" is 103.1px, and the
    // browser puts "built" on a third line of a 102px box. Two px of slack said it fit.
    expect(wordsFitLines([53.34, 64.91, 33.77], 4.45, 102, 2)).toBe(false);
  });

  it('keeps the slack on one line, so a label that fits to the pixel is not shrunk', () => {
    expect(wordsFitLines([100], 0, 98, 1)).toBe(true);
  });
});

describe('the font a title is measured in', () => {
  // A panel's title: the measured box, the heading in it, and the span that paints the words with the
  // panel's `labelEffect` (a monospace family). Measured with the heading's font, a monospace title
  // counted its lines wrong beside its actions (qlip-ui's review drawer at 375px, board f66).
  it("is the span's that paints the words, not the heading's", () => {
    const box = document.createElement('div');
    box.innerHTML =
      '<h3 style="font-family: sans-serif"><span style="font-family: monospace">Example/ProfileBadge</span></h3>';

    expect(textPaintingElement(box)).toBe(box.querySelector('span'));
    expect(getComputedStyle(textPaintingElement(box)).fontFamily).toBe('monospace');
  });

  it('is the box itself when it holds the words directly', () => {
    const box = document.createElement('div');
    box.textContent = 'Visitors';

    expect(textPaintingElement(box)).toBe(box);
  });
});

// A title kept to one line for icons, which may otherwise wrap, keeps a pixel spare (queue item 28).
describe('the slack of a one-line fit', () => {
  test('lets a line run 2px past its room by default', () => {
    expect(wordsFitLines([100], 4, 99, 1)).toBe(true);
  });

  test('can ask for a pixel spare instead', () => {
    expect(wordsFitLines([100], 4, 99, 1, -1)).toBe(false);
    expect(wordsFitLines([100], 4, 101, 1, -1)).toBe(true);
    expect(
      largestFittingTextSize({ words: [100], space: 4, available: 99, max: 20, floor: 12, slack: -1 })
    ).toBeLessThan(20);
    expect(largestFittingTextSize({ words: [100], space: 4, available: 99, max: 20, floor: 12 })).toBe(
      20
    );
  });
});
