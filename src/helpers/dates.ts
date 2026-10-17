import {
  getLocalTimeZone,
  parseAbsoluteToLocal,
  parseDate,
  parseDateTime,
  toZoned,
  ZonedDateTime,
} from '@internationalized/date';
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

/**
 * A date the way the date picker reads one, as a ZonedDateTime (the date picker cannot use a Date), or `undefined`
 * for one it cannot read. It never throws: a value read in a render that threw took the page with it (qorus#646:
 * the Qorus IDE's Workflow Orders page went to its router's error page for "2026-06-02T08:00:00").
 *
 * - A date-time with a zone or an offset (`2026-06-02T08:00:00Z`, `…+02:00`) is that instant, in the user's zone.
 * - A date-time without one (`2026-06-02T08:00:00`) is that wall-clock time in the user's zone: ISO 8601 reads a
 *   date-time with no offset as local time.
 * - A date alone (`2026-10-17`) is that day at midnight, in the user's zone.
 * - A Date is the instant it holds; an invalid Date, or text that is none of the above, is no date.
 */
export const readDate = (date?: Date | string | null): ZonedDateTime | undefined => {
  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? undefined : parseAbsoluteToLocal(date.toISOString());
  }
  if (typeof date !== 'string' || !date.trim()) {
    return undefined;
  }
  const text = date.trim();
  for (const read of [
    () => parseAbsoluteToLocal(text),
    () => toZoned(parseDateTime(text), getLocalTimeZone()),
    () => toZoned(parseDate(text), getLocalTimeZone()),
  ]) {
    try {
      return read();
    } catch {
      // not this shape: the next one
    }
  }
  return undefined;
};

/** Whether `date` is given (not empty) but is no date `readDate` can read: a value the field cannot show. */
export const isUnreadableDate = (date?: Date | string | null): boolean =>
  date !== undefined && date !== null && date !== '' && readDate(date) === undefined;

// utility to convert date to ZonedDateTime because datepicker can't use Date
export const toDate = (date?: Date | string | null) => readDate(date);

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
