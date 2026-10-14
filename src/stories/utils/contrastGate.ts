// Copyright 2026 Qore Technologies, s.r.o.
import axe from 'axe-core';

/**
 * Text and icons on a story's page that do not stand out from what they are drawn on (WCAG 2.1 AA), as the Qorus
 * IDE's story run checks its own (qorus#646: David's review found black text on dark gray). After each story has
 * settled, in the theme it runs in:
 *
 * - text by axe-core's `color-contrast` rule: 4.5:1, or 3:1 for large text. axe blends what it can (a translucent
 *   background over what is under it); text it cannot decide because it sits on a gradient is measured here
 *   against each color of the gradient, the worst of them counting;
 * - icons (an svg drawn in its element's color) at 3:1 against what they are drawn on (WCAG 1.4.11), which axe does
 *   not check: the element's own and its ancestors' backgrounds, layered as the browser draws them - a translucent
 *   color over what is under it, a gradient as each of its colors - with the opacity they are drawn at.
 *
 * Text and icons on an image, which cannot be told, are left alone, as is anything disabled, which WCAG exempts, and
 * anything not drawn (no size, hidden, or at no opacity).
 */

/** A color: red, green and blue (0 to 255) and alpha (0 to 1). */
export type TContrastColor = [number, number, number, number];

/** A color as `getComputedStyle` gives it (`rgb(…)`, `rgba(…)`, `transparent`), or undefined. */
export const parseColor = (value: string | undefined): TContrastColor | undefined => {
  if (!value) return undefined;
  if (value.trim() === 'transparent') return [0, 0, 0, 0];
  const match = /rgba?\(([^)]+)\)/.exec(value);
  if (!match) return undefined;
  const parts = match[1]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map((part) => (part.endsWith('%') ? Number(part.slice(0, -1)) / 100 : Number(part)));
  if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) return undefined;
  return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
};

