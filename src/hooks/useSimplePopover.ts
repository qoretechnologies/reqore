import { Placement } from '@popperjs/core';
import { ElementRef } from 'react';
import usePopover from './usePopover';

const useSimplePopover = (
  targetElement: ElementRef<any>,
  content: JSX.Element | string,
  type?: 'click' | 'hover',
  placement?: Placement
) => {
  const { reqoreAddPopover, reqoreRemovePopover } = usePopover(targetElement);

  if (type === 'click') {
    return {
      onClick: reqoreAddPopover(content, placement),
    };
  }

  return {
    onMouseEnter: reqoreAddPopover(content, placement),
    onMouseLeave: reqoreRemovePopover(),
  };
};

export default useSimplePopover;
