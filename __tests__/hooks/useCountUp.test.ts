import { formatCountUpValue, parseCountUpValue } from '../../src/hooks/useCountUp';

describe('parseCountUpValue', () => {
  it.each([
    [12345, { target: 12345, decimals: 0, group: '', prefix: '', suffix: '' }],
    [99.8, { target: 99.8, decimals: 1, group: '' }],
    [-12, { target: -12, prefix: '', minus: '-' }],
    ['1,234', { target: 1234, decimals: 0, group: ',' }],
    ['12,345.67', { target: 12345.67, decimals: 2, group: ',', decimal: '.' }],
    ['1.234,5', { target: 1234.5, decimals: 1, group: '.', decimal: ',' }],
    ['1.234.567', { target: 1234567, group: '.' }],
    ['99,8', { target: 99.8, decimals: 1, group: '', decimal: ',' }],
    ['1.234', { target: 1.234, decimals: 3, group: '' }],
    ['10 000', { target: 10000, group: ' ' }],
    ['10\u202f000 €', { target: 10000, group: '\u202f', suffix: ' €' }],
    ['$1.2M', { target: 1.2, decimals: 1, prefix: '$', suffix: 'M' }],
    ['99.9%', { target: 99.9, suffix: '%' }],
    ['~63 %', { target: 63, prefix: '~', suffix: ' %' }],
    ['+12%', { target: 12, prefix: '+', suffix: '%' }],
    ['−4.5 °C', { target: -4.5, minus: '−', suffix: ' °C' }],
    ['0', { target: 0 }],
  ])('reads %p as one number', (value, expected) => {
    expect(parseCountUpValue(value)).toMatchObject(expected);
  });

  it.each([
    ['2–4'],
    ['24/7'],
    ['Q3 2026'],
    ['N/A'],
    [''],
    ['1,23,456'],
    ['12 34'],
    [1e21],
    [Infinity],
    [NaN],
  ])('does not count %p, which is not one number', (value) => {
    expect(parseCountUpValue(value as string | number)).toBeUndefined();
  });

  it('keeps a hyphen that joins words as text, not as a sign', () => {
    expect(parseCountUpValue('COVID-19')).toMatchObject({ target: 19, prefix: 'COVID-' });
  });
});

describe('formatCountUpValue', () => {
  const format = (value: number, written: string | number) =>
    formatCountUpValue(value, parseCountUpValue(written)!);

  it('writes a frame the way the value is written', () => {
    expect(format(1079.75, '1,234')).toBe('1,080');
    expect(format(0, '1,234')).toBe('0');
    expect(format(1234567.891, '12,345.67')).toBe('1,234,567.89');
    expect(format(1000.25, '1.234,5')).toBe('1.000,3');
    expect(format(0.69375, '$1.2M')).toBe('$0.7M');
    expect(format(5000, '10 000')).toBe('5 000');
    expect(format(31.5, '~63 %')).toBe('~32 %');
  });

  it('signs a negative frame with the value’s own minus, and never writes -0', () => {
    expect(format(-2.25, '−4.5 °C')).toBe('−2.3 °C');
    expect(format(-0.01, '−4.5 °C')).toBe('0.0 °C');
    expect(format(-6, -12)).toBe('-6');
  });
});
