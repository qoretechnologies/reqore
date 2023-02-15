import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreSpinnerProps, ReqoreSpinner } from '../../components/Spinner';
import { ReqoreControlGroup } from '../../index';

export default {
  title: 'Components/Spinner',
} as Meta;

const Template: Story<IReqoreSpinnerProps> = (args) => {
  return (
    <ReqoreControlGroup vertical gapSize='huge'>
      <ReqoreSpinner {...args}>{args.children}</ReqoreSpinner>
      <ReqoreSpinner type={2} {...args}>
        {args.children}
      </ReqoreSpinner>
      <ReqoreSpinner type={3} {...args}>
        {args.children}
      </ReqoreSpinner>
      <ReqoreSpinner type={4} {...args}>
        {args.children}
      </ReqoreSpinner>
      <ReqoreSpinner type={5} {...args}>
        {args.children}
      </ReqoreSpinner>
      <ReqoreSpinner intent='info' {...args}>
        {args.children}
      </ReqoreSpinner>
      <ReqoreSpinner type={2} size='small' {...args}>
        {args.children}
      </ReqoreSpinner>
      <ReqoreSpinner {...args} type={3} iconColor='success:lighten:2' size='50px'>
        {args.children}
      </ReqoreSpinner>
      <ReqoreSpinner
        {...args}
        type={4}
        iconColor='#f21616'
        labelEffect={{
          gradient: { colors: 'warning' },
          uppercase: true,
          spaced: 2,
          textSize: 'small',
        }}
        size='huge'
      >
        {args.children}
      </ReqoreSpinner>
      <ReqoreSpinner {...args} type={5} iconColor='#987df4'>
        {args.children}
      </ReqoreSpinner>
      <ReqoreSpinner {...args} type={5} effect={{ blur: 2 }} iconColor='pending'>
        {args.children}
      </ReqoreSpinner>
    </ReqoreControlGroup>
  );
};

export const Basic = Template.bind({});
export const WithLabel = Template.bind({});
WithLabel.args = {
  children: 'Loading...',
};

export const Centered = Template.bind({});
Centered.args = {
  children: 'Loading...',
  centered: true,
};
