import { parseAbsoluteToLocal } from '@internationalized/date';
import timeago from 'epoch-timeago';

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

export type TDateFormat = 'date' | 'iso' | 'epoch' | 'object';
export type TDateObjectFormat = {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
};
export type TDateFormatResult<T extends TDateFormat> = T extends 'date'
  ? string
  : T extends 'iso'
  ? string
  : T extends 'epoch'
  ? string
  : T extends 'object'
  ? TDateObjectFormat
  : Date;

export function formatDateToType<T extends TDateFormat>(date: Date, type: T): TDateFormatResult<T> {
  switch (type) {
    case 'date':
      return date.toLocaleString() as TDateFormatResult<T>;
    case 'iso':
      return date.toISOString() as TDateFormatResult<T>;
    case 'epoch': {
      // Convert the date to unix timestamp
      const unixTimestamp = date.getTime();

      return timeago(unixTimestamp);
    }
    case 'object':
      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
        milliseconds: date.getMilliseconds(),
      } as TDateFormatResult<T>;
    default:
      return date as TDateFormatResult<T>;
  }
}
