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
import { IReqorePanelAction } from '../components/Panel';
import { NUMBER_TO_SIZE, SIZES, SIZE_TO_NUMBER, TSizes } from '../constants/sizes';

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

export const calculateStringSizeInPixels = (value: string = '', fontSize: number): number => {
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
    (fontSize * 1.15)
  );
};

export const isStringSize = (value: TSizes | string | number) => {
  return SIZES.includes(value as TSizes);
};

export const getOneLessSize = (size: TSizes): TSizes => {
  // Get the initial sizes number
  const initialSizeNumber: number = SIZE_TO_NUMBER[size];
  // Reduce the size number by one
  const oneLessSizeNumber: number = initialSizeNumber - 1 === 0 ? 1 : initialSizeNumber - 1;
  // Get the size name from the number
  return NUMBER_TO_SIZE[oneLessSizeNumber];
};

export const getOneHigherSize = (size: TSizes): TSizes => {
  // Get the initial sizes number
  const initialSizeNumber: number = SIZE_TO_NUMBER[size];
  // Reduce the size number by one
  const oneHigherSizeNumber: number = initialSizeNumber + 1 === 6 ? 5 : initialSizeNumber + 1;
  // Get the size name from the number
  return NUMBER_TO_SIZE[oneHigherSizeNumber];
};

export const isActionShown = (action: IReqorePanelAction) => action.show !== false;

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

  let s = stack.concat([obj]);

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
