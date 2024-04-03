import { hexAToRGBA, shouldDarken } from '../../src/helpers/colors';

test('Tests whether a color should be darkened', () => {
  expect(shouldDarken('#000000')).toBe(false);
  expect(shouldDarken('#ffffff')).toBe(true);
  expect(shouldDarken('#00000020')).toBe(false);
  expect(shouldDarken('rgba(255, 255, 255, 0.1)')).toBe(true);
});

test('Transforms hex color with alpha to rgba', () => {
  expect(hexAToRGBA('#000000')).toEqual('rgba(0, 0, 0, 1.00)');
  expect(hexAToRGBA('#000')).toEqual('rgba(0, 0, 0, 1.00)');
  expect(hexAToRGBA('#333')).toEqual('rgba(51, 51, 51, 1.00)');
  expect(hexAToRGBA('#00000050')).toEqual('rgba(0, 0, 0, 0.31)');
  expect(hexAToRGBA('#00000000')).toEqual('rgba(0, 0, 0, 0.00)');
  expect(hexAToRGBA('rgb(0, 0, 0)')).toEqual('rgb(0, 0, 0)');
  expect(hexAToRGBA('rgba(0, 0, 0, 1)')).toEqual('rgba(0, 0, 0, 1)');
});
