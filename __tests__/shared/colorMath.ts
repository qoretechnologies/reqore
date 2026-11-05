/**
 * Color maths the tests check Reqore's against, written independently of `src/helpers/colors` on purpose: a test
 * oracle that called the code it checks would agree with it whatever it did.
 */

/** Red, green, blue (0 to 255) and alpha (0 to 1). */
export type TRgba = [number, number, number, number];

/** A color as `getComputedStyle` gives it (`rgb(…)`, `rgba(…)`), as numbers. */
export const parse = (color: string): TRgba => {
  const [r, g, b, a = '1'] = color.match(/[\d.]+/g) as string[];

  return [Number(r), Number(g), Number(b), Number(a)];
};

/** A six-digit hex color (`#1a2b3c`) as numbers, opaque. */
export const fromHex = (color: string): TRgba => [
  parseInt(color.slice(1, 3), 16),
  parseInt(color.slice(3, 5), 16),
  parseInt(color.slice(5, 7), 16),
  1,
];

/** `color` (with its alpha, times `opacity`) drawn over the opaque `under`. */
export const over = (color: string | TRgba, under: TRgba, opacity = 1): TRgba => {
  const [r, g, b, a] = typeof color === 'string' ? parse(color) : color;
  const alpha = a * opacity;

  return [
    r * alpha + under[0] * (1 - alpha),
    g * alpha + under[1] * (1 - alpha),
    b * alpha + under[2] * (1 - alpha),
    1,
  ];
};

/** An opaque color as a six-digit hex. */
export const hex = ([r, g, b]: TRgba) =>
  `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}` as `#${string}`;

/** A computed color (`rgb(…)`, `rgba(…)`) as a six-digit hex, its alpha left out. */
export const hexOf = (color: string) => hex(parse(color));

/** The opacity an element is drawn at: its own and every ancestor's, multiplied. */
export const drawnOpacity = (element: Element) => {
  let opacity = 1;

  for (let at: Element | null = element; at; at = at.parentElement) {
    opacity *= Number(getComputedStyle(at).opacity || 1);
  }

  return opacity;
};
