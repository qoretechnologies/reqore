import { formatDateToType } from '../../src/helpers/dates';

test('formatDateToType formats date correctly', () => {
  const date = new Date(2024, 6, 12, 8, 30, 44);

  let epochDate: any = new Date();
  epochDate = epochDate.getTime() - 60000;
  // Transform the epochDate to date again
  epochDate = new Date(epochDate);

  expect(formatDateToType(date, 'date')).toBe('7/12/2024, 8:30:44 AM');
  expect(formatDateToType(date, 'iso')).toBe('2024-07-12T06:30:44.000Z');
  expect(formatDateToType(epochDate, 'epoch')).toBe('a minute ago');
  expect(formatDateToType(date, 'object')).toEqual(
    expect.objectContaining({
      year: 2024,
      month: 6,
      day: 12,
      hours: 8,
      minutes: 30,
      seconds: 44,
      milliseconds: 0,
    })
  );
});
