import { useContext, useMemo } from 'react';
import { ReqoreContext } from '..';

const useLatestZIndex = (): number => {
  const { getAndIncreaseZIndex } = useContext(ReqoreContext);
  const zIndex = useMemo(() => getAndIncreaseZIndex(), []);

  return zIndex;
};

export default useLatestZIndex;
