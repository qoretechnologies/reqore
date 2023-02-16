import { renderHook } from '@testing-library/react';
import { ReqoreColors } from '../../src';
import { DEFAULT_THEME } from '../../src/constants/theme';
import { useReqoreTheme } from '../../src/hooks/useTheme';

test('useReqoreTheme should return the default theme', () => {
  const { result } = renderHook(() => useReqoreTheme());

  expect(result.current).toEqual(DEFAULT_THEME);
});

test('useReqoreTheme should return modified main intent color, original color is preserved', () => {
  const { result } = renderHook(() => useReqoreTheme('main', { main: 'info' }));

  expect(result.current.main).toEqual(ReqoreColors.BLUE);
  expect(result.current.originalMain).toEqual(ReqoreColors.DARK_THEME);
});

test('useReqoreTheme should return modified main custom color, original color is preserved', () => {
  const { result } = renderHook(() => useReqoreTheme('main', { main: '#7fbb26' }));

  expect(result.current.main).toEqual('#7fbb26');
  expect(result.current.originalMain).toEqual(ReqoreColors.DARK_THEME);
});

test('useReqoreTheme should return modified main color if intent is passed, original color is preserved', () => {
  const { result } = renderHook(() => useReqoreTheme('main', { main: '#7fbb26' }, 'info'));

  expect(result.current.main).toEqual(ReqoreColors.BLUE);
  expect(result.current.originalMain).toEqual(ReqoreColors.DARK_THEME);
});
