import { parseAbsoluteToLocal } from '@internationalized/date';

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const getPreviousYears = (min: number, max = new Date().getFullYear()) => {
  return new Array(max - min + 1).fill(null).map((_, index) => max - index);
};

// utility to convert date to ZonedDateTime because datepicker can't use Date
export const toDate = (date?: Date | string) => {
  if (date) {
    return parseAbsoluteToLocal(typeof date === 'string' ? date : date.toISOString());
  }
  return undefined;
};
