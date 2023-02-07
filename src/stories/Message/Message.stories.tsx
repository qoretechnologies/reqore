import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import ReqoreMessage, { IReqoreMessageProps } from '../../components/Message';
import { FlatArg, IntentArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreMessageProps>();

export default {
  title: 'Components/Message',
  argTypes: {
    ...SizeArg,
    ...FlatArg,
    ...IntentArg,
    ...createArg('title', {
      defaultValue: 'This is a test',
      name: 'Message Header',
      type: 'string',
      description: 'The title of the message',
    }),
    ...createArg('minimal', {
      defaultValue: false,
      name: 'Minimal',
      description: 'If the message should be minimal',
      type: 'boolean',
    }),
  },
} as Meta<IReqoreMessageProps>;

const Template: Story<IReqoreMessageProps> = (args: IReqoreMessageProps) => {
  return (
    <>
      <ReqoreMessage {...args} fixed onClick={noop}>
        In to am attended desirous raptures
      </ReqoreMessage>
    </>
  );
};

export const Basic: Story<IReqoreMessageProps> = Template.bind({});
export const Flat: Story<IReqoreMessageProps> = Template.bind({});
Flat.args = {
  flat: true,
  intent: 'success',
};
export const Minimal: Story<IReqoreMessageProps> = Template.bind({});
Minimal.args = {
  minimal: true,
  intent: 'danger',
};

export const WithIconColor: Story<IReqoreMessageProps> = Template.bind({});
WithIconColor.args = {
  minimal: true,
  intent: 'success',
  iconColor: '#00fd9f',
};

export const Opaque: Story<IReqoreMessageProps> = Template.bind({});
Opaque.args = {
  opaque: true,
  intent: 'info',
};

export const CustomTheme: Story<IReqoreMessageProps> = Template.bind({});
CustomTheme.args = {
  customTheme: {
    main: '#6e1295',
  },
};

export const Effect: Story<IReqoreMessageProps> = Template.bind({});
Effect.args = {
  effect: {
    gradient: {
      colors: {
        0: '#eb0e8c',
        100: 'danger:darken:2',
      },
    },
  },
};
