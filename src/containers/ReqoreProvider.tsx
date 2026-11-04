import { useMarqueeOnHover } from '../hooks/useMarqueeOnHover';
import { last, size } from 'lodash';
import { nanoid } from 'nanoid';
import React, { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useReqoreMedia } from '../hooks/useReqoreMedia';
import { useContext } from 'use-context-selector';
import { create } from 'zustand';
import { ReqoreModal, ReqoreTextEffect } from '..';
import { IReqoreModalProps } from '../components/Modal';
import ReqoreNotificationsWrapper, {
  IReqoreNotificationsPosition,
} from '../components/Notifications';
import ReqoreNotification, {
  IReqoreNotificationProps,
} from '../components/Notifications/notification';
import { IReqorePanelAction } from '../components/Panel';
import { IReqoreTheme, TReqoreIntent } from '../constants/theme';
import ReqoreContext, { IReqoreContext } from '../context/ReqoreContext';
import ThemeContext from '../context/ThemeContext';
import { IReqoreIconName } from '../types/icons';
import { IReqoreOptions } from './UIProvider';

export interface IReqoreNotificationData extends IReqoreNotificationProps {
  duration?: number;
  onClick?: (id?: string) => any;
  onClose?: (id?: string) => any;
  onFinish?: (id?: string) => any;
  id?: string;
  position?: IReqoreNotificationsPosition;
  closable?: boolean;
}

export interface IReqoreNotifications {
  children: any;
  options?: IReqoreOptions;
}

export interface IReqoreModal {
  modal: IReqoreModalFromProps | TReqoreCustomModal;
  options?: {
    closable?: boolean;
  };
}

export interface IReqoreModals {
  [id: string]: IReqoreModal;
}

export interface IReqoreModalFromProps extends IReqoreModalProps {}
export type TReqoreCustomModal = React.ReactElement<IReqoreModalProps>;

export interface IReqoreConfirmationModal {
  title?: string;
  label?: string;
  description?: string;
  content?: string;
  icon?: IReqoreIconName;

  onConfirm?: () => void;
  onCancel?: () => void;

  confirmButtonIntent?: TReqoreIntent;
  confirmLabel?: string;
  confirmIcon?: IReqoreIconName;
  confirmButtonProps?: IReqorePanelAction;

  cancelLabel?: string;
  cancelButtonIntent?: TReqoreIntent;
  cancelIcon?: IReqoreIconName;
  cancelButtonProps?: IReqorePanelAction;

  isOpen?: boolean;
  intent?: TReqoreIntent;
  modalProps?: IReqoreModalProps;
}

/**
 * Defaults for every confirmation `confirmAction` opens (`options.confirmations`), under each
 * call's own data — what an app decides once instead of at every call site: its words (so they
 * can be translated), its primary, and its look.
 */
export interface IReqoreConfirmationDefaults
  extends Omit<IReqoreConfirmationModal, 'onConfirm' | 'onCancel' | 'isOpen' | 'content'> {
  /**
   * The line under the title when a call gives none. Default `'Are you sure you want to
   * proceed?'`. `null`: no line — a title that asks the question needs no second one.
   */
  content?: string | null;
  /** The dialog's own opacity: below 1 the page shows through it. Default `0.9`; `1` for a
   *  solid dialog. */
  surfaceOpacity?: number;
  /** The blur of the backdrop behind the dialog, in pixels. Default `2`; `0` for none. */
  backdropBlur?: number;
  /**
   * How the dialog shows a call's `intent`. `'wash'` (the default, unchanged) draws the dialog in
   * it — its edge and title. `'icon'` keeps the dialog on its own surface and edge and colours
   * only its icon, for a theme that keeps colour for state.
   */
  intentLook?: 'wash' | 'icon';
}

const NO_CONFIRMATION_BODY = { display: 'none' } as const;

const DEFAULT_ERROR_BOUNDARY_OPTIONS = {
  errorMessage:
    'There was an error rendering this component. You can try resetting or refreshing the page.',
};
const DEFAULT_TOOLTIP_OPTIONS = { delay: 0 };
const NOTIFICATION_POSITIONS: IReqoreNotificationsPosition[] = [
  'TOP',
  'BOTTOM',
  'TOP LEFT',
  'TOP RIGHT',
  'BOTTOM LEFT',
  'BOTTOM RIGHT',
];

