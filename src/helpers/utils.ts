import {
  isArray,
  isBoolean,
  isFunction,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from 'lodash';
import { IReqorePanelAction, IReqorePanelSubAction } from '../components/Panel';
import {
  ACCENT_SIZE_TO_PX,
  NUMBER_TO_SIZE,
  PADDING_FROM_SIZE,
  SIZES,
  SIZE_TO_NUMBER,
  TSizes,
} from '../constants/sizes';
import { TReqoreTooltipProp } from '../types/global';

export const sleep = async (ms: number) => await new Promise((r) => setTimeout(r, ms));

export const getTypeFromValue = (item: any): string => {
  if (isBoolean(item)) {
    return 'boolean';
  }

  if (isString(item)) {
    return 'string';
  }

  if (isNumber(item)) {
    return 'number';
  }

  if (isArray(item)) {
    return 'array';
  }

  if (isObject(item)) {
    return 'object';
  }

  if (isFunction(item)) {
    return 'function';
  }

  if (isNull(item) || isUndefined(item)) {
    return 'null';
  }

  return 'null';
};

export const getLineCount = (value: string | null): number => {
  try {
    return value?.match(/[^\n]*\n[^\n]*/gi)?.length ?? 0;
  } catch (e) {
    return 0;
  }
};

// A function that takes list of objects and transforms it
// to a CSV string
export const convertToCSV = (objArray: any[]): string => {
  const header = Object.keys(objArray[0]).join(',');
  const rows = objArray.map((obj) =>
    Object.values(obj)
      .map((value) => JSON.stringify(value))
      .join(',')
  );

  return [header, ...rows].join('\n');
};

export const calculateStringSizeInPixels = (
  value: string = '',
  fontSize: number,
  spaced: number = 0
): number => {
  const widths = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0.2796875, 0.2765625, 0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625, 0.3328125,
    0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125, 0.2765625, 0.3015625, 0.5546875,
    0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875,
    0.5546875, 0.2765625, 0.2765625, 0.584375, 0.5828125, 0.584375, 0.5546875, 1.0140625, 0.665625,
    0.665625, 0.721875, 0.721875, 0.665625, 0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625,
    0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625, 0.721875, 0.665625, 0.609375,
    0.721875, 0.665625, 0.94375, 0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625,
    0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5, 0.5546875, 0.5546875, 0.2765625,
    0.5546875, 0.5546875, 0.221875, 0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875,
    0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875, 0.5, 0.721875, 0.5, 0.5, 0.5,
    0.3546875, 0.259375, 0.353125, 0.5890625,
  ];
  const avg = 0.5279276315789471;

  /* It's calculating the width of a string in pixels. */
  return (
    Array.from(value).reduce((acc, cur) => acc + (widths[cur.charCodeAt(0)] ?? avg), 0) *
    (fontSize * (1.4 + spaced / 2))
  );
};

export const isStringSize = (value: TSizes | string | number) => {
  return SIZES.includes(value as TSizes);
};

/**
 * Resolves an accent-strip thickness (`ReqoreCallout` / `ReqorePanel` `accentSize`) to pixels.
 *
 * Accepts a raw pixel number or a `TSizes` name looked up in `ACCENT_SIZE_TO_PX`. `'normal'` is
 * the default, which makes that map the SINGLE source of the default thickness — components must
 * NOT re-declare a numeric default of their own, or the string and number forms drift apart.
 *
 * Resolution happens once, at the component level, because the accent styles interpolate the
 * result into `px` and do arithmetic with it (the padding reservation) — so the css must never
 * see a string.
 */
export const resolveAccentSize = (accentSize: number | TSizes = 'normal'): number =>
  isStringSize(accentSize) ? ACCENT_SIZE_TO_PX[accentSize as TSizes] : (accentSize as number);

export const getOneLessSize = (size: TSizes = 'normal'): TSizes => {
  // Get the initial sizes number
  const initialSizeNumber: number = SIZE_TO_NUMBER[size];
  // Reduce the size number by one
  const oneLessSizeNumber: number = initialSizeNumber - 1 === 0 ? 1 : initialSizeNumber - 1;
  // Get the size name from the number
  return NUMBER_TO_SIZE[oneLessSizeNumber];
};

export type TReqorePadded = boolean | 'horizontal' | 'vertical';

