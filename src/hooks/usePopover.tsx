import { Placement } from '@popperjs/core';
import { MutableRefObject, useContext, useEffect, useRef } from 'react';
import shortid from 'shortid';
import PopoverContext from '../context/PopoverContext';

const startEvents = {
  hover: 'mouseenter',
  click: 'click',
  focus: 'focus',
}

const endEvents = {
  hover: 'mouseleave',
  click: null,
  focus: 'blur',
}

const usePopover = (
  targetElement: HTMLElement,
  content: JSX.Element | string | number,
  type: 'hover' | 'click' | 'focus' = 'hover',
  placement?: Placement,
  show: boolean = true
) => {
  const { addPopover, removePopover, popovers } = useContext(PopoverContext);
  const { current }: MutableRefObject<string> = useRef(shortid.generate());

  const startEvent = startEvents[type];
  const endEvent = endEvents[type];

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

  return current;
};

export default usePopover;
