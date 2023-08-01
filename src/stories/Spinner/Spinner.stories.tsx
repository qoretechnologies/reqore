import { StoryFn, StoryObj } from '@storybook/react';
import { IReqoreSpinnerProps, ReqoreSpinner } from '../../components/Spinner';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Utilities/Spinner/Stories',
  component: ReqoreSpinner,
} as StoryMeta<typeof ReqoreSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreSpinnerProps> = (args) => {
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

export const Basic: Story = {
  render: Template,
};

export const WithLabel: Story = {
  render: Template,

  args: {
    children: 'Loading...',
  },
};

export const Centered: Story = {
  render: Template,

  args: {
    children: 'Loading...',
    centered: true,
  },
};
