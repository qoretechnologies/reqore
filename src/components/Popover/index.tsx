import React, { useContext, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import PopoverContext from '../../context/PopoverContext';
import useOutsideClick from '../../hooks/useOutsideClick';

const Popover = ({ element, content = 'Popover', id }) => {
  const { removePopover } = useContext(PopoverContext);
  const [popperElement, setPopperElement] = useState(null);
  const popperRef = useRef(null);
  const { styles, attributes } = usePopper(element, popperElement);

  useOutsideClick(popperRef, () => {
    console.log('removing', id);
    removePopover(id);
  });

  return (
    <div
      ref={(el) => {
        setPopperElement(el);
        popperRef.current = el;
      }}
      style={styles.popper}
      {...attributes.popper}
    >
      {content}
    </div>
  );
};

export default Popover;
