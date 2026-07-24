import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { useMount } from 'react-use';
import { _testsWaitForText } from '../../../__tests__/utils';
import ReqoreNotificationsWrapper, {
  IReqoreNotificationsWrapperProps,
} from '../../components/Notifications';
import ReqoreNotification from '../../components/Notifications/notification';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreUIProvider, useReqoreProperty } from '../../index';
import { StoryMeta } from '../utils';

const meta: StoryMeta<typeof ReqoreNotificationsWrapper> = {
  title: 'Other/Notifications/Wrapper',
  component: ReqoreNotificationsWrapper,
};

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreUIProviderProps & IReqoreNotificationsWrapperProps> = ({
  theme,
  ...args
}) => (
  <ReqoreUIProvider theme={theme}>
    <ReqoreNotificationsWrapper position={args.position}>
      <ReqoreNotification
        type='info'
        content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
        onClick={noop}
      />
      <ReqoreNotification
        type='info'
        content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
        onClick={noop}
      />
    </ReqoreNotificationsWrapper>
  </ReqoreUIProvider>
);

export const Top: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders NotificationsWrapper at the top position.',
      },
    },
  },
  render: Template,
};

export const Bottom: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders NotificationsWrapper at the bottom position.',
      },
    },
  },
  render: Template,

  args: {
    position: 'BOTTOM',
  },
};

export const TopLeft: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders NotificationsWrapper in the top-left position.',
      },
    },
  },
  render: Template,

  args: {
    position: 'TOP LEFT',
  },
};

export const TopRight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders NotificationsWrapper in the top-right position.',
      },
    },
  },
  render: Template,

  args: {
    position: 'TOP RIGHT',
  },
};

export const BottomLeft: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders NotificationsWrapper in the bottom-left position.',
      },
    },
  },
  render: Template,

  args: {
    position: 'BOTTOM LEFT',
  },
};

export const BottomRight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders NotificationsWrapper in the bottom-right position.',
      },
    },
  },
  render: Template,

  args: {
    position: 'BOTTOM RIGHT',
  },
};

const MultiplePositionsTemplate = () => {
  const addNotification = useReqoreProperty('addNotification');

  useMount(() => {
    addNotification({
      position: 'TOP LEFT',
      content: 'I am a notification in the top left',
      icon: 'AccountPinBoxLine',
      type: 'info',
    });

    addNotification({
      position: 'BOTTOM',
      content: 'I am a notification in the bottom',
      icon: 'ChatAiFill',
      type: 'warning',
      closable: false,
    });
  });

  return null;
};

export const MultiplePositionsAtOnce: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders NotificationsWrapper with multiple positions active simultaneously.',
      },
    },
  },
  render: () => {
    return (
      <ReqoreUIProvider>
        <MultiplePositionsTemplate />
      </ReqoreUIProvider>
    );
  },
  play: async () => {
    await _testsWaitForText('I am a notification in the top left');
    await _testsWaitForText('I am a notification in the bottom');
  },
};
