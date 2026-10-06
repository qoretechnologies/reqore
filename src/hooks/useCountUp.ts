import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

/**
 * How a number counts up to its value. `true` takes every default.
 */
export interface IReqoreCountUpOptions {
  /** How long the count takes, in milliseconds. Default `1000`; `0` shows the value at once. */
  duration?: number;
  /** The number the count starts from. Default `0`. */
  from?: number;
  /**
   * How much of the number has to be on screen before it starts, from `0` to `1` (the
   * IntersectionObserver threshold). Default `0.35`.
   */
  threshold?: number;
  /**
   * Formats every frame, the last one included. Without it a frame keeps the value's own
   * format: its decimals, its thousands separator and the text around the number.
   */
  format?: (value: number) => string;
}

/** A value that can count up: one number, the text around it and how it is written. */
export interface IReqoreCountUpValue {
  /** Text before the number (a currency sign, a `~`). */
  prefix: string;
  /** Text after the number (a unit, a `%`). */
  suffix: string;
  /** The number itself, signed. */
  target: number;
  /** Digits after the decimal separator. */
  decimals: number;
  /** The thousands separator, or `''` when the value has none. */
  group: string;
  /** The decimal separator. */
  decimal: string;
  /** How a negative number is signed: `-` or the minus sign `−`. */
  minus: string;
}

const COUNT_UP_DEFAULTS = {
  duration: 1000,
  from: 0,
  threshold: 0.35,
};

const THRESHOLD_TOLERANCE = 0.01;

/** Separators a thousands group may be written with: comma, dot and the spaces. */
const SPACES = [' ', '\u00a0', '\u202f'];

/** A letter (anything with a case) or a digit: what a hyphen joins in a word like "COVID-19". */
const isWordCharacter = (character: string) =>
  /\d/.test(character) || character.toLowerCase() !== character.toUpperCase();

const isGroupRun = (groups: string[]) =>
  groups[0].length >= 1 &&
  groups[0].length <= 3 &&
  groups.slice(1).every((group) => group.length === 3);

/**
 * Read a statistic's value as the one number it shows, or `undefined` when it does not show
 * exactly one: `'1,234'`, `'$1.2M'`, `'99.8%'`, `'1.234,5'`, `'10 000'` and `-12` count up;
 * `'2–4'`, `'24/7'`, `'Q3 2026'`, `'N/A'` and `'1e21'` do not.
 *
 * A separator is read the way English writes numbers unless the value says otherwise: one
 * `.` is a decimal point (`'1.234'` is one and a bit) and a `,` before exactly three digits is
 * a thousands separator (`'1,234'` is one thousand and more). With both, the last one is the
 * decimal separator (`'1.234,5'`). A value written another way can pass a `format`.
 */
export const parseCountUpValue = (value: string | number): IReqoreCountUpValue | undefined => {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return undefined;
  }

  const text = String(value);

  // An exponent is two numbers as far as the text goes, and no one counts up to 1e21.
  if (typeof value === 'number' && /e/i.test(text)) {
    return undefined;
  }

  const tokens = text.match(/\d+(?:[.,\u00a0\u202f ]\d+)*/g);

  if (!tokens || tokens.length !== 1) {
    return undefined;
  }

  const [token] = tokens;
  // The only run of digits in the text, so its first occurrence is where it is.
  const index = text.indexOf(token);
  const separators = Array.from(new Set(token.replace(/\d/g, '').split('')));
  const groups = token.split(/[.,\u00a0\u202f ]/);
  let group = '';
  let decimal = '.';
  let integer = token;
  let fraction = '';

  if (separators.length > 2) {
    return undefined;
  }

  if (separators.length === 2) {
    // Both: the last one is the decimal separator, and it is not a space.
    const lastSeparator = token.replace(/\d/g, '').slice(-1);
    group = separators.find((separator) => separator !== lastSeparator)!;
    decimal = lastSeparator;

    if (SPACES.includes(decimal) || token.split(decimal).length !== 2) {
      return undefined;
    }

    [integer, fraction] = token.split(decimal);

    if (!isGroupRun(integer.split(group))) {
      return undefined;
    }
  } else if (separators.length === 1) {
    const [separator] = separators;
    const count = token.split(separator).length - 1;

    if (
      SPACES.includes(separator) ||
      count > 1 ||
      (separator === ',' && groups[1].length === 3)
    ) {
      // A thousands separator.
      if (!isGroupRun(groups)) {
        return undefined;
      }

      group = separator;
    } else {
      // A single dot, or a comma before anything but three digits: the decimal separator.
      decimal = separator;
      [integer, fraction] = token.split(separator);
    }
  }

  const digits = Number(`${group ? integer.split(group).join('') : integer}.${fraction || 0}`);

  if (!Number.isFinite(digits)) {
    return undefined;
  }

  // A minus right before the number is its sign, unless it joins two words ("COVID-19").
  const before = text[index - 1];
  const isSigned =
    (before === '-' || before === '−') && (index < 2 || !isWordCharacter(text[index - 2]));

  return {
    prefix: text.slice(0, isSigned ? index - 1 : index),
    suffix: text.slice(index + token.length),
    target: isSigned ? -digits : digits,
    decimals: fraction.length,
    group,
    decimal,
    minus: isSigned ? before : '-',
  };
};

