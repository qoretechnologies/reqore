import { createContext } from 'use-context-selector';
import { IPopoverData } from '../containers/PopoverProvider';

export default createContext<{
  addPopover?: (popoverData: IPopoverData) => void;
  removePopover?: (popoverId: string) => void;
  updatePopover?: (popoverId: string, popoverData: Partial<IPopoverData>) => void;
  isPopoverOpen?: (popoverId: string) => boolean;
  popovers?: IPopoverData[];
  uiScale?: number;
}>({});
