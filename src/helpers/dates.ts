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
export const getPreviousYears = (min: number) => {
  const currentYear = new Date().getFullYear();
  return new Array(currentYear - min + 1).fill(null).map((_, index) => currentYear - index);
};