/**
 * Builds a CSS `padding` shorthand value for surface components that support
 * the `padded` + `paddingSize` prop pair.
 *
 * - `padded={false}` → no padding
 * - `padded='horizontal'` → only left/right padding
 * - `padded='vertical'` → only top/bottom padding
 * - `padded={true}` (default) → padding on both axes
 *
 * The base padding for each axis is `PADDING_FROM_SIZE[paddingSize] *
 * <multiplier>`. Pass per-component multipliers (e.g. EntityRow uses `v=2,
 * h=3`; Statistic uses `v=3, h=5`).
 */
export const resolvePadding = ({
  padded,
  paddingSize,
  verticalMultiplier,
  horizontalMultiplier,
}: {
  padded: TReqorePadded;
  paddingSize: TSizes;
  verticalMultiplier: number;
  horizontalMultiplier: number;
}): string => {
  if (padded === false) return '0';
  const v = PADDING_FROM_SIZE[paddingSize] * verticalMultiplier;
  const h = PADDING_FROM_SIZE[paddingSize] * horizontalMultiplier;
  if (padded === 'horizontal') return `0 ${h}px`;
  if (padded === 'vertical') return `${v}px 0`;
  return `${v}px ${h}px`;
};

export const getOneHigherSize = (size: TSizes): TSizes => {
  // Get the initial sizes number
  const initialSizeNumber: number = SIZE_TO_NUMBER[size];
  // Reduce the size number by one
  const oneHigherSizeNumber: number = initialSizeNumber + 1 === 8 ? 7 : initialSizeNumber + 1;
  // Get the size name from the number
  return NUMBER_TO_SIZE[oneHigherSizeNumber];
};

export const isActionShown = (action: IReqorePanelAction | IReqorePanelSubAction) =>
  action.show !== false;

export const alignToFlexAlign = (
  align: 'left' | 'right' | 'center'
): 'flex-start' | 'center' | 'flex-end' => {
  switch (align) {
    case 'left':
      return 'flex-start';
    case 'right':
      return 'flex-end';
    case 'center':
      return 'center';
    default:
      return 'flex-start';
  }
};

export function decycle(obj, stack = []) {
  if (!obj || typeof obj !== 'object') return obj;

  if (stack.includes(obj)) return null;

  const s = stack.concat([obj]);

  return Array.isArray(obj)
    ? obj.map((x) => decycle(x, s))
    : Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, decycle(v, s)]));
}

export const stringifyAndDecycleObject = (obj: any): string => {
  return JSON.stringify(decycle(obj), (_key, value) => {
    if (typeof value === 'function') {
      return value.toString();
    }

    return value;
  });
};

export function parseInputValue(input) {
  if (isBoolean(input)) {
    return input;
  }

  if (isNumber(input)) {
    return input;
  }

  if (!isString(input)) {
    return input;
  }

  // Check for explicit quotes to save as a string
  if (input.startsWith('"') && input.endsWith('"')) {
    return input.slice(1, -1); // Remove the quotes
  }

  // Attempt to parse as a number
  const parsedNumber = Number(input);
  if (!isNaN(parsedNumber)) {
    return parsedNumber;
  }

  // Attempt to parse as a boolean
  if (input === 'true') {
    return true;
  } else if (input === 'false') {
    return false;
  }

  // Default to a string
  return input;
}

export function buildTooltipForComponents(tooltip: TReqoreTooltipProp) {
  if (isString(tooltip)) {
    return { content: tooltip };
  }

  return tooltip;
}

/**
 * Wraps a click handler so the click stops at the element that owns it.
 *
 * Row-shaped components (`ReqoreSeverityRow`, `ReqoreEntityRow`) and
 * `ReqorePanel` all render their actions *inside* a surface that may carry its
 * own `onClick`. Without this the two handlers both run, and where they do the
 * same thing — the common "the row and its caret toggle one disclosure" shape —
 * they cancel out and the action reads as dead.
 *
 * The wrapper is what each of those components applies to every action it
 * renders, so a consumer never has to remember. An action that genuinely wants
 * the surface to react as well calls the surface's handler itself: explicit, at
 * one call site, rather than implicit at all of them.
 *
 * Call with no argument for a pure stopper (`onClick={withStoppedPropagation()}`).
 */
export const withStoppedPropagation =
  <T extends HTMLElement>(onClick?: (event: React.MouseEvent<T>) => void) =>
  (event: React.MouseEvent<T>) => {
    event.stopPropagation();
    onClick?.(event);
  };
