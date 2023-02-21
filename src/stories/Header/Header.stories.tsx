import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreHeadingProps } from '../../components/Header';
import { ReqoreControlGroup, ReqoreHeading } from '../../index';
import { IntentArg } from '../utils/args';

export default {
  title: 'Components/Heading',
  argTypes: {
    ...IntentArg,
  },
} as Meta;

const Template: Story<IReqoreHeadingProps> = (args) => {
  return (
    <ReqoreControlGroup gapSize='big' vertical>
      <ReqoreHeading size={1} {...args}>
        This is a heading
      </ReqoreHeading>
      <ReqoreHeading size={2} {...args}>
        This is a heading
      </ReqoreHeading>
      <ReqoreHeading size={3} {...args}>
        This is a heading
      </ReqoreHeading>
      <ReqoreHeading size={4} {...args}>
        This is a heading
      </ReqoreHeading>
      <ReqoreHeading size={5} {...args}>
        This is a heading
      </ReqoreHeading>
      <ReqoreHeading size={6} {...args}>
        This is a heading
      </ReqoreHeading>
      <ReqoreHeading size={1} {...args} tooltip={{ content: 'Nice tooltip', openOnMount: true }}>
        This is a heading with tooltip
      </ReqoreHeading>
    </ReqoreControlGroup>
  );
};

export const Basic = Template.bind({});
export const Success = Template.bind({});
Success.args = {
  intent: 'success',
};
export const Danger = Template.bind({});
Danger.args = {
  intent: 'danger',
};
export const Warning = Template.bind({});
Warning.args = {
  intent: 'warning',
};
export const Info = Template.bind({});
Info.args = {
  intent: 'info',
};
export const Pending = Template.bind({});
Pending.args = {
  intent: 'pending',
};
export const Muted = Template.bind({});
Muted.args = {
  intent: 'muted',
};
export const Effect = Template.bind({});
Effect.args = {
  effect: {
    gradient: { colors: { 0: '#5e0acc', 100: '#c008c0' } },
    spaced: 4,
    weight: 'bold',
    uppercase: true,
  },
};
