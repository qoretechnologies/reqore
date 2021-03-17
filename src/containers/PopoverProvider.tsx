import React, { useState } from "react";
import Popover from "../components/InternalPopover";
import PopoverContext from "../context/PopoverContext";
import { IPopoverOptions } from "../hooks/usePopover";

export interface IReqorePopoverProviderProps {
  children: any;
}

export interface IPopoverData extends IPopoverOptions {
  id: string;
}

const PopoverProvider: React.FC<IReqorePopoverProviderProps> = ({
  children,
}) => {
  const [popovers, setPopovers] = useState<IPopoverData[]>([]);

  return (
    <PopoverContext.Provider
      value={{
        addPopover: (popoverData: IPopoverData) => {
          setPopovers((cur: IPopoverData[]) => [...cur, popoverData]);
        },
        updatePopover: (popoverId: string, popoverData: IPopoverData) => {
          setPopovers((cur: IPopoverData[]) =>
            [...cur].reduce((newPopovers, popover) => {
              if (popover.id === popoverId) {
                return [...newPopovers, popoverData];
              }

              return [...newPopovers, popover];
            }, [])
          );
        },
        removePopover: (popoverId: string) => {
          setPopovers((cur: IPopoverData[]) =>
            [...cur].filter((p) => p.id !== popoverId)
          );
        },
        popovers,
      }}
    >
      {popovers.map((popover: IPopoverData) => (
        <Popover {...popover} key={popover.id} />
      ))}
      {children}
    </PopoverContext.Provider>
  );
};

export default PopoverProvider;
