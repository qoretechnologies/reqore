import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import ReqoreStatistic from '../../components/Statistic';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Display/Statistic/Stories',
  component: ReqoreStatistic,
} as StoryMeta<typeof ReqoreStatistic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    value: 12345,
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='huge'>
      <ReqoreStatistic {...args} value='12,345' label='Total Users' />
      <ReqoreStatistic {...args} value='$48,200' label='Revenue' />
      <ReqoreStatistic {...args} value={342} label='Active Sessions' />
    </ReqoreControlGroup>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='huge'>
      <ReqoreStatistic {...args} value='12,345' label='Total Users' icon='UserLine' />
      <ReqoreStatistic
        {...args}
        value='$48,200'
        label='Revenue'
        icon='MoneyDollarCircleLine'
        intent='success'
      />
      <ReqoreStatistic
        {...args}
        value={342}
        label='Active Sessions'
        icon='FlashlightLine'
        intent='info'
      />
    </ReqoreControlGroup>
  ),
};

export const WithPrefixAndSuffix: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='huge'>
      <ReqoreStatistic {...args} value='1,200' label='Revenue' prefix='$' />
      <ReqoreStatistic {...args} value='99.9' label='Uptime' suffix='%' intent='success' />
      <ReqoreStatistic {...args} value='5,000' label='Balance' prefix='EUR ' />
      <ReqoreStatistic {...args} value={128} label='Storage' suffix=' GB' />
    </ReqoreControlGroup>
  ),
};

export const WithTrend: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='huge'>
      <ReqoreStatistic
        {...args}
        value='12,345'
        label='Total Users'
        icon='UserLine'
        trend={{ direction: 'up', value: '+12%' }}
      />
      <ReqoreStatistic
        {...args}
        value='$48,200'
        label='Revenue'
        icon='MoneyDollarCircleLine'
        trend={{ direction: 'down', value: '-5.3%' }}
      />
      <ReqoreStatistic
        {...args}
        value={342}
        label='Active Sessions'
        icon='FlashlightLine'
        trend={{ direction: 'neutral', value: '0%' }}
      />
    </ReqoreControlGroup>
  ),
};

export const Sizes: Story = {
  render: (args) => {
    const sizes = ['tiny', 'small', 'normal', 'big', 'huge'] as const;

    return (
      <ReqoreControlGroup gapSize='big'>
        {sizes.map((size) => (
          <ReqoreStatistic
            key={size}
            {...args}
            size={size}
            value='12,345'
            label={size}
            icon='BarChart2Line'
            trend={{ direction: 'up', value: '+8%' }}
          />
        ))}
      </ReqoreControlGroup>
    );
  },
};

export const Intents: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='big' wrap>
      <ReqoreStatistic {...args} value={100} label='Default' icon='InformationLine' />
      <ReqoreStatistic {...args} value={200} label='Info' icon='InformationLine' intent='info' />
      <ReqoreStatistic {...args} value={300} label='Success' icon='CheckLine' intent='success' />
      <ReqoreStatistic {...args} value={400} label='Warning' icon='AlertLine' intent='warning' />
      <ReqoreStatistic
        {...args}
        value={500}
        label='Danger'
        icon='ErrorWarningLine'
        intent='danger'
      />
      <ReqoreStatistic {...args} value={600} label='Pending' icon='TimeLine' intent='pending' />
      <ReqoreStatistic {...args} value={700} label='Muted' icon='SubtractLine' intent='muted' />
    </ReqoreControlGroup>
  ),
};

export const Alignment: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big'>
      <div style={{ width: '300px', border: '1px dashed gray', padding: '16px' }}>
        <ReqoreStatistic {...args} value='1,234' label='Left aligned' align='left' fluid />
      </div>
      <div style={{ width: '300px', border: '1px dashed gray', padding: '16px' }}>
        <ReqoreStatistic {...args} value='5,678' label='Center aligned' fluid />
      </div>
      <div style={{ width: '300px', border: '1px dashed gray', padding: '16px' }}>
        <ReqoreStatistic {...args} value='9,012' label='Right aligned' align='right' fluid />
      </div>
    </ReqoreControlGroup>
  ),
};

export const WithValueEffects: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='huge'>
      <ReqoreStatistic
        {...args}
        value='$99,999'
        label='Revenue'
        valueEffect={{
          gradient: {
            colors: { 0: 'info', 100: 'success' },
          },
        }}
      />
      <ReqoreStatistic
        {...args}
        value='42'
        label='The Answer'
        valueEffect={{ color: 'warning', weight: 'thick' }}
        labelEffect={{ uppercase: true, spaced: 3 }}
      />
    </ReqoreControlGroup>
  ),
};

export const WithBackground: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='big' wrap>
      <ReqoreStatistic
        {...args}
        value='12,345'
        label='Total Users'
        icon='UserLine'
        rounded
        trend={{ direction: 'up', value: '+12%' }}
      />
      <ReqoreStatistic
        {...args}
        value='$48,200'
        label='Revenue'
        icon='MoneyDollarCircleLine'
        intent='success'
        rounded
        trend={{ direction: 'up', value: '+23%' }}
      />
      <ReqoreStatistic
        {...args}
        value='99.9%'
        label='Uptime'
        icon='ServerLine'
        intent='info'
        rounded
      />
      <ReqoreStatistic
        {...args}
        value={7}
        label='Alerts'
        icon='AlertLine'
        intent='danger'
        rounded
      />
    </ReqoreControlGroup>
  ),
};

