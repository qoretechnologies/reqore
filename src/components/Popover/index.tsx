import React, { memo, useEffect, useState } from 'react';
import styled from 'styled-components';
import usePopover, { IPopoverControls, IPopoverOptions } from '../../hooks/usePopover';
import { IReqoreComponent } from '../../types/global';

export interface IReqorePopoverProps extends IReqoreComponent, IPopoverOptions {
  component: any;
  componentProps?: any;
  children?: any;
  isReqoreComponent?: boolean;
  wrapperTag?: string;
  wrapperStyle?: React.CSSProperties;
}

export const StyledPopover = styled.span`
  overflow: hidden;
`;

const Popover = memo(
  ({
    component: Component,
    componentProps,
    children,
    isReqoreComponent,
    wrapperTag = 'span',
    wrapperStyle = {},
    passPopoverData,
    _insidePopover,
    _popoverId,
    ...rest
  }: IReqorePopoverProps) => {
    const [ref, setRef] = useState(undefined);

    const popoverData: IPopoverControls = usePopover({ targetElement: ref, ...rest });

    useEffect(() => {
      passPopoverData?.(popoverData);
    }, [popoverData]);

    if (isReqoreComponent) {
      return (
        <Component
          {...componentProps}
          _insidePopover={_insidePopover}
          _popoverId={_popoverId}
          ref={setRef}
        >
          {children}
        </Component>
      );
    }

    return (
      <StyledPopover
        as={wrapperTag}
        className='reqore-popover-wrapper'
        ref={setRef}
        style={wrapperStyle}
      >
        <Component {...componentProps} _insidePopover={_insidePopover} _popoverId={_popoverId}>
          {children}
        </Component>
      </StyledPopover>
    );
  }
);

export default Popover;
