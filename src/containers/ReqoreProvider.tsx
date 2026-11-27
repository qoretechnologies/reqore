import { useMarqueeOnHover } from '../hooks/useMarqueeOnHover';
import { reqoreMedia, TReqoreWindowSizeClass } from '../constants/breakpoints';
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
import { scheduleOnTimer } from '../helpers/schedule';
import ThemeContext from '../context/ThemeContext';
import { IReqoreIconName } from '../types/icons';
import { IReqoreOptions } from './UIProvider';
import { BACKDROP_BLUR_DEFAULT } from '../components/Drawer/backdrop';

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
  /** The blur of the page behind every dialog, in pixels. Default `BACKDROP_BLUR_DEFAULT` (5); `0` for none. */
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
    'This part of the page could not be shown. Try again, or reload the page.',
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

/** Marks the element a dialog's focus trap gives focus to when it opens (see useFocusTrap). */
const INITIAL_FOCUS: Record<string, unknown> = { 'data-reqore-initial-focus': true };

/* One object, so a provider given no options does not rebuild its context on each of its own renders. */
const NO_OPTIONS: IReqoreNotifications['options'] = {};

const ReqoreProvider: React.FC<IReqoreNotifications> = memo(({ children, options = NO_OPTIONS }) => {
  const [notifications, setNotifications] = useState<IReqoreNotificationData[] | null>([]);
  const { addModal, removeModal } = modalStore();
  /* The Escape stack: one array for the provider's life, changed in place. It is not state, so a dialog opening or
     closing re-renders nothing but itself; as state it gave the context a new value, and every component that reads
     the context ran again on every open and close. */
  const escClosableModals = useRef<string[]>([]).current;
  /* The toasts on screen, mirrored into one array for the context the same way: the provider draws them from its
     state, and a toast coming or going re-renders nothing that reads the context. */
  const notificationsNow = useRef<IReqoreNotificationData[]>([]).current;
  const [confirmationModal, setConfirmationModal] = useState<IReqoreConfirmationModal>({});
  const theme: IReqoreTheme = useContext<IReqoreTheme>(ThemeContext);
  const latestZIndex = useRef<number>(9000);

  // Live media queries in a browser, fixed defaults in jsdom — see
  // `useReqoreMedia` for why that is decided once per module load.
  // One chain of "narrower than" queries, so a width is in exactly one window size class (the
  // flags were two ranges that were both true at 480px). Material 3's classes.
  const isBelowMedium = useReqoreMedia(reqoreMedia.below('medium'));
  const isBelowExpanded = useReqoreMedia(reqoreMedia.below('expanded'));
  const isBelowLarge = useReqoreMedia(reqoreMedia.below('large'));
  const isBelowExtraLarge = useReqoreMedia(reqoreMedia.below('extraLarge'));
  const windowSizeClass: TReqoreWindowSizeClass = isBelowMedium
    ? 'compact'
    : isBelowExpanded
      ? 'medium'
      : isBelowLarge
        ? 'expanded'
        : isBelowExtraLarge
          ? 'large'
          : 'extraLarge';
  const isMobile = windowSizeClass === 'compact';
  const isTablet = windowSizeClass === 'medium' || windowSizeClass === 'expanded';
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

  /* Escape or the × on a confirmation cancels it, as its Cancel does. */
  const cancelConfirmationModal = useCallback((): void => {
    closeConfirmationModal();
    confirmationModal?.onCancel?.();
  }, [closeConfirmationModal, confirmationModal]);

  const addEscClosableModal = useCallback(
    (id: string): void => {
      if (!escClosableModals.includes(id)) escClosableModals.push(id);
    },
    [escClosableModals]
  );

  /**
   * Takes a modal off the Escape stack. With `onRemove` it is Escape asking the modal to close: only the top-most
   * one answers, and it is closed - after the confirmation, when it asks for one - by calling `onRemove`. It stays
   * on the stack until it is gone (its own cleanup takes it off), so every dialog that hears the same Escape agrees
   * on which one is on top, and the one under it does not close too. Without `onRemove` the modal is going: it
   * leaves the stack wherever it is in it.
   */
  const removeEscClosableModal = useCallback(
    (
      id: string,
      onRemove?: () => void,
      confirmOnClose?: boolean | IReqoreConfirmationModal
    ): void => {
      if (!onRemove) {
        const index = escClosableModals.indexOf(id);
        if (index >= 0) escClosableModals.splice(index, 1);

        return;
      }

      if (last(escClosableModals) !== id) {
        return;
      }

      const close = () => {
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
    [confirmAction, escClosableModals]
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

  const removeNotification = useCallback((id: string | number) => {
    setNotifications((cur) => {
      return [...cur].filter((notification) => notification.id !== id);
    });
  }, []);

  useLayoutEffect(() => {
    notificationsNow.splice(0, notificationsNow.length, ...(notifications ?? []));
  }, [notifications, notificationsNow]);

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
      backdropBlur: options?.backdropBlur,
      dialogOpacity: options?.dialogOpacity,
      dialogWidth: options?.dialogWidth,
      dialogBlur: options?.dialogBlur,
      errorBoundaryOptions: options?.errorBoundaryOptions || DEFAULT_ERROR_BOUNDARY_OPTIONS,
      schedule: options?.schedule ?? scheduleOnTimer,
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
        notifications: notificationsNow,
        theme,
        addNotification,
        removeNotification,
        addModal,
        removeModal,
        confirmAction,
        isMobile,
        isTablet,
        isMobileOrTablet,
        windowSizeClass,
        isHoverCapable,
        latestZIndex: latestZIndex.current,
        getAndIncreaseZIndex,
        animations: resolvedOptions.animations,
        tooltips: resolvedOptions.tooltips,
        glowingIcons: resolvedOptions.glowingIcons,
        shortcutHints: resolvedOptions.shortcutHints,
        backdropBlur: resolvedOptions.backdropBlur,
        dialogOpacity: resolvedOptions.dialogOpacity,
        dialogWidth: resolvedOptions.dialogWidth,
        dialogBlur: resolvedOptions.dialogBlur,
        closePopoversOnEscPress: resolvedOptions.closePopoversOnEscPress,
        // ESC Closable modals management
        closeModalsOnEscPress: resolvedOptions.closeModalsOnEscPress,
        escClosableModals,
        addEscClosableModal,
        removeEscClosableModal,
        customPortalId: resolvedOptions.customPortalId,
        uiScale: resolvedOptions.uiScale,
        errorBoundaryOptions: resolvedOptions.errorBoundaryOptions,
        schedule: resolvedOptions.schedule,
      } satisfies IReqoreContext),
    [
      notificationsNow,
      theme,
      addNotification,
      removeNotification,
      addModal,
      removeModal,
      confirmAction,
      isMobile,
      isTablet,
      isMobileOrTablet,
      windowSizeClass,
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
            blur={confirmationDefaults?.backdropBlur ?? resolvedOptions.backdropBlur ?? BACKDROP_BLUR_DEFAULT}
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
            /* Escape cancels, as its Cancel does (APG alertdialog), and only it: it is on top of
               the Escape stack, so the drawer or modal under it stays. */
            onClose={cancelConfirmationModal}
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
                /* The dialog opens with Cancel focused, its least destructive answer, ahead of
                   the x its title bar has for Escape's sake (the x came first in the tab order). */
                ...INITIAL_FOCUS,
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
