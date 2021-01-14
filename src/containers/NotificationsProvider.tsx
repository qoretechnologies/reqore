import { useState } from 'react';

export interface IReqoreNotifications {}

const NotificationsProvider = ({ children }: { children: any }) => {
  const [notifications, setNotifications] = useState<IReqoreNotifications>([]);
};

export default NotificationsProvider;
