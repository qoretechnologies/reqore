import { IconName, MaybeElement } from '@blueprintjs/core';
import React, { useState } from 'react';
import ReqoreNotificationsWrapper, {
  IReqoreNotificationsPosition,
} from '../components/Notifications';
import ReqoreNotification, {
  IReqoreNotificationType,
} from '../components/Notifications/notification';
import NotificationContext from '../context/NotificationContext';

export interface IReqoreNotificationData {
  title?: string;
  content: string;
  duration?: number;
  icon?: IconName | MaybeElement;
  onClick?: (id?: string) => any;
  onClose?: (id?: string) => any;
  onFinish?: (id?: string) => any;
  id: string;
  type?: IReqoreNotificationType;
}
export interface IReqoreNotifications {
  children: any;
  position?: IReqoreNotificationsPosition;
}

const ReqoreNotifications: React.FC<IReqoreNotifications> = ({
  children,
  position,
}) => {
  const [notifications, setNotifications] = useState<
    IReqoreNotificationData[] | null
  >([]);

  const addNotification = (data: IReqoreNotificationData) => {
    setNotifications((cur) => {
      let newNotifications = [...cur];

      const index = cur.findIndex(
        (notification) => notification.id === data.id
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
      <NotificationContext.Provider
        value={{ notifications, addNotification, removeNotification }}
      >
        {notifications.length > 0 ? (
          <ReqoreNotificationsWrapper position={position}>
            {notifications.map((notification) => (
              <ReqoreNotification
                {...notification}
                key={notification.id}
                onClick={() => {
                  if (notification.onClick) {
                    notification.onClick(notification.id);
                  }
                }}
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
      </NotificationContext.Provider>
    </>
  );
};

export default ReqoreNotifications;
