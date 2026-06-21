import { last, size } from 'lodash';
import { nanoid } from 'nanoid';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useMedia } from 'react-use';
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

  const isMobile = process.env.NODE_ENV === 'test' ? false : useMedia('(max-width: 480px)');
  const isTablet =
    process.env.NODE_ENV === 'test'
      ? false
      : useMedia('(min-width: 480px) and (max-width: 1200px)');
  const isMobileOrTablet = isMobile || isTablet;

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

  const removeEscClosableModal = useCallback(
    (
      id: string,
      onRemove?: () => void,
      confirmOnClose?: boolean | IReqoreConfirmationModal
    ): void => {
      const onConfirm = (cur) => {
        onRemove?.();

        return [...cur].filter((modalId) => modalId !== id);
      };

      if (confirmOnClose) {
        confirmAction({
          ...(typeof confirmOnClose === 'object' ? confirmOnClose : {}),
          onConfirm: () => {
            setEscClosableModals((cur) => onConfirm(cur));
          },
        });

        return;
      }

      setEscClosableModals((cur) => {
        // Check if the modal is still in the array and it's the last one
        if (last(cur) === id) {
          return onConfirm(cur);
        }

        return cur;
      });
    },
    [confirmAction]
  );

  const addNotification = useCallback((data: IReqoreNotificationData) => {
    setNotifications((cur) => {
      let newNotifications = [...cur];
      const id = data.id || nanoid();
      const fixedData: IReqoreNotificationData = {
        position: 'TOP',
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
  }, []);

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
            opacity={0.9}
            blur={2}
            width='500px'
            intent={confirmationModal.intent}
            label={confirmationModal.title || confirmationModal.label || 'Confirm your action'}
            description={confirmationModal.description}
            icon={confirmationModal.icon || 'ErrorWarningFill'}
            className='reqore-confirmation-modal'
            bottomActions={[
              {
                label: confirmationModal.cancelLabel || 'Cancel',
                icon: confirmationModal.cancelIcon || 'CloseLine',
                intent: confirmationModal.cancelButtonIntent,
                ...(confirmationModal.cancelButtonProps || {}),
                onClick: () => {
                  closeConfirmationModal();
                  confirmationModal?.onCancel?.();
                },
                position: 'left',
              },
              {
                label: confirmationModal.confirmLabel || 'Confirm',
                intent: confirmationModal.confirmButtonIntent || 'success',
                icon: confirmationModal.confirmIcon || 'CheckLine',
                ...(confirmationModal.confirmButtonProps || {}),
                onClick: () => {
                  closeConfirmationModal();
                  confirmationModal?.onConfirm?.();
                },
                position: 'right',
              },
            ]}
            {...(confirmationModal.modalProps || {})}
          >
            {confirmationModal.modalProps?.children || (
              <ReqoreTextEffect
                as='p'
                effect={{ textAlign: 'center', weight: 'bold', textSize: 'big' }}
              >
                {confirmationModal.content || 'Are you sure you want to proceed?'}
              </ReqoreTextEffect>
            )}
          </ReqoreModal>
        )}
      </ReqoreContext.Provider>
    </>
  );
});

export default ReqoreProvider;
