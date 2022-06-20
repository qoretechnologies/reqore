import { MutableRefObject, useCallback, useEffect, useRef } from 'react';

let listeners: any = [];

const _handleClick = (event: any, targetElement, checkTarget, callBack): void => {
  console.log('🚀 ~ file: useOutsideClick.ts ~ line 4 ~ listeners', listeners);
  listeners.forEach((listener: any) => {
    listener(event, targetElement, checkTarget, callBack);
  });
};

const useOutsideClick = (
  targetElement?: MutableRefObject<any>,
  checkTarget?: boolean,
  callback?: () => void
): void => {
  const idx = useRef(listeners.length);
  const handleClick = useCallback(
    (event: MouseEvent, targetElement, checkTarget, callback): void => {
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
    listeners[idx.current] = handleClick;

    document.addEventListener('click', (event) =>
      _handleClick(event, targetElement, checkTarget, callback)
    );

    return () => {
      listeners = listeners.filter((_, i) => i !== idx.current);
      document.removeEventListener('click', (event) =>
        _handleClick(event, targetElement, checkTarget, callback)
      );
    };
  });
};

export default useOutsideClick;
