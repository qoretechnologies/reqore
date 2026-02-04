import { StoryFn, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
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
      <ReqoreProgress {...args} size='micro' label='Micro' showValue />
      <ReqoreProgress {...args} size='tiny' label='Tiny' showValue />
      <ReqoreProgress {...args} size='small' label='Small' showValue />
      <ReqoreProgress {...args} size='normal' label='Normal' showValue />
      <ReqoreProgress {...args} size='big' label='Big' showValue />
      <ReqoreProgress {...args} size='huge' label='Huge' showValue />
      <ReqoreProgress {...args} size='massive' label='Massive' showValue />
    </ReqoreControlGroup>
  );
};

const IntentsTemplate: StoryFn<IReqoreProgressProps> = (args) => {
  return (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} label='Default' showValue />
      <ReqoreProgress {...args} intent='info' label='Info' showValue />
      <ReqoreProgress {...args} intent='success' label='Success' showValue />
      <ReqoreProgress {...args} intent='warning' label='Warning' showValue />
      <ReqoreProgress {...args} intent='danger' label='Danger' showValue />
      <ReqoreProgress {...args} intent='pending' label='Pending' showValue />
      <ReqoreProgress {...args} intent='muted' label='Muted' showValue />
    </ReqoreControlGroup>
  );
};

const LiveUpdateTemplate: StoryFn<IReqoreProgressProps> = (args) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => (prev >= 100 ? 0 : prev + 5));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} value={value} label='Downloading...' showValue />
      <ReqoreProgress {...args} value={value} intent='success' label='Installing...' showValue />
      <ReqoreProgress
        {...args}
        value={value}
        intent='info'
        size='big'
        label='Processing...'
        showValue
        icon='DownloadLine'
      />
    </ReqoreControlGroup>
  );
};

export const Basic: Story = {
  render: Template,
  args: {
    value: 0,
  },
};

export const WithLabels: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} value={45} label='Uploading files...' showValue />
      <ReqoreProgress {...args} value={80} label='Processing data' showValue intent='info' />
      <ReqoreProgress {...args} value={100} label='Complete!' showValue intent='success' />
      <ReqoreProgress {...args} value={30} label='With custom value' showValue={false} />
    </ReqoreControlGroup>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} value={65} label='Downloading...' showValue icon='DownloadLine' />
      <ReqoreProgress
        {...args}
        value={45}
        label='Uploading...'
        showValue
        icon='UploadLine'
        intent='info'
      />
      <ReqoreProgress
        {...args}
        value={100}
        label='Completed'
        showValue
        icon='CheckLine'
        intent='success'
      />
      <ReqoreProgress
        {...args}
        value={20}
        label='Error occurred'
        showValue
        icon='ErrorWarningLine'
        rightIcon='CloseLine'
        intent='danger'
      />
    </ReqoreControlGroup>
  ),
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
      <ReqoreProgress {...args} indeterminate label='Loading...' />
      <ReqoreProgress
        {...args}
        indeterminate
        intent='info'
        label='Please wait...'
        icon='TimeLine'
      />
      <ReqoreProgress {...args} indeterminate intent='success' label='Almost there...' />
      <ReqoreProgress {...args} indeterminate intent='warning' size='big' label='Processing...' />
      <ReqoreProgress
        {...args}
        indeterminate
        intent='pending'
        size='huge'
        label='Working...'
        icon='Loader4Line'
      />
    </ReqoreControlGroup>
  ),
};

export const AnimatedStripes: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} value={50} animated label='Default animated' showValue />
      <ReqoreProgress {...args} value={65} animated intent='info' label='Info animated' showValue />
      <ReqoreProgress
        {...args}
        value={80}
        animated
        intent='success'
        label='Success animated'
        showValue
        size='big'
      />
      <ReqoreProgress
        {...args}
        value={45}
        animated
        intent='warning'
        label='Warning animated'
        showValue
      />
      <ReqoreProgress
        {...args}
        value={30}
        animated
        intent='danger'
        label='Danger animated'
        showValue
        size='huge'
      />
    </ReqoreControlGroup>
  ),
};

export const LiveUpdate: Story = {
  render: LiveUpdateTemplate,
};

export const WithTooltip: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress
        {...args}
        value={65}
        tooltip='This is a progress tooltip'
        label='Hover me'
        showValue
      />
      <ReqoreProgress
        {...args}
        value={80}
        tooltip={{ content: 'Rich tooltip content', intent: 'info' }}
        label='With rich tooltip'
        showValue
        intent='info'
      />
    </ReqoreControlGroup>
  ),
};

export const Fluid: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big'>
      <ReqoreProgress {...args} value={50} fluid label='Full width progress' showValue />
      <ReqoreProgress
        {...args}
        value={75}
        fluid
        intent='success'
        showValue
        size='big'
        label='Large fluid progress'
        icon='CheckLine'
      />
    </ReqoreControlGroup>
  ),
};

export const WithBorder: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} value={50} flat={false} label='With border' showValue />
      <ReqoreProgress
        {...args}
        value={75}
        flat={false}
        intent='info'
        label='Info with border'
        showValue
      />
      <ReqoreProgress
        {...args}
        value={90}
        flat={false}
        intent='success'
        label='Success with border'
        showValue
      />
    </ReqoreControlGroup>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} value={50} disabled label='Disabled progress' showValue />
      <ReqoreProgress {...args} value={75} disabled intent='info' label='Disabled info' showValue />
    </ReqoreControlGroup>
  ),
};

export const NotRounded: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '400px' }}>
      <ReqoreProgress {...args} value={50} rounded={false} label='Square corners' showValue />
      <ReqoreProgress
        {...args}
        value={75}
        rounded={false}
        intent='success'
        size='big'
        label='Large square'
        showValue
      />
    </ReqoreControlGroup>
  ),
};
