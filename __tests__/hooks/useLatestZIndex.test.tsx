import { renderHook } from '@testing-library/react';
import React from 'react';
import { ReqoreUIProvider, useLatestZIndex } from '../../src';

test('useLatestZIndex returns incremental z indexes', () => {
  const wrapper = ({ children }: any) => <ReqoreUIProvider>{children}</ReqoreUIProvider>;
  const { result } = renderHook(() => useLatestZIndex(), { wrapper });

  expect(result.current).toEqual(9002);
});
