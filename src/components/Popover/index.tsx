import { Placement } from '@popperjs/core';
import React, { useState } from 'react';
import styled from 'styled-components';
import usePopover from '../../hooks/usePopover';
import { IReqoreComponent } from '../../types/global';

export interface IReqorePopoverProps extends IReqoreComponent {
  component: any;
  componentProps?: any;
  children?: any;
  handler?: 'hover' | 'click';
  placement?: Placement;
  isReqoreComponent?: boolean;
  show?: boolean;
  content: any;
}

export const StyledPopover = styled.span`
  overflow: hidden;
`;

const Popover = ({
  component: Component,
  componentProps,
  children,
  handler,
  content,
  placement,
  show,
  isReqoreComponent,
  ...rest
}: IReqorePopoverProps) => {
  const [ref, setRef] = useState(null);

  usePopover(ref, content, handler, placement, show);

  if (isReqoreComponent) {
    return (
      <Component {...rest} {...componentProps} ref={setRef}>
        {children}
      </Component>
    );
  }

  return (
    <StyledPopover className='reqore-popover-wrapper' ref={setRef}>
      <Component {...rest} {...componentProps}>
        {children}
      </Component>
    </StyledPopover>
  );
};

export default Popover;
