import { useContext, useMemo } from 'react';
import { ReqoreContext } from '..';

const useLatestZIndex = (): number => {
  const { getAndIncreaseZIndex, latestZIndex } = useContext(ReqoreContext);
  const zIndex = useMemo(() => getAndIncreaseZIndex(), [latestZIndex]);

  return zIndex;
};

export default useLatestZIndex;