/** Write `value` the way the parsed value is written: its decimals, separators and text. */
export const formatCountUpValue = (value: number, parsed: IReqoreCountUpValue): string => {
  const fixed = Math.abs(value).toFixed(parsed.decimals);
  const [integer, fraction] = fixed.split('.');
  const grouped = parsed.group ? integer.replace(/\B(?=(\d{3})+(?!\d))/g, parsed.group) : integer;
  // A frame that rounds to zero is written without a sign: "-0" is not a number anyone wrote.
  const sign = value < 0 && Number(fixed) !== 0 ? parsed.minus : '';

  return `${parsed.prefix}${sign}${grouped}${
    fraction !== undefined ? `${parsed.decimal}${fraction}` : ''
  }${parsed.suffix}`;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** easeOutCubic: fast at first, settling into the value. */
const ease = (progress: number) => 1 - Math.pow(1 - progress, 3);

export interface IReqoreCountUp {
  /** What to show now: a frame of the count, or the value itself once it has finished. */
  display: string | number;
  /** What the count ends on: the value as given, or `format(value)` with a `format`. */
  final: string | number;
  /** True until the count has finished: what is shown is not the value yet. */
  counting: boolean;
}

/**
 * Count a value up to itself once its element is on screen.
 *
 * - The count starts when `threshold` of the element is in view and plays once; until then it
 *   shows `from`. Where there is no IntersectionObserver it starts straight away.
 * - Under `prefers-reduced-motion`, with `duration` 0, or when the value is not one number
 *   (see `parseCountUpValue`), it shows the value at once.
 * - The last frame is the value exactly as given (or `format(value)` with a `format`).
 * - A value that changes mid-count is counted to from where the count is; one that changes
 *   after the count has finished is shown at once.
 */
export const useCountUp = (
  value: string | number,
  options: boolean | IReqoreCountUpOptions | undefined,
  ref: RefObject<Element>
): IReqoreCountUp => {
  const settings = typeof options === 'object' ? options : undefined;
  const enabled = !!options;
  const duration = Math.max(0, settings?.duration ?? COUNT_UP_DEFAULTS.duration);
  const from = settings?.from ?? COUNT_UP_DEFAULTS.from;
  const threshold = Math.min(1, Math.max(0, settings?.threshold ?? COUNT_UP_DEFAULTS.threshold));
  const format = settings?.format;

  const parsed = useMemo(() => (enabled ? parseCountUpValue(value) : undefined), [enabled, value]);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const active = !!parsed && !reducedMotion && duration > 0;

  const [inView, setInView] = useState(false);
  const [frame, setFrame] = useState<number | undefined>(undefined);
  const done = useRef(false);
  const current = useRef(from);

  useEffect(() => {
    if (!active || inView || done.current) {
      return undefined;
    }

    const element = ref.current;

    if (!element || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // The ratio reported at the crossing can round to just under the threshold.
        if (
          entries.some(
            (entry) =>
              entry.isIntersecting &&
              entry.intersectionRatio >= threshold - THRESHOLD_TOLERANCE
          )
        ) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [active, inView, threshold, ref]);

  const target = parsed?.target;

  useEffect(() => {
    if (!active || !inView || done.current || target === undefined) {
      return undefined;
    }

    const start = current.current;
    let startedAt: number | undefined;
    let request: number;

    const tick = (now: number) => {
      if (startedAt === undefined) {
        startedAt = now;
      }

      const progress = Math.min(1, (now - startedAt) / duration);
      const next = start + (target - start) * ease(progress);

      current.current = next;

      if (progress < 1) {
        setFrame(next);
        request = requestAnimationFrame(tick);
      } else {
        done.current = true;
        setFrame(undefined);
      }
    };

    request = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(request);
  }, [active, inView, target, duration]);

  if (!parsed) {
    return { display: value, final: value, counting: false };
  }

  const final = format ? format(parsed.target) : value;

  if (!active || done.current) {
    return { display: final, final, counting: false };
  }

  const shown = frame ?? current.current;

  return {
    display: format ? format(shown) : formatCountUpValue(shown, parsed),
    final,
    counting: true,
  };
};
