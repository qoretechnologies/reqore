import { Placement, VirtualElement } from "@popperjs/core";
import React, { useState } from "react";
import Popover from "../components/InternalPopover";
import PopoverContext from "../context/PopoverContext";

export interface IReqorePopoverProviderProps {
  children: any;
}

export interface IPopoverData {
  element: Element | VirtualElement;
  id: string;
  content: JSX.Element | string | number;
  placement?: Placement;
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
