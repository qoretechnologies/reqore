import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreParagraphProps } from '../../components/Paragraph';
import { ReqoreParagraph, ReqoreVerticalSpacer } from '../../index';
import { IntentArg } from '../utils/args';

export default {
  title: 'Other/Paragraph/Stories',
  argTypes: {
    ...IntentArg,
  },
} as Meta;

const Template: Story<IReqoreParagraphProps> = (args) => {
  return (
    <>
      <ReqoreParagraph size='tiny' {...args}>
        This is a paragraph of some text
      </ReqoreParagraph>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreParagraph size='small' {...args}>
        This is a paragraph of some text
      </ReqoreParagraph>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreParagraph size='normal' {...args}>
        This is a paragraph of some text
      </ReqoreParagraph>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreParagraph size='big' {...args}>
        This is a paragraph of some text
      </ReqoreParagraph>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreParagraph size='huge' {...args}>
        This is a paragraph of some text
      </ReqoreParagraph>
    </>
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
    textSize: '40px',
  },
};
