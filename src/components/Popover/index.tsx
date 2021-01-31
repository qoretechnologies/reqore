import { Placement, VirtualElement } from '@popperjs/core';
import React, { useContext, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import styled from 'styled-components';
import PopoverContext from '../../context/PopoverContext';
import useOutsideClick from '../../hooks/useOutsideClick';

const StyledPopoverWrapper = styled.div`
  padding: 10px;
  background-color: #333;
  color: #d7d7d7;
  font-size: 11px;
  border-radius: 3.5px;
  border-color: #222;
`;

export interface IReqorePopoverProps {
  element: Element | VirtualElement;
  content: JSX.Element | string;
  id: string;
  placement?: Placement;
}

const Popover: React.FC<IReqorePopoverProps> = ({
  element,
  content = 'Popover',
  id,
  placement,
}) => {
  const { removePopover } = useContext(PopoverContext);
  const [popperElement, setPopperElement] = useState(null);
  const popperRef = useRef(null);
  const { styles, attributes } = usePopper(element, popperElement, {
    placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
    ],
  });

  useOutsideClick(popperRef, () => {
    removePopover(id);
  });

  return (
    <StyledPopoverWrapper
      ref={(el) => {
        setPopperElement(el);
        popperRef.current = el;
      }}
      style={styles.popper}
      {...attributes.popper}
    >
      {content}
    </StyledPopoverWrapper>
  );
};

export default Popover;
