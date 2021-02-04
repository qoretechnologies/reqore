import { Placement } from '@popperjs/core';
import { MutableRefObject, useContext, useEffect, useRef } from 'react';
import shortid from 'shortid';
import PopoverContext from '../context/PopoverContext';

const usePopover = (
  targetElement: HTMLElement,
  content: JSX.Element | string | number,
  type: 'hover' | 'click' = 'hover',
  placement?: Placement,
  show: boolean = true
) => {
  const { addPopover, removePopover, popovers } = useContext(PopoverContext);
  const { current }: MutableRefObject<string> = useRef(shortid.generate());

  const startEvent = type === 'hover' ? 'mouseenter' : 'click';
  const endEvent = type === 'hover' ? 'mouseleave' : null;

  const _addPopover = () => {
    if (popovers.find((p) => p.id === current)) {
      removePopover(current);
    } else if (show) {
      addPopover({
        id: current,
        content,
        //@ts-ignore
        element: targetElement,
        placement,
      });
    }
  };

  const _removePopover = () => {
    removePopover(current);
  };

  useEffect(() => {
    if (targetElement && (content || content === 0)) {
      targetElement.addEventListener(startEvent, _addPopover);

      if (endEvent) {
        targetElement.addEventListener(endEvent, _removePopover);
      }
    }

    return () => {
      if (targetElement && (content || content === 0)) {
        targetElement.removeEventListener(startEvent, _addPopover);
        targetElement.removeEventListener(endEvent, _removePopover);
      }
    };
  });
};

export default usePopover;
