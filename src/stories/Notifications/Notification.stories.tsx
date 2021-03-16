import { Meta, Story } from "@storybook/react/types-6-0";
import { noop } from "lodash";
import React, { useState } from "react";
import { useMount } from "react-use";
import ReqoreNotification, {
  IReqoreNotificationProps,
} from "../../components/Notifications/notification";
import { IReqoreUIProviderProps } from "../../containers/UIProvider";
import { ReqoreUIProvider } from "../../index";

export default {
  title: "ReQore/Notifications/Item",
  component: ReqoreNotification,
} as Meta;

const Template: Story<IReqoreNotificationProps & IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IReqoreNotificationProps & IReqoreUIProviderProps) => (
  <ReqoreUIProvider theme={theme}>
    <ReqoreNotification
      {...args}
      type="info"
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClick={noop}
    />
    <ReqoreNotification
      {...args}
      type="pending"
      icon="TimerLine"
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClick={noop}
    />
    <ReqoreNotification
      {...args}
      type="success"
      title="Simple notification"
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClick={noop}
    />
    <ReqoreNotification
      {...args}
      type="warning"
      title="Simple notification"
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClose={noop}
    />
    <ReqoreNotification
      {...args}
      type="danger"
      title="Simple notification"
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClick={noop}
      onClose={noop}
    />
  </ReqoreUIProvider>
);

const SingleTemplate: Story<
  IReqoreNotificationProps & IReqoreUIProviderProps
> = ({ theme, ...args }: IReqoreNotificationProps & IReqoreUIProviderProps) => (
  <ReqoreUIProvider theme={theme}>
    <ReqoreNotification {...args} />
  </ReqoreUIProvider>
);

export const Default = Template.bind({});

export const CustomColors = Template.bind({});

CustomColors.args = {
  theme: {
    notifications: {
      info: {
        background: "#d5a2f5",
      },
      success: {
        background: "#fab6f3",
      },
      pending: {
        background: "#ab7876",
      },
      warning: {
        background: "#4a2252",
      },
      danger: {
        background: "#1c5958",
        iconColor: "#fff",
        titleColor: "#d9e687",
        contentColor: "#a7cfce",
      },
    },
  },
} as IReqoreUIProviderProps;

export const WithTimeout = SingleTemplate.bind({});

WithTimeout.args = {
  type: "info",
  content: "I am a notification with a 10s timeout",
  onClick: noop,
  duration: 10000,
};

const UpdateTemplate: Story<
  IReqoreNotificationProps & IReqoreUIProviderProps
> = ({ theme, ...args }: IReqoreNotificationProps & IReqoreUIProviderProps) => {
  const [notificationData, setNotificationData] = useState({ ...args });

  useMount(() => {
    setTimeout(() => {
      setNotificationData({
        ...notificationData,
        title: "I am updated notification",
        content: "Hellooo I am an updated notification with 7s duration",
        type: "success",
        duration: 7000,
      });
    }, 5000);
  });

  return (
    <ReqoreUIProvider theme={theme}>
      <ReqoreNotification {...notificationData} />
    </ReqoreUIProvider>
  );
};

export const WithUpdate = UpdateTemplate.bind({});

WithUpdate.args = {
  type: "pending",
  content: "I am a notification with a 10s timeout thats gonna update",
  onClick: noop,
  duration: 10000,
};
