import { createContext } from 'react';
import { IReqoreConfirmationModal, IReqoreNotificationData } from '../containers/ReqoreProvider';

export interface IReqoreContext {
  confirmAction: (data: IReqoreConfirmationModal) => void;
  notifications?: IReqoreNotificationData[] | null;
  addNotification?: (data: IReqoreNotificationData) => any;
  removeNotification?: (id: string) => any;
  isMobile?: boolean;
  isTablet?: boolean;
  isMobileOrTablet?: boolean;
}

export default createContext<IReqoreContext>({
  confirmAction: null,
  notifications: null,
  addNotification: null,
  removeNotification: null,
});
