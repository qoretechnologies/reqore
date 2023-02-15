import { Meta, Story } from '@storybook/react/types-6-0';
import ReqoreNotification, {
  IReqoreNotificationProps,
} from '../../components/Notifications/notification';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreUIProvider, useReqoreProperty } from '../../index';

export default {
  title: 'Components/Notifications/Interactive',
  component: ReqoreNotification,
} as Meta;

const AddingButton = ({ id, onClick, onClose, onFinish }: any) => {
  const addNotification = useReqoreProperty('addNotification');

  return (
    <button
      onClick={() =>
        addNotification({
          title: 'Created notification',
          content: 'Yo, wassup?',
          icon: 'FileChartLine',
          duration: 5000,
          id: id || Date.now(),
          onClick,
          onClose,
          onFinish,
        })
      }
    >
      Add notification
    </button>
  );
};

const UpdatingButton = ({ id }) => {
  const addNotification = useReqoreProperty('addNotification');

  return (
    <button
      onClick={() =>
        addNotification({
          content: 'I have just updated!',
          icon: 'AccountPinBoxLine',
          type: 'danger',
          duration: 3000,
          id,
        })
      }
    >
      Update notification
    </button>
  );
};

const Template: Story<IReqoreNotificationProps & IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IReqoreNotificationProps & IReqoreUIProviderProps & { id?: string | number }) => (
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
