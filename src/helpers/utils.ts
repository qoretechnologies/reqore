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

export const sleep = async (ms: number) => await new Promise((r) => setTimeout(r, ms));

export const getTypeFromValue: Function = (item: any): string => {
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

export const getLineCount = (value: string): number => {
  try {
    return value.match(/[^\n]*\n[^\n]*/gi).length;
  } catch (e) {
    return 0;
  }
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
    Array.from(value).reduce((acc, cur) => acc + (widths[cur.charCodeAt(0)] ?? avg), 0) * fontSize
  );
};
