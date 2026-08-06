import { createContext } from 'use-context-selector';
import { IReqoreErrorBoundaryProps } from '../components/ErrorBoundary';
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
  /**
   * Whether the primary pointer can hover — `true` for a mouse, `false` for touch.
   *
   * Distinct from `isMobile`, which is a WIDTH question: a narrow desktop window
   * still hovers, and a large tablet still does not. Any affordance revealed on
   * `:hover` needs this instead, because a touch device never fires `:hover` and
   * the control would be permanently unreachable there — move it into a menu (or
   * show it unconditionally) when this is `false`.
   *
   * Defaults to `true` where the query cannot be evaluated (SSR, tests), so
   * hover-gated UI keeps its desktop behaviour rather than degrading.
   * @default true
   */
  readonly isHoverCapable?: boolean;
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
  /**
   * When `true`, every `<ReqoreIcon />` rendered without an explicit `glow` prop
   * receives a subtle drop-shadow glow using its resolved colour. Individual icons
   * can opt out with `glow={false}`.
   * @default false
   */
  readonly glowingIcons?: boolean;
  /**
   * When `true` (the default), buttons and inputs that declare a keyboard
   * `shortcut` / `focusRules` shortcut render a badge-style hint. Set to `false`
   * to hide all shortcut hints app-wide. Individual controls can still opt out
   * with `shortcutHint={false}`.
   * @default true
   */
  readonly shortcutHints?: boolean;
  readonly customPortalId?: string;
  readonly closePopoversOnEscPress?: boolean;
  readonly closeModalsOnEscPress?: boolean;
  readonly escClosableModals?: string[];
  readonly addEscClosableModal?: (id: string) => void;
  readonly removeEscClosableModal?: (
    id: string,
    onRemove?: () => void,
    confirmOnClose?: boolean | IReqoreConfirmationModal
  ) => void;
  readonly latestZIndex?: number;
  readonly errorBoundaryOptions?: Partial<IReqoreErrorBoundaryProps>;
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
  shortcutHints: true,
  escClosableModals: [],
  addEscClosableModal: null,
  removeEscClosableModal: null,
  theme: DEFAULT_THEME,
  uiScale: 1,
});
