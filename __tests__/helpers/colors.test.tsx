import { getContrast, getLuminance } from 'polished';
import {
  getOpaqueColor,
  getReadableAccentColor,
  hexAToRGBA,
  isAchromatic,
  shouldDarken,
} from '../../src/helpers/colors';

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

test('Returns true if color is achromatic', () => {
  expect(isAchromatic('#000000')).toEqual(true);
  expect(isAchromatic('#d7d7d7')).toEqual(true);
  expect(isAchromatic('#ffffff')).toEqual(true);
  expect(isAchromatic('#ff0000')).toEqual(false);
  expect(isAchromatic('#fa0782')).toEqual(false);
});

describe('getReadableAccentColor', () => {
  test('keeps a colour that already reads', () => {
    expect(getReadableAccentColor('#ffffff', '#000000')).toBe('#ffffff');
  });

  test('lightens on a dark background and darkens on a light one until it reads', () => {
    const onDark = getReadableAccentColor('#0A6640', '#333333');
    const onLight = getReadableAccentColor('#d1a036', '#f4f4f4');

    expect(getContrast(onDark, '#333333')).toBeGreaterThanOrEqual(4.5);
    expect(getContrast(onLight, '#f4f4f4')).toBeGreaterThanOrEqual(4.5);
    expect(getLuminance(onDark)).toBeGreaterThan(getLuminance('#0A6640'));
    expect(getLuminance(onLight)).toBeLessThan(getLuminance('#d1a036'));
  });

  test('ignores the alpha channel of the colour', () => {
    expect(getOpaqueColor('#e6e6e630')).toBe('#e6e6e6');
    expect(getOpaqueColor('rgba(10, 102, 64, 0.5)')).toBe('#0a6640');
  });
});
