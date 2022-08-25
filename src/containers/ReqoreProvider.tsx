import { size } from 'lodash';
import React, { useRef, useState } from 'react';
import { useMedia } from 'react-use';
import shortid from 'shortid';
import styled from 'styled-components';
import { ReqoreModal } from '..';
import ReqoreNotificationsWrapper, {
  IReqoreNotificationsPosition,
} from '../components/Notifications';
import ReqoreNotification, {
  IReqoreNotificationType,
} from '../components/Notifications/notification';
import { TSizes } from '../constants/sizes';
import { IReqoreIntent } from '../constants/theme';
import ReqoreContext from '../context/ReqoreContext';
import { IReqoreIconName } from '../types/icons';

export interface IReqoreNotificationData {
  title?: string;
  content: string;
  duration?: number;
  icon?: IReqoreIconName;
  onClick?: (id?: string) => any;
  onClose?: (id?: string) => any;
  onFinish?: (id?: string) => any;
  id?: string;
  type?: IReqoreNotificationType;
  intent?: IReqoreIntent;
  flat?: boolean;
  inverted?: boolean;
  size?: TSizes;
}

export interface IReqoreNotifications {
  children: any;
  position?: IReqoreNotificationsPosition;
}

export interface IReqoreConfirmationModal {
  title?: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmButtonIntent?: IReqoreIntent;
  confirmLabel?: string;
  confirmIcon?: IReqoreIconName;
  cancelLabel?: string;
  isOpen?: boolean;
  intent?: IReqoreIntent;
}

const StyledConfirmContent = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  min-height: 150px;
`;

const ReqoreProvider: React.FC<IReqoreNotifications> = ({ children, position }) => {
  const [notifications, setNotifications] = useState<IReqoreNotificationData[] | null>([]);
  const [confirmationModal, setConfirmationModal] = useState<IReqoreConfirmationModal>({});
  const latestZIndex = useRef<number>(9000);

  const isMobile = process.env.NODE_ENV === 'test' ? false : useMedia('(max-width: 480px)');
  const isTablet =
    process.env.NODE_ENV === 'test'
      ? false
      : useMedia('(min-width: 480px) and (max-width: 1200px)');
  const isMobileOrTablet = isMobile || isTablet;

  const getAndIncreaseZIndex = (): number => {
    latestZIndex.current += 1;

    return latestZIndex.current;
  };

  const confirmAction = (data: IReqoreConfirmationModal): void => {
    setConfirmationModal({
      ...data,
      isOpen: true,
    });
  };

  // FUnction that closes the confirmation modal
  const closeConfirmationModal = (): void => {
    setConfirmationModal((cur: IReqoreConfirmationModal) => ({
      ...cur,
      isOpen: false,
    }));
  };

  const addNotification = (data: IReqoreNotificationData) => {
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
  };

  const removeNotification = (id: string | number) => {
    setNotifications((cur) => {
      return [...cur].filter((notification) => notification.id !== id);
    });
  };

  return (
    <>
      <ReqoreContext.Provider
        value={{
          notifications,
          addNotification,
          removeNotification,
          confirmAction,
          isMobile,
          isTablet,
          isMobileOrTablet,
          getAndIncreaseZIndex,
        }}
      >
        {size(notifications) > 0 ? (
          <ReqoreNotificationsWrapper position={position}>
            {notifications.map((notification) => (
              <ReqoreNotification
                {...notification}
                key={notification.id}
                onClick={
                  notification?.onClick
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
        <ReqoreModal
          isOpen={confirmationModal.isOpen}
          flat
          opacity={0.9}
          blur={2}
          intent={confirmationModal.intent}
          label={confirmationModal.title || 'Confirm your action'}
          icon='ErrorWarningFill'
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
          {confirmationModal.description || 'Are you sure you want to proceed?'}
        </ReqoreModal>
      </ReqoreContext.Provider>
    </>
  );
};

export default ReqoreProvider;
