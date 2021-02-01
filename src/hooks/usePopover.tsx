import { Placement } from '@popperjs/core';
import { ElementRef, MutableRefObject, useContext, useRef } from 'react';
import shortid from 'shortid';
import PopoverContext from '../context/PopoverContext';

const usePopover = (targetElement: ElementRef<any>) => {
  const { addPopover, removePopover, popovers } = useContext(PopoverContext);
  const { current }: MutableRefObject<string> = useRef(shortid.generate());

  return {
    reqoreAddPopover: (
      content: JSX.Element | string,
      placement?: Placement,
      callback?: (event: unknown) => any
    ) => (event: unknown) => {
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
            //@ts-ignore
            element: targetElement,
            placement,
          });
        }
      }
    },
    reqoreRemovePopover: (callback?: (event: unknown) => any) => (
      event: unknown
    ) => {
      if (callback) {
        callback(event);
      }

      removePopover(current);
    },
  };
};

export default usePopover;