const luminance = ([r, g, b]: TContrastColor): number => {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/** The contrast ratio of two opaque colors, 1 to 21. */
export const contrastRatio = (a: TContrastColor, b: TContrastColor): number => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

/** `top` drawn over `bottom`, by `top`'s alpha: an opaque color. */
export const over = (top: TContrastColor, bottom: TContrastColor): TContrastColor => {
  const alpha = top[3];
  return [
    top[0] * alpha + bottom[0] * (1 - alpha),
    top[1] * alpha + bottom[1] * (1 - alpha),
    top[2] * alpha + bottom[2] * (1 - alpha),
    1,
  ];
};

/** `top` drawn over `bottom`, both maybe translucent: the color the two are together (Porter-Duff "over"). */
export const composite = (top: TContrastColor, bottom: TContrastColor): TContrastColor => {
  const alpha = top[3] + bottom[3] * (1 - top[3]);
  if (alpha <= 0) return [0, 0, 0, 0];
  const channel = (index: number) =>
    (top[index] * top[3] + bottom[index] * bottom[3] * (1 - top[3])) / alpha;
  return [channel(0), channel(1), channel(2), alpha];
};

/** The colors of a gradient's stops, from a computed `background-image`; undefined for an image (`url(…)`). */
export const gradientColors = (image: string): TContrastColor[] | undefined => {
  if (!image || image === 'none') return [];
  if (/url\(/.test(image)) return undefined;
  return [...image.matchAll(/rgba?\([^)]+\)/g)]
    .map(([color]) => parseColor(color))
    .filter((color): color is TContrastColor => !!color);
};

/** Which way a linear gradient runs, where it is one of the four sides it can be followed exactly along. */
const linearAxis = (image: string): 'down' | 'up' | 'right' | 'left' | undefined => {
  if (!image.startsWith('linear-gradient(')) return undefined;
  const first = image.slice('linear-gradient('.length).split(',')[0].trim();
  if (/^(rgba?\(|transparent)/.test(first) || first === 'to bottom' || first === '180deg')
    return 'down';
  if (first === 'to top' || first === '0deg') return 'up';
  if (first === 'to right' || first === '90deg') return 'right';
  if (first === 'to left' || first === '270deg') return 'left';
  return undefined;
};

/** A gradient's stops with where each is (0 to 1): unplaced ones spread evenly between the placed ones around them. */
const placedStops = (image: string): { color: TContrastColor; at?: number }[] => {
  const stops = [...image.matchAll(/(rgba?\([^)]+\))(?:\s+(-?[\d.]+)%)?/g)].map(
    ([, color, at]) => ({
      color: parseColor(color)!,
      at: at === undefined ? undefined : Number(at) / 100,
    })
  );
  if (!stops.length) return stops;
  if (stops[0].at === undefined) stops[0].at = 0;
  if (stops[stops.length - 1].at === undefined) stops[stops.length - 1].at = 1;
  for (let index = 1; index < stops.length - 1; index++) {
    if (stops[index].at !== undefined) continue;
    const next = stops.findIndex((stop, after) => after > index && stop.at !== undefined);
    const from = stops[index - 1].at!;
    stops[index].at = from + (stops[next].at! - from) / (next - index + 1);
  }
  return stops;
};

/** The color a gradient's stops give at `at` (0 to 1), blended as the browser does (premultiplied by alpha). */
const colorAlong = (
  stops: { color: TContrastColor; at?: number }[],
  at: number
): TContrastColor => {
  const after = stops.findIndex((stop) => stop.at! >= at);
  if (after <= 0) return stops[after === 0 ? 0 : stops.length - 1].color;
  const [a, b] = [stops[after - 1], stops[after]];
  const t = b.at! === a.at! ? 1 : (at - a.at!) / (b.at! - a.at!);
  const alpha = a.color[3] + (b.color[3] - a.color[3]) * t;
  if (alpha <= 0) return [0, 0, 0, 0];
  const channel = (index: number) =>
    (a.color[index] * a.color[3] +
      (b.color[index] * b.color[3] - a.color[index] * a.color[3]) * t) /
    alpha;
  return [channel(0), channel(1), channel(2), alpha];
};

/**
 * The colors of a gradient where `target` is drawn on it: for a linear gradient running along a side, the colors
 * over the part of it the target covers (where it starts, where it ends and every stop between); otherwise - an
 * angle, a radial gradient, a target the painter has no size for - each of its colors. Undefined for an image.
 */
export const gradientColorsUnder = (
  image: string,
  painter: DOMRect,
  target: DOMRect
): TContrastColor[] | undefined => {
  const all = gradientColors(image);
  const axis = linearAxis(image);
  if (!all?.length || !axis) return all;
  const vertical = axis === 'down' || axis === 'up';
  const length = vertical ? painter.height : painter.width;
  if (!length) return all;
  const start = vertical ? target.top - painter.top : target.left - painter.left;
  const end = start + (vertical ? target.height : target.width);
  const clamp = (value: number) => Math.min(1, Math.max(0, value / length));
  const [from, to] =
    axis === 'down' || axis === 'right'
      ? [clamp(start), clamp(end)]
      : [1 - clamp(end), 1 - clamp(start)];
  const stops = placedStops(image);
  if (stops.length !== all.length) return all;
  return [
    colorAlong(stops, from),
    colorAlong(stops, to),
    ...stops.filter((stop) => stop.at! > from && stop.at! < to).map((stop) => stop.color),
  ];
};

const WHITE: TContrastColor = [255, 255, 255, 1];

/**
 * What is under everything an element's ancestors do not paint. A floating layer - a popover, a modal, a
 * notification in Reqore's portal - is not inside the app's layout, but it is drawn over it: what shows under it is
 * the layout's surface (`.reqore-layout-wrapper`), not the canvas. Without a layout, the canvas: white unless the
 * root or the body is painted (which the walk up has already met).
 */
const pageUnder = (): TContrastColor => {
  const layout = document.querySelector('.reqore-layout-wrapper');
  const color = layout ? parseColor(getComputedStyle(layout).backgroundColor) : undefined;
  return color && color[3] > 0 ? over(color, WHITE) : WHITE;
};

/** Keeps a list of candidate colors short: one per distinct (rounded) color. */
const distinct = (colors: TContrastColor[]): TContrastColor[] => {
  const seen = new Map<string, TContrastColor>();
  for (const color of colors) {
    seen.set(
      color.map((part, index) => (index === 3 ? part.toFixed(2) : Math.round(part))).join(','),
      color
    );
  }
  return [...seen.values()];
};

/** A background's image layers, top first: split at the commas between them, not at those inside one. */
export const layersOf = (image: string): string[] => {
  const layers: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < image.length; index++) {
    if (image[index] === '(') depth++;
    else if (image[index] === ')') depth--;
    else if (image[index] === ',' && depth === 0) {
      layers.push(image.slice(start, index).trim());
      start = index + 1;
    }
  }
  layers.push(image.slice(start).trim());
  return layers.filter((layer) => layer && layer !== 'none');
};

