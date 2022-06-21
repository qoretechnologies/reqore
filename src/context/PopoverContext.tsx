import { createContext } from 'react';
import { IPopoverData } from '../containers/PopoverProvider';

export default createContext<{
  addPopover?: (popoverData: IPopoverData) => void;
  removePopover?: (popoverId: string) => void;
  updatePopover?: (popoverId: string, popoverData: Partial<IPopoverData>) => void;
  popovers?: IPopoverData[];
  uiScale?: number;
}>({});
