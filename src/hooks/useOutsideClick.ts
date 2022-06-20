import { MutableRefObject, useCallback, useEffect } from 'react';

const useOutsideClick = (
  targetElement?: MutableRefObject<any>,
  checkTarget?: boolean,
  callback?: () => void
): void => {
  const handleClick = useCallback(
    (event: any): void => {
      if (
        !checkTarget ||
        (targetElement?.current && !targetElement.current.contains(event.target))
      ) {
        callback?.();
      }
    },
    [checkTarget, targetElement, callback]
  );

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  });
};

export default useOutsideClick;
