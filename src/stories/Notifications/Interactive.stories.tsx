import { StoryObj } from '@storybook/react';
import ReqoreNotification from '../../components/Notifications/notification';
import { ReqoreUIProvider, useReqoreProperty } from '../../index';
import { StoryMeta, StoryRenderer } from '../utils';

const meta = {
  title: 'Other/Notifications/Interactive/Stories',
  component: ReqoreNotification,
} as StoryMeta<typeof ReqoreNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

const AddingButton = ({ id, onClick, onClose, onFinish }: any) => {
  const addNotification = useReqoreProperty('addNotification');

  return (
    <button
      onClick={() =>
        addNotification({
          title: 'Created notification',
          content: 'Yo, wassup?',
          icon: 'FileChartLine',
          opaque: true,
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

const Template: StoryRenderer<typeof meta> = ({ theme, ...args }) => (
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
      {args.notificationId && <UpdatingButton id={args.id} />}
    </div>
  </ReqoreUIProvider>
);

export const Adding: Story = {
  render: Template,
};

export const Updating: Story = {
  render: Template,

  args: {
    notificationId: 'test',
  },
};

export const Clickable: Story = {
  render: Template,

  args: {
    onClick: () => {
      alert(`Notification clicked`);
    },
  },
};

export const CloseCallback: Story = {
  render: Template,

  args: {
    onClose: () => {
      alert(`Notification closed`);
    },
  },
};

export const FinishCallback: Story = {
  render: Template,

  args: {
    onFinish: () => {
      alert(`Notification finished`);
    },
  },
};
