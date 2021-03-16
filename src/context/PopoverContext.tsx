import { createContext } from "react";
import { IPopoverData } from "../containers/PopoverProvider";

export default createContext<{
  addPopover?: (popoverData: IPopoverData) => void;
  removePopover?: (popoverId: string) => void;
  popovers?: IPopoverData[];
}>({});
