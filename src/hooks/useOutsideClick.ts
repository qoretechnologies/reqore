import { useEffect } from 'react';

const useOutsideClick = (targetElement: any, callback?: any) => {
  const handleClick = (e) => {
    if (
      targetElement.current &&
      !targetElement.current.contains(e.target) &&
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
