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
