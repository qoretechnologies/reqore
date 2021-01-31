import { createContext } from 'react';

export default createContext<{
  addPopover?: (popoverData: any) => any;
  removePopover?: (popoverData: any) => any;
  popovers?: any[];
}>({});
