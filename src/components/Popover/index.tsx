import { Placement } from '@popperjs/core';
import React, { useState } from 'react';
import usePopover from '../../hooks/usePopover';

export interface IReqorePopoverProps {
  component: any;
  componentProps?: any;
  children?: any;
  handler?: 'hover' | 'click';
  placement?: Placement;
  isReqoreComponent?: boolean;
  show?: boolean;
  content: any;
}

const Popover = ({
  component: Component,
  componentProps,
  children,
  handler,
  content,
  placement,
  show,
  isReqoreComponent,
}: IReqorePopoverProps) => {
  const [ref, setRef] = useState(null);

  usePopover(ref, content, handler, placement, show);

  if (isReqoreComponent) {
    return (
      <Component {...componentProps} ref={setRef}>
        {children}
      </Component>
    );
  }

  return (
    <span className='reqore-popover-wrapper' ref={setRef}>
      <Component {...componentProps}>{children}</Component>
    </span>
  );
};

export default Popover;
