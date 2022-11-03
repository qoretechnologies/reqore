import { Placement } from '@popperjs/core';
import { MutableRefObject, useContext, useEffect, useMemo, useRef } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';
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
  openOnMount?: boolean;
  noArrow?: boolean;
  useTargetWidth?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnAnyClick?: boolean;
  delay?: number;
  blur?: number;
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
  openOnMount = false,
  delay,
}: IPopoverOptions) => {
  const { addPopover, removePopover, updatePopover, popovers } = useContext(PopoverContext);
  const { current }: MutableRefObject<string> = useRef(shortid.generate());
  let { current: timeout }: MutableRefObject<any> = useRef(0);

  const startEvent = startEvents[handler];
  const endEvent = endEvents[handler];
  const currentPopover = useMemo(
    () => popovers?.find((p) => p.id === current),
    [popovers, current]
  );

  const _addPopover = () => {
    if (currentPopover) {
      _removePopover?.();
    } else if (show) {
      timeout = setTimeout(() => {
        addPopover?.({
          id: current,
          content,
          targetElement,
          placement,
          noArrow,
          useTargetWidth,
          closeOnOutsideClick,
          closeOnAnyClick: handler === 'hover' || handler === 'hoverStay',
        });
      }, delay || 0);
    }
  };

  const _removePopover = () => {
    cancelTimeout();
    removePopover?.(current);
  };

  const cancelTimeout = () => {
    clearTimeout(timeout);
    timeout = null;
  };

  useUpdateEffect(() => {
    if (show) {
      updatePopover?.(current, {
        id: current,
        content,
        targetElement,
        placement,
        noArrow,
        useTargetWidth,
        closeOnOutsideClick,
        closeOnAnyClick: handler === 'hover' || handler === 'hoverStay',
      });
    }
  }, [content]);

  useEffect(() => {
    if (openOnMount && targetElement) {
      _addPopover();
    }
  }, [targetElement]);

  useEffect(() => {
    if (targetElement && content) {
      targetElement.addEventListener(startEvent, _addPopover);

      if (endEvent) {
        targetElement.addEventListener(endEvent, _removePopover);
      }

      if (handler === 'hoverStay') {
        targetElement.addEventListener('mouseleave', cancelTimeout);
      }
    }

    return () => {
      if (targetElement && content) {
        cancelTimeout();
        targetElement.removeEventListener(startEvent, _addPopover);

        if (endEvent) {
          targetElement.removeEventListener(endEvent, _removePopover);
        }

        if (handler === 'hoverStay') {
          targetElement.removeEventListener('mouseleave', cancelTimeout);
        }
      }
    };
  }, [targetElement, content, current, currentPopover]);

  useUnmount(() => {
    cancelTimeout();
  });

  return current;
};

export default usePopover;
