import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { useState } from 'react';
import { useMount } from 'react-use';
import ReqoreNotification, {
  IReqoreNotificationProps,
} from '../../components/Notifications/notification';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreTag, ReqoreUIProvider } from '../../index';
import { StoryMeta } from '../utils';

const meta: StoryMeta<typeof ReqoreNotification> = {
  title: 'Other/Notifications/Item/Stories',
  component: ReqoreNotification,
};

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreNotificationProps & IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IReqoreNotificationProps & IReqoreUIProviderProps) => (
  <ReqoreUIProvider theme={theme}>
    <ReqoreNotification
      {...args}
      type='info'
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClick={noop}
    />
    <ReqoreNotification {...args} type='pending' content='I am still waiting' onClick={noop} />
    <ReqoreNotification
      {...args}
      type='success'
      title='Simple notification'
      opaque
      content={
        <ReqoreTag
          label='Custom content in notification'
          effect={{ gradient: { colors: { 0: '#a11c58', 100: '#ff47a3' } } }}
        />
      }
      onClick={noop}
    />
    <ReqoreNotification
      {...args}
      type='warning'
      title='Simple notification'
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClose={noop}
    />
    <ReqoreNotification
      {...args}
      type='danger'
      title='Simple notification'
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClick={noop}
      onClose={noop}
    />
    <h4> Flat and minimal </h4>
    <ReqoreNotification
      {...args}
      type='danger'
      title='Simple notification'
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClick={noop}
      onClose={noop}
      flat
      minimal
    />
    <ReqoreNotification
      {...args}
      title='Simple notification'
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClick={noop}
      onClose={noop}
      intent='pending'
      minimal
    />
    <ReqoreNotification
      {...args}
      title='Simple notification'
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClick={noop}
      onClose={noop}
      flat
      opaque
      intent='info'
      size='big'
    />
    <ReqoreNotification
      {...args}
      title='Simple notification'
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClick={noop}
      onClose={noop}
      intent='success'
      flat
      icon='4KLine'
      size='small'
    />
    <ReqoreNotification
      {...args}
      title='Simple notification'
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClick={noop}
      onClose={noop}
      flat
      intent='danger'
      size='huge'
    />
    <ReqoreNotification
      {...args}
      title='Simple notification'
      content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
      onClick={noop}
      onClose={noop}
      intent='warning'
      flat
      icon='4KLine'
      size='tiny'
    />
  </ReqoreUIProvider>
);

const SingleTemplate: StoryFn<IReqoreNotificationProps & IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IReqoreNotificationProps & IReqoreUIProviderProps) => (
  <ReqoreUIProvider theme={theme}>
    <ReqoreNotification {...args} />
  </ReqoreUIProvider>
);

export const Default: Story = {
  render: Template,
};

export const CustomColors: Story = {
  render: Template,

  args: {
    theme: {
      notifications: {
        info: '#6c2d80',
        success: '#81a194',
        pending: '#b8d8f5',
        warning: '#382d31',
        danger: '#786714',
      },
    },
  },
};

export const CustomColors2: Story = {
  render: Template,

  args: {
    theme: {
      notifications: {
        info: '#d6bac0',
        success: '#2aeb37',
        pending: '#181d7d',
        warning: '#96714e',
        danger: '#b87cd6',
      },
    },
  },
};

export const WithTimeout: Story = {
  render: SingleTemplate,

  args: {
    type: 'info',
    content: 'I am a notification with a 10s timeout',
    onClick: noop,
    duration: 10000,
  },
};

const UpdateTemplate: StoryFn<IReqoreNotificationProps & IReqoreUIProviderProps> = ({
  theme,
  ...args
}: IReqoreNotificationProps & IReqoreUIProviderProps) => {
  const [notificationData, setNotificationData] = useState({ ...args });

  useMount(() => {
    setTimeout(() => {
      setNotificationData({
        ...notificationData,
        title: 'I am updated notification',
        content: 'Hellooo I am an updated notification with 7s duration',
        type: 'success',
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

export const WithUpdate: Story = {
  render: UpdateTemplate,

  args: {
    type: 'pending',
    content: 'I am a notification with a 10s timeout thats gonna update',
    onClick: noop,
    duration: 10000,
  },
};
