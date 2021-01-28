import { Button } from '@blueprintjs/core';
import { Meta, Story } from '@storybook/react/types-6-0';
import React, { useContext } from 'react';
import ReqoreNotification, {
  IReqoreNotificationProps,
} from '../../components/Notifications/notification';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreNotificationsContext, ReqoreUIProvider } from '../../index';

export default {
  title: 'ReQore/Notifications/Interactive',
  component: ReqoreNotification,
} as Meta;

const AddingButton = ({ id, onClick, onClose, onFinish }: any) => {
  const { addNotification } = useContext(ReqoreNotificationsContext);

  return (
    <Button
      onClick={() =>
        addNotification({
          title: 'Created notification',
          content: 'Yo, wassup?',
          icon: 'person',
          duration: 5000,
          id: id || Date.now(),
          onClick,
          onClose,
          onFinish,
        })
      }
    >
      Add notification
    </Button>
  );
};

const UpdatingButton = ({ id }) => {
  const { addNotification } = useContext(ReqoreNotificationsContext);

  return (
    <Button
      onClick={() =>
        addNotification({
          content: 'I have just updated!',
          icon: 'tree',
          type: 'danger',
          duration: 3000,
          id,
        })
      }
    >
      Update notification
    </Button>
  );
};

const Template: Story<IReqoreNotificationProps & IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IReqoreNotificationProps &
  IReqoreUIProviderProps & { id?: string | number }) => (
  <ReqoreUIProvider theme={theme}>
    <div
      style={{
        width: '100%',
        height: '500px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexFlow: 'column',
      }}
    >
      <h4>Hello, I am a notification testing page</h4>
      <AddingButton {...args} />
      {args.id && <UpdatingButton id={args.id} />}
    </div>
  </ReqoreUIProvider>
);

export const Adding = Template.bind({});

export const Updating = Template.bind({});
Updating.args = {
  id: 'test',
};

export const Clickable = Template.bind({});
Clickable.args = {
  onClick: (id) => {
    alert(`Notification ${id} clicked`);
  },
};

export const CloseCallback = Template.bind({});
CloseCallback.args = {
  onClose: (id) => {
    alert(`Notification ${id} closed`);
  },
};

export const FinishCallback = Template.bind({});
FinishCallback.args = {
  onFinish: (id) => {
    alert(`Notification ${id} finished`);
  },
};
