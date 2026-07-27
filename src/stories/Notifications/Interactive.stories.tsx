import { StoryObj } from '@storybook/react';
import ReqoreNotification from '../../components/Notifications/notification';
import { ReqoreUIProvider, useReqoreProperty } from '../../index';
import { StoryMeta, StoryRenderer } from '../utils';

const meta = {
  title: 'Other/Notifications/Interactive',
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
          id,
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
      <AddingButton {...args} id='test' />
      {args.notificationId && <UpdatingButton id={args.notificationId} />}
    </div>
  </ReqoreUIProvider>
);

export const Adding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Notification while a new item is being added.',
      },
    },
  },
  render: Template,
};

export const Updating: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Notification while its content is updating.',
      },
    },
  },
  render: Template,

  args: {
    notificationId: 'test',
  },
};

export const Clickable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Notification in a clickable variant so hover and press states are exercised.',
      },
    },
  },
  render: Template,

  args: {
    onClick: () => {
      alert(`Notification clicked`);
    },
  },
};

export const CloseCallback: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Notification with a close callback wired in.',
      },
    },
  },
  render: Template,

  args: {
    onClose: () => {
      alert(`Notification closed`);
    },
  },
};

export const FinishCallback: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Notification with a finish callback wired in.',
      },
    },
  },
  render: Template,

  args: {
    onFinish: () => {
      alert(`Notification finished`);
    },
  },
};
