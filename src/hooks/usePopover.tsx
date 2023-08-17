import { Placement } from '@popperjs/core';
import { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';
import shortid from 'shortid';
import { useContext } from 'use-context-selector';
import { useReqoreProperty } from '..';
import { IPopoverData } from '../containers/PopoverProvider';
import PopoverContext from '../context/PopoverContext';
import {
  IReqoreIntent,
  IWithReqoreEffect,
  IWithReqoreFlat,
  IWithReqoreMinimal,
} from '../types/global';
import { IReqoreIconName } from '../types/icons';

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

export interface IPopoverControls {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
  id: string;
}

export interface IPopover
  extends IReqoreIntent,
    IWithReqoreMinimal,
    IWithReqoreEffect,
    IWithReqoreFlat {
  content?: JSX.Element | string | undefined;
  handler?: 'hover' | 'click' | 'focus' | 'hoverStay';
  placement?: Placement;
  show?: boolean;
  openOnMount?: boolean;
  noArrow?: boolean;
  noWrapper?: boolean;
  useTargetWidth?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnAnyClick?: boolean;
  delay?: number;
  blur?: boolean;
  transparent?: boolean;
  maxWidth?: string;
  maxHeight?: string;
  icon?: IReqoreIconName;
  title?: string;
  updater?: string | number;
}

export interface IPopoverOptions extends IPopover {
  targetElement?: HTMLElement;
  passPopoverData?: (data: IPopoverControls) => void;
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
  ...rest
}: IPopoverOptions): IPopoverControls => {
  const { addPopover, removePopover, updatePopover, popovers, isPopoverOpen } =
    useContext(PopoverContext);
  const tooltips = useReqoreProperty('tooltips');
  const { current }: MutableRefObject<string> = useRef(shortid.generate());
  let { current: timeout }: MutableRefObject<any> = useRef(0);

  const startEvent = startEvents[handler];
  const endEvent = endEvents[handler];
  const currentPopover: IPopoverData = useMemo(
    () => popovers?.find((p) => p.id === current),
    [popovers, current]
  );

  const openPopover = () => {
    addPopover?.({
      id: current,
      content,
      targetElement,
      placement,
      noArrow,
      useTargetWidth,
      closeOnOutsideClick,
      closeOnAnyClick: handler === 'hover',
      ...rest,
    });

    if (rest.blur) {
      // Create a div and prepend before the targetElement
      const blurDiv = document.createElement('div');

      blurDiv.id = `reqore-blur-${current}`;
      blurDiv.classList.add('reqore-blur-wrapper');

      // Add the blur div before the target element
      targetElement.before(blurDiv);

      // Add the highest z-index to the target element
      targetElement.classList.add('reqore-blur-z-index');
    }
  };

  const _addPopover = () => {
    if (currentPopover) {
      if (handler !== 'hoverStay' && handler !== 'focus') {
        _removePopover();
      }
    } else if (show) {
      if (delay || tooltips.delay) {
        timeout = setTimeout(() => {
          openPopover();
        }, delay || tooltips.delay);
      } else {
        openPopover();
      }
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
    if (content && show) {
      updatePopover?.(current, {
        id: current,
        content,
        targetElement,
        placement,
        noArrow,
        useTargetWidth,
        closeOnOutsideClick,
        closeOnAnyClick: handler === 'hover',
        ...rest,
      });
    }
  }, [content]);

  useEffect(() => {
    if (openOnMount && targetElement) {
      _addPopover();
    }
  }, [targetElement?.outerHTML]);

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
  }, [targetElement?.toString(), content, current, currentPopover]);

  useUnmount(() => {
    cancelTimeout();
  });

  return {
    id: current,
    open: () => {
      if (!isPopoverOpen(current)) {
        openPopover();
      }
    },
    close: () => _removePopover(),
    isOpen: () => isPopoverOpen(current),
  };
};

export default usePopover;
