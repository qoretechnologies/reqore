import { useMemo } from 'react';
import { useReqoreProperty } from './useReqoreContext';

const useLatestZIndex = (): number => {
  const getAndIncreaseZIndex = useReqoreProperty('getAndIncreaseZIndex');
  const latestZIndex = useReqoreProperty('latestZIndex');

  const zIndex = useMemo(
    () => getAndIncreaseZIndex(),
    [getAndIncreaseZIndex, latestZIndex]
  );

  return zIndex;
};

export default useLatestZIndex;
