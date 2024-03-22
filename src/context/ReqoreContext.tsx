import { createContext } from 'use-context-selector';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';
import {
  IReqoreConfirmationModal,
  IReqoreModal,
  IReqoreModalFromProps,
  IReqoreNotificationData,
  TReqoreCustomModal,
} from '../containers/ReqoreProvider';
import { IReqoreOptions } from '../containers/UIProvider';

export interface IReqoreContext {
  readonly confirmAction: (data: IReqoreConfirmationModal) => void;
  readonly notifications?: IReqoreNotificationData[] | null;
  readonly addNotification?: (data: IReqoreNotificationData) => any;
  readonly addModal?: (
    modal: IReqoreModalFromProps | TReqoreCustomModal,
    id?: string,
    options?: IReqoreModal['options']
  ) => string;
  readonly removeModal?: (id: string) => void;
  readonly removeNotification?: (id: string) => any;
  readonly isMobile?: boolean;
  readonly isTablet?: boolean;
  readonly isMobileOrTablet?: boolean;
  readonly getAndIncreaseZIndex?: () => number;
  readonly animations?: IReqoreOptions['animations'];
  readonly tooltips?: IReqoreOptions['tooltips'];
  readonly closePopoversOnEscPress?: boolean;
  readonly latestZIndex?: number;
  theme: IReqoreTheme;
}

export default createContext<IReqoreContext>({
  confirmAction: null,
  notifications: null,
  addNotification: null,
  removeNotification: null,
  addModal: null,
  removeModal: null,
  animations: {
    buttons: true,
    dialogs: true,
  },
  closePopoversOnEscPress: true,
  theme: DEFAULT_THEME,
});
