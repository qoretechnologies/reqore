import { Meta, Story } from '@storybook/react/types-6-0';
import ReqoreMessage, { IReqoreMessageProps } from '../../components/Message';
import { argManager, FlatArg, IntentArg, SizeArg } from '../utils/args';

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
    ...createArg('inverted', {
      defaultValue: false,
      name: 'Inverted',
      description: 'Inverts the message colors',
      type: 'boolean',
    }),
  },
  parameters: {
    chromatic: {
      delay: 3000,
    },
  },
} as Meta<IReqoreMessageProps>;

const Template: Story<IReqoreMessageProps> = (args: IReqoreMessageProps) => {
  return (
    <>
      <ReqoreMessage {...args}>
        In to am attended desirous raptures declared diverted confined at. Collected instantly
        remaining up certainly to necessary as. Over walk dull into son boy door went new. At or
        happiness commanded daughters as. Is handsome an declared at received in extended vicinity
        subjects. Into miss on he over been late pain an. Only week bore boy what fat case left use.
        Match round scale now sex style far times. Your me past an much.
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
export const Inverted: Story<IReqoreMessageProps> = Template.bind({});
Inverted.args = {
  inverted: true,
  intent: 'danger',
};

export const CustomTheme: Story<IReqoreMessageProps> = Template.bind({});
CustomTheme.args = {
  customTheme: {
    main: '#6e1295',
  },
};