/** Whether each image layer of a style is drawn in its text (`background-clip: text`), top first. */
const textClippedLayers = (style: CSSStyleDeclaration, count: number): boolean[] => {
  const clips = (
    style.backgroundClip ||
    (style as CSSStyleDeclaration & { webkitBackgroundClip?: string }).webkitBackgroundClip ||
    ''
  )
    .split(',')
    .map((clip) => clip.trim());
  // CSS repeats a shorter list of clips over the layers
  return Array.from({ length: count }, (_, index) => clips[index % clips.length] === 'text');
};

/**
 * The colors an element paints under `target` (itself or one of what it holds): its background color, and over it
 * each of its image layers from the bottom up - a gradient as the colors it has where the target is drawn on it,
 * so an opaque layer on top (a button's fill over its ring) is all there is under the text. A layer drawn in the
 * letters (`background-clip: text`) is not under them. Undefined for an image.
 */
const paintOf = (element: Element, target: Element): TContrastColor[] | undefined => {
  const style = getComputedStyle(element);
  const layers = layersOf(style.backgroundImage);
  const inText = textClippedLayers(style, layers.length);
  let paint: TContrastColor[] = [parseColor(style.backgroundColor) ?? [0, 0, 0, 0]];
  const painter = element.getBoundingClientRect();
  const drawn = target.getBoundingClientRect();
  for (let index = layers.length - 1; index >= 0; index--) {
    if (inText[index]) continue;
    // a gradient as the colors it has where the target is drawn on it
    const stops = gradientColorsUnder(layers[index], painter, drawn);
    if (!stops) return undefined;
    paint = distinct(paint.flatMap((under) => stops.map((stop) => composite(stop, under))));
  }
  return paint;
};

/** The colors of the gradient an element draws its text in (`background-clip: text`); empty when it does not. */
export const textGradientOf = (element: Element): TContrastColor[] => {
  const style = getComputedStyle(element);
  const layers = layersOf(style.backgroundImage);
  const inText = textClippedLayers(style, layers.length);
  return layers.flatMap((layer, index) => (inText[index] ? (gradientColors(layer) ?? []) : []));
};

/** `color` faded to `opacity` over `below`: what a group drawn at that opacity shows. */
const fadedOver = (color: TContrastColor, opacity: number, below: TContrastColor): TContrastColor =>
  over([color[0], color[1], color[2], opacity], below);

/**
 * Every pair a mark (text, an icon) in one of `colors` is drawn as at `element`, and what it is drawn on there - as
 * the browser composes them: each ancestor's paint (`paintOf`) over what is under it, and an element drawn at an
 * opacity drawn as a whole - what it paints and everything in it, the mark too - then faded into what is under it.
 * A gradient is each of its colors, so there is a pair per color. Undefined over an image.
 */
export const drawnPairs = (
  element: Element,
  colors: TContrastColor[]
): [TContrastColor, TContrastColor][] | undefined => {
  const chain: { paint: TContrastColor[]; opacity: number }[] = [];
  for (let at: Element | null = element; at; at = at.parentElement) {
    const paint = paintOf(at, element);
    if (!paint) return undefined;
    chain.push({ paint, opacity: Number(getComputedStyle(at).opacity || 1) });
  }
  // what is under the outermost layer that hides everything under it: an opaque paint, not faded from there up
  let top = chain.length - 1;
  for (let index = 0; index < chain.length; index++) {
    const covers = chain[index].paint.every((color) => color[3] >= 1);
    if (covers && chain.slice(index).every((layer) => layer.opacity >= 1)) {
      top = index;
      break;
    }
  }
  const compose = (index: number, below: TContrastColor): [TContrastColor, TContrastColor][] => {
    const { paint, opacity } = chain[index];
    const pairs = paint.flatMap((color): [TContrastColor, TContrastColor][] => {
      const painted = over(color, below);
      return index === 0
        ? colors.map((mark): [TContrastColor, TContrastColor] => [over(mark, painted), painted])
        : compose(index - 1, painted);
    });
    const faded = pairs.map(([mark, background]): [TContrastColor, TContrastColor] =>
      opacity >= 1
        ? [mark, background]
        : [fadedOver(mark, opacity, below), fadedOver(background, opacity, below)]
    );
    const seen = new Map<string, [TContrastColor, TContrastColor]>();
    for (const pair of faded) {
      seen.set(pair.flat().map(Math.round).join(','), pair);
    }
    return [...seen.values()];
  };
  return compose(top, pageUnder());
};

