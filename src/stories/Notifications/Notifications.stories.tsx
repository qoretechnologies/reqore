import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import ReqoreNotificationsWrapper, {
  IReqoreNotificationsWrapperProps,
} from '../../components/Notifications';
import ReqoreNotification, {
  IReqoreNotificationProps,
} from '../../components/Notifications/notification';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreUIProvider } from '../../index';

export default {
  title: 'Components/Notifications/Wrapper',
  component: ReqoreNotification,
} as Meta;

const Template: Story<
  IReqoreNotificationProps & IReqoreUIProviderProps & IReqoreNotificationsWrapperProps
> = ({
  theme,
  ...args
}: IReqoreNotificationProps & IReqoreUIProviderProps & IReqoreNotificationsWrapperProps) => (
  <ReqoreUIProvider theme={theme}>
    <ReqoreNotificationsWrapper position={args.position}>
      <ReqoreNotification
        {...args}
        type='info'
        content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
        onClick={noop}
      />
      <ReqoreNotification
        {...args}
        type='info'
        content="Hello, I am a very simple notification. Look at me, look at me? Isn't this great?"
        onClick={noop}
      />
    </ReqoreNotificationsWrapper>
  </ReqoreUIProvider>
);

export const Top = Template.bind({});
export const Bottom = Template.bind({});
Bottom.args = {
  position: 'BOTTOM',
};

export const TopLeft = Template.bind({});
TopLeft.args = {
  position: 'TOP LEFT',
};

export const TopRight = Template.bind({});
TopRight.args = {
  position: 'TOP RIGHT',
};

export const BottomLeft = Template.bind({});
BottomLeft.args = {
  position: 'BOTTOM LEFT',
};

export const BottomRight = Template.bind({});
BottomRight.args = {
  position: 'BOTTOM RIGHT',
};
