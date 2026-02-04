import { StoryFn, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import ReqoreProgress, { IReqoreProgressProps } from '../../components/Progress';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Utilities/Progress/Stories',
  component: ReqoreProgress,
} as StoryMeta<typeof ReqoreProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreProgressProps> = (args) => {
  return (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} />
      <ReqoreProgress {...args} value={25} />
      <ReqoreProgress {...args} value={50} />
      <ReqoreProgress {...args} value={75} />
      <ReqoreProgress {...args} value={100} />
    </ReqoreControlGroup>
  );
};

const SizesTemplate: StoryFn<IReqoreProgressProps> = (args) => {
  return (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} size='micro' />
      <ReqoreProgress {...args} size='tiny' />
      <ReqoreProgress {...args} size='small' />
      <ReqoreProgress {...args} size='normal' />
      <ReqoreProgress {...args} size='big' />
      <ReqoreProgress {...args} size='huge' />
      <ReqoreProgress {...args} size='massive' />
    </ReqoreControlGroup>
  );
};

const IntentsTemplate: StoryFn<IReqoreProgressProps> = (args) => {
  return (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} />
      <ReqoreProgress {...args} intent='info' />
      <ReqoreProgress {...args} intent='success' />
      <ReqoreProgress {...args} intent='warning' />
      <ReqoreProgress {...args} intent='danger' />
      <ReqoreProgress {...args} intent='pending' />
      <ReqoreProgress {...args} intent='muted' />
    </ReqoreControlGroup>
  );
};

const AnimatedTemplate: StoryFn<IReqoreProgressProps> = (args) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => (prev >= 100 ? 0 : prev + 10));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} value={value} />
      <ReqoreProgress {...args} value={value} intent='success' showValue />
      <ReqoreProgress {...args} value={value} intent='info' size='big' showValue />
    </ReqoreControlGroup>
  );
};

export const Basic: Story = {
  render: Template,
  args: {
    value: 0,
  },
};

export const WithValue: Story = {
  render: Template,
  args: {
    value: 60,
    showValue: true,
  },
};

export const Sizes: Story = {
  render: SizesTemplate,
  args: {
    value: 65,
  },
};

export const Intents: Story = {
  render: IntentsTemplate,
  args: {
    value: 70,
  },
};

export const Indeterminate: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} indeterminate />
      <ReqoreProgress {...args} indeterminate intent='info' />
      <ReqoreProgress {...args} indeterminate intent='success' />
      <ReqoreProgress {...args} indeterminate intent='warning' size='big' />
      <ReqoreProgress {...args} indeterminate intent='danger' size='huge' />
    </ReqoreControlGroup>
  ),
};

export const Animated: Story = {
  render: AnimatedTemplate,
};

export const CustomLabel: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} value={45} label='45/100 items' size='big' />
      <ReqoreProgress {...args} value={80} label='Uploading...' size='big' intent='info' />
      <ReqoreProgress {...args} value={100} label='Complete!' size='big' intent='success' />
    </ReqoreControlGroup>
  ),
};

export const Fluid: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big'>
      <ReqoreProgress {...args} value={50} fluid />
      <ReqoreProgress {...args} value={75} fluid intent='success' showValue size='big' />
    </ReqoreControlGroup>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} value={50} disabled />
      <ReqoreProgress {...args} value={75} disabled intent='info' />
    </ReqoreControlGroup>
  ),
};

export const NotRounded: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} value={50} rounded={false} />
      <ReqoreProgress {...args} value={75} rounded={false} intent='success' size='big' />
    </ReqoreControlGroup>
  ),
};
