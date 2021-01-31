import React, { useState } from 'react';
import { usePopper } from 'react-popper';

const Popover = ({ element, content = 'Popover' }) => {
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(element, popperElement);

  return (
    <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
      {content}
    </div>
  );
};

export default Popover;
