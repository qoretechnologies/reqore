import React, { useState } from 'react';
import Popover from '../components/Popover';
import PopoverContext from '../context/PopoverContext';

const PopoverProvider = ({ children }) => {
  const [popovers, setPopovers] = useState([]);

  return (
    <PopoverContext.Provider
      value={{
        addPopover: (popoverData) => {
          setPopovers((cur) => [...cur, popoverData]);
        },
        removePopover: (popoverId) => {
          setPopovers((cur) => [...cur].filter((p) => p.id !== popoverId));
        },
        popovers,
      }}
    >
      {popovers.map((popover) => (
        <Popover {...popover} key={popover.id} />
      ))}
      {children}
    </PopoverContext.Provider>
  );
};

export default PopoverProvider;
