import { Placement } from '@popperjs/core';
import { ElementRef, MutableRefObject, useContext, useRef } from 'react';
import shortid from 'shortid';
import PopoverContext from '../context/PopoverContext';

const usePopover = (targetElement: ElementRef<any>) => {
  const { addPopover, removePopover, popovers } = useContext(PopoverContext);
  const { current }: MutableRefObject<number> = useRef(shortid.generate());

  return {
    reqoreAddPopover: (
      content: JSX.Element | string,
      placement?: Placement,
      callback?: any
    ) => (event: any) => {
      if (callback) {
        callback(event);
      }

      if (targetElement) {
        if (popovers.find((p) => p.id === current)) {
          removePopover(current);
        } else {
          addPopover({
            id: current,
            content,
            element: targetElement,
            placement,
          });
        }
      }
    },
    reqoreRemovePopover: (callback?: any) => (event: any) => {
      if (callback) {
        callback(event);
      }

      removePopover(current);
    },
  };
};

export default usePopover;
