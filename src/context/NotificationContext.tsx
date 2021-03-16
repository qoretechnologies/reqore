import { createContext } from "react";
import { IReqoreNotificationData } from "../containers/NotificationsProvider";

export default createContext<{
  notifications?: IReqoreNotificationData[] | null;
  addNotification?: (data: IReqoreNotificationData) => any;
  removeNotification?: (id: string) => any;
}>({});
