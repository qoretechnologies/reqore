import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import ReqoreNotificationsWrapper, {
  IReqoreNotificationsWrapperProps,
} from '../../components/Notifications';
import ReqoreNotification from '../../components/Notifications/notification';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreUIProvider } from '../../index';
import { StoryMeta } from '../utils';

const meta: StoryMeta<typeof ReqoreNotificationsWrapper> = {
  title: 'Other/Notifications/Wrapper/Stories',
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
  render: Template,
};

export const Bottom: Story = {
  render: Template,

  args: {
    position: 'BOTTOM',
  },
};

export const TopLeft: Story = {
  render: Template,

  args: {
    position: 'TOP LEFT',
  },
};

export const TopRight: Story = {
  render: Template,

  args: {
    position: 'TOP RIGHT',
  },
};

export const BottomLeft: Story = {
  render: Template,

  args: {
    position: 'BOTTOM LEFT',
  },
};

export const BottomRight: Story = {
  render: Template,

  args: {
    position: 'BOTTOM RIGHT',
  },
};
