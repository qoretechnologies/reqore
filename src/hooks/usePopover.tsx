import { Placement } from '@popperjs/core';
import { MutableRefObject, useContext, useEffect, useRef } from 'react';
import { useUpdateEffect } from 'react-use';
import shortid from 'shortid';
import PopoverContext from '../context/PopoverContext';

const startEvents = {
  hover: 'mouseenter',
  hoverStay: 'mouseenter',
  click: 'click',
  focus: 'focusin',
};

const endEvents = {
  hover: 'mouseleave',
  hoverStay: null,
  click: null,
  focus: null,
};

export interface IPopover {
  content?: JSX.Element | string | undefined;
  handler?: 'hover' | 'click' | 'focus' | 'hoverStay';
  placement?: Placement;
  show?: boolean;
  noArrow?: boolean;
  useTargetWidth?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnAnyClick?: boolean;
}

export interface IPopoverOptions extends IPopover {
  targetElement?: HTMLElement;
}

const usePopover = ({
  targetElement,
  content,
  handler = 'hover',
  placement,
  show = true,
  noArrow,
  useTargetWidth,
  closeOnOutsideClick = true,
}: IPopoverOptions) => {
  const { addPopover, removePopover, updatePopover, popovers } = useContext(PopoverContext);
  const { current }: MutableRefObject<string> = useRef(shortid.generate());

  const startEvent = startEvents[handler];
  const endEvent = endEvents[handler];

  const _addPopover = () => {
    if (popovers.find((p) => p.id === current)) {
      removePopover(current);
    } else if (show) {
      addPopover({
        id: current,
        content,
        targetElement,
        placement,
        noArrow,
        useTargetWidth,
        closeOnOutsideClick,
      });
    }
  };

  const _removePopover = () => {
    removePopover(current);
  };

  useUpdateEffect(() => {
    if (show) {
      updatePopover(current, {
        id: current,
        content,
        targetElement,
        placement,
        noArrow,
        useTargetWidth,
        closeOnOutsideClick,
        closeOnAnyClick:
          closeOnOutsideClick || startEvent === 'hover' || startEvent === 'hoverStay',
      });
    }
  }, [content]);

  useEffect(() => {
    if (targetElement && content) {
      targetElement.addEventListener(startEvent, _addPopover);

      if (endEvent) {
        targetElement.addEventListener(endEvent, _removePopover);
      }
    }

    return () => {
      if (targetElement && content) {
        targetElement.removeEventListener(startEvent, _addPopover);
        if (endEvent) {
          targetElement.removeEventListener(endEvent, _removePopover);
        }
      }
    };
  });

  return current;
};

export default usePopover;
