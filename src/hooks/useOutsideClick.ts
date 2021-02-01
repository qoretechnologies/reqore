import { MutableRefObject, useEffect } from 'react';

const useOutsideClick = (
  targetElement: MutableRefObject<any>,
  callback?: Function
): void => {
  const handleClick = (event: any): void => {
    if (
      targetElement.current &&
      !targetElement.current.contains(event.target) &&
      callback
    ) {
      callback();
    }
  };

  useEffect(() => {
    if (targetElement.current) {
      setTimeout(() => {
        document.addEventListener('click', handleClick);
      }, 150);
    }

    return () => {
      document.removeEventListener('click', handleClick);
    };
  });
};

export default useOutsideClick;
