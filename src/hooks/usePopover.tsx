import { ElementRef, MutableRefObject, useContext, useRef } from 'react';
import PopoverContext from '../context/PopoverContext';

const usePopover = (targetElement: ElementRef<any>) => {
  const { addPopover, removePopover } = useContext(PopoverContext);
  const id: MutableRefObject<number> = useRef(Date.now());

  return {
    reqoreAddPopover: (content: JSX.Element | string, callback?: any) => (
      event: any
    ) => {
      if (callback) {
        callback(event);
      }

      if (targetElement) {
        addPopover({ id, content, element: targetElement });
      }
    },
    reqoreRemovePopover: (callback?: any) => (event: any) => {
      if (callback) {
        callback(event);
      }

      removePopover(id);
    },
  };
};

export default usePopover;
