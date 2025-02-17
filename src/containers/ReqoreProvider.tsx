import { last, size } from 'lodash';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useMedia } from 'react-use';
import shortid from 'shortid';
import { useContext } from 'use-context-selector';
import { create } from 'zustand';
import { ReqoreModal, ReqoreTextEffect } from '..';
import { IReqoreModalProps } from '../components/Modal';
import ReqoreNotificationsWrapper from '../components/Notifications';
import ReqoreNotification, {
  IReqoreNotificationProps,
} from '../components/Notifications/notification';
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
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmButtonIntent?: TReqoreIntent;
  confirmLabel?: string;
  confirmIcon?: IReqoreIconName;
  cancelLabel?: string;
  isOpen?: boolean;
  intent?: TReqoreIntent;
}

export const modalStore = create<{
  modals: IReqoreModals;
  addModal: IReqoreContext['addModal'];
  removeModal: IReqoreContext['removeModal'];
}>((set) => ({
  modals: {},
  addModal: (
    modal: IReqoreModalFromProps | TReqoreCustomModal,
    id: string = shortid.generate(),
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
  }, [latestZIndex.current]);

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

  const removeEscClosableModal = useCallback((id: string, onRemove?: () => void): void => {
    setEscClosableModals((cur) => {
      // Check if the modal is still in the array and it's the last one
      if (last(cur) === id) {
        onRemove?.();

        return [...cur].filter((modalId) => modalId !== id);
      }

      return cur;
    });
  }, []);

  const addNotification = useCallback((data: IReqoreNotificationData) => {
    setNotifications((cur) => {
      let newNotifications = [...cur];

      const index = cur.findIndex(
        (notification) => notification.id === (data.id || shortid.generate())
      );

      if (index >= 0) {
        newNotifications[index] = data;
      } else {
        newNotifications = [...newNotifications, data];
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
        animations: {
          buttons: true,
          dialogs: true,
          popovers: true,
          ...(options?.animations || {}),
        },
        tooltips: options.tooltips || { delay: 0 },
        closePopoversOnEscPress:
          'closePopoversOnEscPress' in options ? options.closePopoversOnEscPress : true,
        // ESC Closable modals management
        closeModalsOnEscPress:
          'closeModalsOnEscPress' in options ? options.closeModalsOnEscPress : true,
        escClosableModals,
        addEscClosableModal,
        removeEscClosableModal,
        customPortalId: options.customPortalId,
        uiScale: options.uiScale,
        errorBoundaryOptions: options.errorBoundaryOptions || {
          errorMessage:
            'There was an error rendering this component. You can try resetting or refreshing the page.',
        },
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
      options,
      escClosableModals,
      addEscClosableModal,
      removeEscClosableModal,
    ]
  );

  return (
    <>
      <ReqoreContext.Provider value={contextValue}>
        {size(notifications) > 0 ? (
          <ReqoreNotificationsWrapper position={options.notificationsPosition}>
            {notifications.map((notification) => (
              <ReqoreNotification
                {...notification}
                key={notification.id}
                onClick={
                  notification.onClick
                    ? () => void notification.onClick(notification.id)
                    : undefined
                }
                onClose={() => {
                  if (notification.onClose) {
                    notification.onClose(notification.id);
                  }

                  removeNotification(notification.id);
                }}
                onFinish={() => {
                  if (notification.onFinish) {
                    notification.onFinish(notification.id);
                  }

                  removeNotification(notification.id);
                }}
              />
            ))}
          </ReqoreNotificationsWrapper>
        ) : null}
        {children}
        {confirmationModal.isOpen && (
          <ReqoreModal
            isOpen
            flat
            opacity={0.9}
            blur={2}
            width='500px'
            intent={confirmationModal.intent}
            label={confirmationModal.title || 'Confirm your action'}
            icon='ErrorWarningFill'
            className='reqore-confirmation-modal'
            bottomActions={[
              {
                label: confirmationModal.cancelLabel || 'Cancel',
                icon: 'CloseLine',
                onClick: () => {
                  confirmationModal?.onCancel?.();
                  closeConfirmationModal();
                },
                position: 'left',
              },
              {
                label: confirmationModal.confirmLabel || 'Confirm',
                intent: confirmationModal.confirmButtonIntent || 'success',
                icon: confirmationModal.confirmIcon || 'CheckLine',
                onClick: () => {
                  confirmationModal?.onConfirm?.();
                  closeConfirmationModal();
                },
                position: 'right',
              },
            ]}
          >
            <ReqoreTextEffect
              as='p'
              effect={{ textAlign: 'center', weight: 'bold', textSize: 'big' }}
            >
              {confirmationModal.description || 'Are you sure you want to proceed?'}
            </ReqoreTextEffect>
          </ReqoreModal>
        )}
      </ReqoreContext.Provider>
    </>
  );
});

export default ReqoreProvider;