/**
 * Every opaque color an element may be drawn on (`drawnPairs`): what it and its ancestors paint, layered and faded as
 * the browser draws them. A gradient is each of its colors, so an element over a gradient has one background per
 * color. Undefined over an image.
 */
export const backgroundsOf = (element: Element): TContrastColor[] | undefined =>
  drawnPairs(element, [[0, 0, 0, 0]])?.map(([, background]) => background);

/** The opacity an element is drawn at: its own and its ancestors', multiplied. */
export const opacityOf = (element: Element): number => {
  let opacity = 1;
  for (let at: Element | null = element; at; at = at.parentElement) {
    opacity *= Number(getComputedStyle(at).opacity || 1);
  }
  return opacity;
};

/**
 * Whether WCAG exempts an element: it is part of a control that is disabled, or decoration the page says is
 * decoration (`data-decorative`: a busy backdrop behind a frosted surface, say), which WCAG exempts too.
 */
export const isDisabled = (element: Element): boolean =>
  !!element.closest(
    '[disabled], [aria-disabled="true"], .reqore-disabled, [data-disabled="true"], .reqore-control-disabled, [data-decorative]'
  );

/** Whether an element is drawn at all: it has a size, is not hidden, and is not at no opacity. */
const isDrawn = (element: Element): boolean => {
  const box = element.getBoundingClientRect();
  if (!box.width || !box.height) return false;
  const style = getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none' && opacityOf(element) > 0;
};

/** Where an element is, for a message: its id and classes, up a few ancestors. */
export const whereIs = (element: Element): string => {
  const parts: string[] = [];
  for (let at: Element | null = element; at && parts.length < 3; at = at.parentElement) {
    const classes = Array.from(at.classList)
      .filter((name) => name.startsWith('reqore-') || name.startsWith('reqraft-'))
      .slice(0, 2);
    parts.unshift(
      `${at.tagName.toLowerCase()}${at.id ? `#${at.id}` : ''}${classes.map((name) => `.${name}`).join('')}`
    );
  }
  return parts.join(' > ');
};

/** The worst contrast of the pairs a mark is drawn as (`drawnPairs`). */
const worstContrast = (pairs: [TContrastColor, TContrastColor][]): number =>
  Math.min(...pairs.map(([mark, background]) => contrastRatio(mark, background)));

/** The icons a story draws: Reqore's, and any svg in an element named an icon. */
const ICONS = '.reqore-icon svg, svg.reqore-icon';

/** Each icon in `root` drawn in a color too close to what it is drawn on (under 3:1), with where it is. */
export const lowContrastIconsIn = (root: ParentNode = document.body): string[] => {
  const found: string[] = [];
  for (const icon of Array.from(root.querySelectorAll(ICONS))) {
    const holder = icon.closest('.reqore-icon') ?? icon;
    if (!isDrawn(holder) || isDisabled(holder)) continue;
    const style = getComputedStyle(icon);
    // an icon is painted in its fill, which is most often its text color (`currentColor`)
    const fill = style.fill;
    const color = parseColor(
      !fill || fill === 'none' || /currentcolor/i.test(fill) ? style.color : fill
    );
    const pairs = color ? drawnPairs(holder, [color]) : undefined;
    if (!pairs?.length) continue;
    const ratio = worstContrast(pairs);
    if (ratio < 3) {
      found.push(`icon at ${whereIs(holder)}: ${ratio.toFixed(2)}:1, under 3:1`);
    }
  }
  return [...new Set(found)];
};

