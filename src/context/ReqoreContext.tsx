import { createContext } from 'react';
import { IReqoreConfirmationModal, IReqoreNotificationData } from '../containers/ReqoreProvider';

export interface IReqoreContext {
  readonly confirmAction: (data: IReqoreConfirmationModal) => void;
  readonly notifications?: IReqoreNotificationData[] | null;
  readonly addNotification?: (data: IReqoreNotificationData) => any;
  readonly removeNotification?: (id: string) => any;
  readonly isMobile?: boolean;
  readonly isTablet?: boolean;
  readonly isMobileOrTablet?: boolean;
  readonly getAndIncreaseZIndex?: () => number;
}

export default createContext<IReqoreContext>({
  confirmAction: null,
  notifications: null,
  addNotification: null,
  removeNotification: null,
});