export const WithBackgroundFlat: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='big' wrap>
      <ReqoreStatistic {...args} value='12,345' label='Total Users' icon='UserLine' rounded flat />
      <ReqoreStatistic
        {...args}
        value='$48,200'
        label='Revenue'
        icon='MoneyDollarCircleLine'
        intent='success'
        rounded
        flat
      />
      <ReqoreStatistic
        {...args}
        value='99.9%'
        label='Uptime'
        icon='ServerLine'
        intent='info'
        rounded
        flat
      />
    </ReqoreControlGroup>
  ),
};

export const WithGradientBackground: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='big' wrap>
      <ReqoreStatistic
        {...args}
        value='$99,999'
        label='Revenue'
        icon='MoneyDollarCircleLine'
        rounded
        effect={{
          gradient: {
            colors: { 0: '#1a1a2e', 100: '#16213e' },
            direction: 'to right',
          },
        }}
      />
      <ReqoreStatistic
        {...args}
        value='12,345'
        label='Users'
        icon='UserLine'
        rounded
        effect={{
          gradient: {
            colors: { 0: 'info:darken:2', 100: 'success:darken:2' },
            direction: 'to bottom right',
          },
        }}
        valueEffect={{
          gradient: {
            colors: { 0: 'info', 100: 'success' },
          },
        }}
      />
      <ReqoreStatistic
        {...args}
        value='42'
        label='The Answer'
        icon='StarLine'
        rounded
        effect={{
          gradient: {
            colors: { 0: 'warning:darken:3', 100: 'danger:darken:3' },
            direction: 'to right',
            animate: 'always',
            animationSpeed: 3,
          },
        }}
        valueEffect={{ color: 'warning' }}
      />
    </ReqoreControlGroup>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='huge'>
      <ReqoreStatistic {...args} value='12,345' label='Users' icon='UserLine' disabled />
      <ReqoreStatistic
        {...args}
        value='$48,200'
        label='Revenue'
        icon='MoneyDollarCircleLine'
        intent='success'
        disabled
      />
    </ReqoreControlGroup>
  ),
};

export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<string | null>(null);

    return (
      <ReqoreControlGroup gapSize='big' wrap>
        <ReqoreStatistic
          {...args}
          value='12,345'
          label='Total Users'
          icon='UserLine'
          rounded
          intent={selected === 'users' ? 'info' : undefined}
          onClick={() => setSelected('users')}
        />
        <ReqoreStatistic
          {...args}
          value='$48,200'
          label='Revenue'
          icon='MoneyDollarCircleLine'
          rounded
          intent={selected === 'revenue' ? 'success' : undefined}
          onClick={() => setSelected('revenue')}
        />
        <ReqoreStatistic
          {...args}
          value={342}
          label='Active Sessions'
          icon='FlashlightLine'
          rounded
          intent={selected === 'sessions' ? 'warning' : undefined}
          onClick={() => setSelected('sessions')}
        />
        <ReqoreStatistic
          {...args}
          value='N/A'
          label='Disabled'
          icon='ForbidLine'
          rounded
          disabled
          onClick={() => setSelected('disabled')}
        />
      </ReqoreControlGroup>
    );
  },
};

export const DashboardExample: Story = {
  render: (args) => (
    <ReqoreControlGroup gapSize='big' wrap>
      <ReqoreStatistic
        {...args}
        value='12,345'
        label='Total Users'
        icon='UserLine'
        rounded
        trend={{ direction: 'up', value: '+12%' }}
      />
      <ReqoreStatistic
        {...args}
        value='48,200'
        label='Revenue'
        icon='MoneyDollarCircleLine'
        intent='success'
        prefix='$'
        rounded
        trend={{ direction: 'up', value: '+23.5%' }}
      />
      <ReqoreStatistic
        {...args}
        value='342'
        label='Active Sessions'
        icon='FlashlightLine'
        intent='info'
        rounded
        trend={{ direction: 'down', value: '-2.1%' }}
      />
      <ReqoreStatistic
        {...args}
        value='99.9'
        label='Uptime'
        icon='ServerLine'
        intent='warning'
        suffix='%'
        rounded
        trend={{ direction: 'neutral', value: '0%' }}
      />
    </ReqoreControlGroup>
  ),
};

export const StackedStatistics: Story = {
  render: (args) => (
    <ReqoreControlGroup {...args} stack fluid>
      <ReqoreStatistic
        value={0}
        label='Prod. executions'
        rounded
        fluid
        flat={false}
        align='center'
      />
      <ReqoreStatistic
        value={0}
        label='Failed prod. executions'
        rounded
        fluid
        flat={false}
        align='center'
      />
      <ReqoreStatistic value='0%' label='Failure rate' rounded fluid flat={false} align='center' />
      <ReqoreStatistic
        value='--'
        label='Time saved'
        rounded
        fluid
        icon='InformationLine'
        flat={false}
        align='center'
      />
      <ReqoreStatistic
        value='0s'
        label='Run time (avg.)'
        rounded
        fluid
        flat={false}
        align='center'
      />
    </ReqoreControlGroup>
  ),
};