/** Whether text is large in WCAG's sense: 24px, or 18.66px and bold. */
const isLargeText = (element: Element): boolean => {
  const style = getComputedStyle(element);
  const size = parseFloat(style.fontSize);
  return size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
};

/** The element whose gradient the text of `element` is drawn in (`background-clip: text`), if it is. */
const textGradientHolder = (element: Element): Element | undefined => {
  for (let at: Element | null = element; at; at = at.parentElement) {
    if (textGradientOf(at).length) return at;
  }
  return undefined;
};

/**
 * Text measured here rather than by axe: on a gradient (each of its colors under it counts), or drawn in one (each
 * of its colors counts as the text's - axe measures the color the letters are not drawn in). The worst pair counts.
 */
const measureText = (element: Element | null, where: string): string[] => {
  if (!element || isDisabled(element) || !isDrawn(element)) return [];
  const holder = textGradientHolder(element);
  const colors = holder
    ? textGradientOf(holder)
    : [parseColor(getComputedStyle(element).color)].filter(
        (color): color is TContrastColor => !!color
      );
  const pairs = colors.length ? drawnPairs(element, colors) : undefined;
  if (!pairs?.length) return [];
  const ratio = worstContrast(pairs);
  const expected = isLargeText(element) ? 3 : 4.5;
  return ratio < expected
    ? [
        `text "${(element.textContent ?? '').trim().slice(0, 60)}" at ${whereIs(element)}: ${where}, ${ratio.toFixed(2)}:1, under ${expected}:1`,
      ]
    : [];
};

/** Each piece of text in `root` too close to what it is drawn on, with where it is. */
export const lowContrastTextIn = async (root: Element = document.body): Promise<string[]> => {
  const results = await axe.run(root, {
    runOnly: { type: 'rule', values: ['color-contrast'] },
    resultTypes: ['violations', 'incomplete'],
  });
  const describe = (node: axe.NodeResult) => document.querySelector(String(node.target[0]));
  const violations = results.violations.flatMap((violation) =>
    violation.nodes.flatMap((node) => {
      const data = node.any[0]?.data as
        | {
            contrastRatio?: number;
            expectedContrastRatio?: string;
            fgColor?: string;
            bgColor?: string;
          }
        | undefined;
      const element = describe(node);
      // text drawn in a gradient: axe measured the color it is not drawn in
      if (element && textGradientHolder(element)) {
        return measureText(element, 'drawn in a gradient');
      }
      return [
        `text "${(element?.textContent ?? '').trim().slice(0, 60)}" at ${element ? whereIs(element) : node.target.join(' ')}: ${data?.fgColor} on ${data?.bgColor}, ${data?.contrastRatio}:1, under ${data?.expectedContrastRatio}`,
      ];
    })
  );
  // what axe could not decide because it is on a gradient: measured here, against each of the gradient's colors
  const onGradients = results.incomplete.flatMap((incomplete) =>
    incomplete.nodes.flatMap((node) => {
      if ((node.any[0]?.data as { messageKey?: string } | undefined)?.messageKey !== 'bgGradient')
        return [];
      const element = describe(node);
      return measureText(
        element,
        element && textGradientHolder(element) ? 'drawn in a gradient' : 'on a gradient'
      );
    })
  );
  return [...violations, ...onGradients];
};

/**
 * Every transition and finite animation running in the page, finished: a switch's knob sliding to its side, a color
 * fading to the one a state sets. Measured midway, a color is neither the one before nor the one after. Endless
 * animations (a spinner's) are left running; their colors do not change.
 */
export const animationsSettled = async (
  document: Document = globalThis.document
): Promise<void> => {
  if (typeof document.getAnimations !== 'function') {
    return;
  }
  const running = document.getAnimations().filter((animation) => {
    const end = animation.effect?.getComputedTiming().endTime;
    return animation.playState === 'running' && end !== undefined && Number.isFinite(Number(end));
  });
  await Promise.all(running.map((animation) => animation.finished.catch(() => undefined)));
};

/**
 * What on the page is text or an icon too close to what it is drawn on, once what is moving has settled; empty when
 * nothing is.
 */
export const lowContrastIn = async (root: Element = document.body): Promise<string[]> => {
  await animationsSettled(root.ownerDocument);
  return [...(await lowContrastTextIn(root)), ...lowContrastIconsIn(root)];
};