export const modalStore = create<{
  modals: IReqoreModals;
  addModal: IReqoreContext['addModal'];
  removeModal: IReqoreContext['removeModal'];
}>((set) => ({
  modals: {},
  addModal: (
    modal: IReqoreModalFromProps | TReqoreCustomModal,
    id: string = nanoid(),
    options?: IReqoreModal['options']
  ) => {
    set((cur) => ({
      modals: {
        ...cur.modals,
        [id]: {
          modal,
          options: {
            closable: options?.closable ?? true,
          },
        },
      },
    }));

    return id;
  },
  removeModal: (id: string) =>
    set((cur) => {
      const newModals = { ...cur.modals };
      delete newModals[id];

      return {
        modals: newModals,
      };
    }),
}));

const ReqoreProvider: React.FC<IReqoreNotifications> = memo(({ children, options = {} }) => {
  const [notifications, setNotifications] = useState<IReqoreNotificationData[] | null>([]);
  const { addModal, removeModal } = modalStore();
  const [escClosableModals, setEscClosableModals] = useState<string[]>([]);
  const [confirmationModal, setConfirmationModal] = useState<IReqoreConfirmationModal>({});
  const theme: IReqoreTheme = useContext<IReqoreTheme>(ThemeContext);
  const latestZIndex = useRef<number>(9000);

  // Live media queries in a browser, fixed defaults in jsdom — see
  // `useReqoreMedia` for why that is decided once per module load.
  const isMobile = useReqoreMedia('(max-width: 480px)');
  const isTablet = useReqoreMedia('(min-width: 480px) and (max-width: 1200px)');
  const isMobileOrTablet = isMobile || isTablet;
  // Pointer CAPABILITY, not viewport width — the two disagree often enough to
  // matter (a narrow desktop window hovers; a large tablet does not). Defaults to
  // `true` when the query cannot be evaluated so hover-gated UI keeps its desktop
  // behaviour instead of degrading.
  const isHoverCapable = useReqoreMedia('(hover: hover) and (pointer: fine)', true);

  const getAndIncreaseZIndex = useCallback((): number => {
    latestZIndex.current += 1;

    return latestZIndex.current;
  }, []);

  const confirmAction = useCallback((data: IReqoreConfirmationModal): void => {
    setConfirmationModal({
      ...data,
      isOpen: true,
    });
  }, []);

  // FUnction that closes the confirmation modal
  const closeConfirmationModal = useCallback((): void => {
    setConfirmationModal((cur: IReqoreConfirmationModal) => ({
      ...cur,
      isOpen: false,
    }));
  }, []);

  const addEscClosableModal = useCallback((id: string): void => {
    setEscClosableModals((cur) => [...cur, id]);
  }, []);

  /* The Escape stack as it was last committed: every modal that hears one Escape asks it, so they agree on which
     is on top, and only that one closes - taking itself off first would make the one under it the top for the
     next listener. */
  const committedEscClosableModals = useRef<string[]>([]);
  useLayoutEffect(() => {
    committedEscClosableModals.current = escClosableModals;
  }, [escClosableModals]);

  /**
   * Takes a modal off the Escape stack. With `onRemove` it is Escape asking the modal to close: only the top-most
   * one answers, and it is closed - after the confirmation, when it asks for one - by calling `onRemove` from the
   * key or the confirmation, never from a state updater. An updater runs while React renders this provider, so
   * the host's own state was set during another component's render (React warned, qorus#646). Without it the modal
   * is going: it leaves the stack wherever it is in it, where only the top-most used to.
   */
  const removeEscClosableModal = useCallback(
    (
      id: string,
      onRemove?: () => void,
      confirmOnClose?: boolean | IReqoreConfirmationModal
    ): void => {
      const takeOff = () => setEscClosableModals((cur) => cur.filter((modalId) => modalId !== id));

      if (!onRemove) {
        takeOff();

        return;
      }

      if (last(committedEscClosableModals.current) !== id) {
        return;
      }

      const close = () => {
        takeOff();
        onRemove();
      };

      if (confirmOnClose) {
        confirmAction({
          ...(typeof confirmOnClose === 'object' ? confirmOnClose : {}),
          onConfirm: close,
        });

        return;
      }

      close();
    },
    [confirmAction]
  );

  /* The app's confirmation defaults (`options.confirmations`) under each call's own data. */
  const confirmationDefaults = options?.confirmations;
  const confirmationIntent = confirmationModal.intent ?? confirmationDefaults?.intent;
  const confirmationIntentOnIcon = confirmationDefaults?.intentLook === 'icon';
  const confirmationContent =
    confirmationModal.content ||
    (confirmationDefaults?.content === null
      ? undefined
      : confirmationDefaults?.content || 'Are you sure you want to proceed?');

  const notificationDefaults = options?.notifications;
  const addNotification = useCallback(
    (data: IReqoreNotificationData) => {
      setNotifications((cur) => {
        let newNotifications = [...cur];
        const id = data.id || nanoid();
        // The app's defaults (`options.notifications`) under the notification's own props.
        const fixedData: IReqoreNotificationData = {
          position: 'TOP',
          ...notificationDefaults,
          ...data,
        };

        const index = cur.findIndex((notification) => notification.id === id);

        if (index >= 0) {
          newNotifications[index] = fixedData;
        } else {
          newNotifications = [...newNotifications, { ...fixedData, id }];
        }

        // If the length of the array is larger than 5, remove the first oldest notification
        if (newNotifications.length > 5) {
          newNotifications.shift();
        }

        return newNotifications;
      });
    },
    [notificationDefaults]
  );

  const removeNotification = (id: string | number) => {
    setNotifications((cur) => {
      return [...cur].filter((notification) => notification.id !== id);
    });
  };

  const getNotificationsByPosition = useCallback(
    (position: IReqoreNotificationsPosition) => {
      return notifications?.filter((notification) => notification.position === position) || [];
    },
    [notifications]
  );

  const notificationsByPosition = useMemo(() => {
    const notificationsByPosition: { [key: string]: IReqoreNotificationData[] } = {};

    NOTIFICATION_POSITIONS.forEach((position) => {
      notificationsByPosition[position] = getNotificationsByPosition(position);
    });

    return notificationsByPosition;
  }, [notifications, getNotificationsByPosition]);

  const resolvedOptions = useMemo(
    () => ({
      animations: {
        buttons: true,
        dialogs: true,
        popovers: true,
        marquee: true,
        ...(options?.animations || {}),
      },
      tooltips: options?.tooltips ?? DEFAULT_TOOLTIP_OPTIONS,
      closePopoversOnEscPress:
        options && 'closePopoversOnEscPress' in options ? options.closePopoversOnEscPress : true,
      closeModalsOnEscPress:
        options && 'closeModalsOnEscPress' in options ? options.closeModalsOnEscPress : true,
      customPortalId: options?.customPortalId,
      uiScale: options?.uiScale,
      glowingIcons: options?.glowingIcons ?? false,
      shortcutHints: options?.shortcutHints ?? true,
      errorBoundaryOptions: options?.errorBoundaryOptions || DEFAULT_ERROR_BOUNDARY_OPTIONS,
    }),
    [options]
  );

  // Truncated text scrolls into view on hover — one document-level behaviour
  // for every ellipsized element, gated on a real pointer (a touch screen has
  // no hover to rest in) and, inside the hook, on the OS motion setting.
  const marquee = resolvedOptions.animations.marquee;
  useMarqueeOnHover(
    isHoverCapable && marquee !== false,
    typeof marquee === 'object' ? marquee : undefined
  );

  const contextValue: IReqoreContext = useMemo(
    () =>
      ({
        notifications,
        theme,
        addNotification,
        removeNotification,
        addModal,
        removeModal,
        confirmAction,
        isMobile,
        isTablet,
        isMobileOrTablet,
        isHoverCapable,
        latestZIndex: latestZIndex.current,
        getAndIncreaseZIndex,
        animations: resolvedOptions.animations,
        tooltips: resolvedOptions.tooltips,
        glowingIcons: resolvedOptions.glowingIcons,
        shortcutHints: resolvedOptions.shortcutHints,
        closePopoversOnEscPress: resolvedOptions.closePopoversOnEscPress,
        // ESC Closable modals management
        closeModalsOnEscPress: resolvedOptions.closeModalsOnEscPress,
        escClosableModals,
        addEscClosableModal,
        removeEscClosableModal,
        customPortalId: resolvedOptions.customPortalId,
        uiScale: resolvedOptions.uiScale,
        errorBoundaryOptions: resolvedOptions.errorBoundaryOptions,
      } satisfies IReqoreContext),
    [
      notifications,
      theme,
      addNotification,
      removeNotification,
      addModal,
      removeModal,
      confirmAction,
      isMobile,
      isTablet,
      isMobileOrTablet,
      isHoverCapable,
      latestZIndex,
      getAndIncreaseZIndex,
      resolvedOptions,
      escClosableModals,
      addEscClosableModal,
      removeEscClosableModal,
    ]
  );

  return (
    <>
      <ReqoreContext.Provider value={contextValue}>
        {Object.entries(notificationsByPosition).map(([position, notifications]) =>
          size(notifications) ? (
            <ReqoreNotificationsWrapper
              key={position}
              position={position as IReqoreNotificationsPosition}
            >
              {notifications.map((notification) => (
                <ReqoreNotification
                  {...notification}
                  key={notification.id}
                  onClick={
                    notification.onClick
                      ? () => void notification.onClick(notification.id)
                      : undefined
                  }
                  onClose={
                    notification.closable === false
                      ? undefined
                      : () => {
                          if (notification.onClose) {
                            notification.onClose(notification.id);
                          }

                          removeNotification(notification.id);
                        }
                  }
                  onFinish={() => {
                    if (notification.onFinish) {
                      notification.onFinish(notification.id);
                    }

                    removeNotification(notification.id);
                  }}
                />
              ))}
            </ReqoreNotificationsWrapper>
          ) : null
        )}
        {children}
        {confirmationModal.isOpen && (
          <ReqoreModal
            isOpen
            flat
            opacity={confirmationDefaults?.surfaceOpacity ?? 0.9}
            blur={confirmationDefaults?.backdropBlur ?? 2}
            width='500px'
            intent={confirmationIntentOnIcon ? undefined : confirmationIntent}
            iconColor={confirmationIntentOnIcon ? confirmationIntent : undefined}
            label={
              confirmationModal.title ||
              confirmationModal.label ||
              confirmationDefaults?.title ||
              confirmationDefaults?.label ||
              'Confirm your action'
            }
            description={confirmationModal.description ?? confirmationDefaults?.description}
            icon={confirmationModal.icon || confirmationDefaults?.icon || 'ErrorWarningFill'}
            className='reqore-confirmation-modal'
            bottomActions={[
              {
                label:
                  confirmationModal.cancelLabel || confirmationDefaults?.cancelLabel || 'Cancel',
                icon:
                  confirmationModal.cancelIcon || confirmationDefaults?.cancelIcon || 'CloseLine',
                intent:
                  confirmationModal.cancelButtonIntent ?? confirmationDefaults?.cancelButtonIntent,
                /* A panel short of room drops its actions' labels and keeps the
                   icons, which is the right trade for a toolbar — the label is a
                   verb the icon already carries. Not here: this dialog exists to
                   say which of two buttons throws the work away, and narrow it
                   offered a tick and a cross with the destructive one named
                   nowhere. Pinned before the caller's props, so a caller that
                   wants the icon alone can still ask for it. */
                responsive: false,
                ...(confirmationDefaults?.cancelButtonProps || {}),
                ...(confirmationModal.cancelButtonProps || {}),
                onClick: () => {
                  closeConfirmationModal();
                  confirmationModal?.onCancel?.();
                },
                position: 'left',
              },
              {
                label:
                  confirmationModal.confirmLabel || confirmationDefaults?.confirmLabel || 'Confirm',
                // The call's own, else the app's default, else the theme's primary, else green.
                intent:
                  confirmationModal.confirmButtonIntent ||
                  confirmationDefaults?.confirmButtonIntent ||
                  theme?.primaryActionIntent ||
                  'success',
                icon:
                  confirmationModal.confirmIcon || confirmationDefaults?.confirmIcon || 'CheckLine',
                /* Named at every width — see the cancel action above. */
                responsive: false,
                ...(confirmationDefaults?.confirmButtonProps || {}),
                ...(confirmationModal.confirmButtonProps || {}),
                onClick: () => {
                  closeConfirmationModal();
                  confirmationModal?.onConfirm?.();
                },
                position: 'right',
              },
            ]}
            // With no line to show, no empty band between the title and the buttons.
            contentStyle={
              confirmationContent || confirmationModal.modalProps?.children
                ? undefined
                : NO_CONFIRMATION_BODY
            }
            {...(confirmationDefaults?.modalProps || {})}
            {...(confirmationModal.modalProps || {})}
          >
            {confirmationModal.modalProps?.children ||
              (confirmationContent ? (
                <ReqoreTextEffect
                  as='p'
                  effect={{ textAlign: 'center', weight: 'bold', textSize: 'big' }}
                >
                  {confirmationContent}
                </ReqoreTextEffect>
              ) : null)}
          </ReqoreModal>
        )}
      </ReqoreContext.Provider>
    </>
  );
});

export default ReqoreProvider;
