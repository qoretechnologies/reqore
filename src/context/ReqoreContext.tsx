import { createContext } from 'use-context-selector';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';
import {
  IReqoreConfirmationModal,
  IReqoreModal,
  IReqoreModalFromProps,
  IReqoreNotificationData,
  TReqoreCustomModal,
} from '../containers/ReqoreProvider';

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
  readonly uiScale?: number;
  readonly animations?: {
    readonly buttons?: boolean;
    readonly dialogs?: boolean;
    readonly popovers?: boolean;
  };
  readonly tooltips?: {
    /**
     * Delay in ms before showing the tooltip
     * @default 0
     * Works only for `hover` handler
     * */
    delay?: number;
  };
  readonly customPortalId?: string;
  readonly closePopoversOnEscPress?: boolean;
  readonly closeModalsOnEscPress?: boolean;
  readonly escClosableModals?: string[];
  readonly addEscClosableModal?: (id: string) => void;
  readonly removeEscClosableModal?: (id: string, onRemove?: () => void) => void;
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
  closeModalsOnEscPress: true,
  escClosableModals: [],
  addEscClosableModal: null,
  removeEscClosableModal: null,
  theme: DEFAULT_THEME,
  uiScale: 1,
});
