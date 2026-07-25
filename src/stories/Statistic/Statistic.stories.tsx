import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import ReqoreStatistic, { IReqoreStatisticProps } from '../../components/Statistic';
import { TSizes } from '../../constants/sizes';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';
import { ALL_SIZES } from '../utils/args';

const meta = {
  title: 'Display/Statistic',
  component: ReqoreStatistic,
} as StoryMeta<typeof ReqoreStatistic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic in its default configuration.',
      },
    },
  },
  args: {
    value: 12345,
  },
};

export const WithLabel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with a label.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup gapSize='huge'>
      <ReqoreStatistic {...args} value='12,345' label='Total Users' />
      <ReqoreStatistic {...args} value='$48,200' label='Revenue' />
      <ReqoreStatistic {...args} value={342} label='Active Sessions' />
    </ReqoreControlGroup>
  ),
};

export const WithIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with an icon.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with prefix and suffix content.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with a trend indicator.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic at every intent (info, success, warning, danger, pending, muted) so the intent palette is visible side by side.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with alignment options exercised.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with a visual effect applied to the values.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with a background image or color set.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with the flat background variant.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with a gradient applied to its background.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic in its disabled state.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic in its interactive configuration.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders a full dashboard-style composition using Statistic.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with stacked statistics.',
      },
    },
  },
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

export const Raised: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with the raised effect.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='huge'>
      <ReqoreStatistic value='12,345' label='Total Users' icon='UserLine' rounded raised />
      <ReqoreStatistic
        value='$48,200'
        label='Revenue'
        icon='MoneyDollarCircleLine'
        rounded
        raised
        intent='success'
      />
      <ReqoreStatistic
        value={342}
        label='Active Sessions'
        icon='FlashlightLine'
        rounded
        raised
        intent='info'
      />
    </ReqoreControlGroup>
  ),
};

const STATISTIC_SIZES: TSizes[] = ['tiny', 'small', 'normal', 'big', 'huge'];

const renderStatisticMatrix = (variantArgs: Partial<IReqoreStatisticProps>) =>
  STATISTIC_SIZES.map((size) => (
    <ReqoreStatistic
      key={size}
      value='12,345'
      label={`size=${size}`}
      icon='UserLine'
      rounded
      size={size}
      {...variantArgs}
    />
  ));

export const Unpadded: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with no padding.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small'>
      {renderStatisticMatrix({ padded: false })}
    </ReqoreControlGroup>
  ),
};

export const PaddedHorizontalOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with padding only on the horizontal axis.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small'>
      {renderStatisticMatrix({ padded: 'horizontal' })}
    </ReqoreControlGroup>
  ),
};

export const PaddedVerticalOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with padding only on the vertical axis.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small'>
      {renderStatisticMatrix({ padded: 'vertical' })}
    </ReqoreControlGroup>
  ),
};

export const CustomPaddingSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic with a custom padding size.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small'>
      {STATISTIC_SIZES.map((size) => (
        <ReqoreStatistic
          key={size}
          value='12,345'
          label={`size=${size}, paddingSize='small'`}
          icon='UserLine'
          rounded
          size={size}
          paddingSize='small'
        />
      ))}
    </ReqoreControlGroup>
  ),
};

export const RadiusSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Statistic at every radius size to show the border-radius scale.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small'>
      {ALL_SIZES.map((radiusSize) => (
        <ReqoreStatistic
          key={radiusSize}
          value='12,345'
          label={`radiusSize="${radiusSize}"`}
          icon='UserLine'
          rounded
          radiusSize={radiusSize}
          size='normal'
        />
      ))}
    </ReqoreControlGroup>
  ),
};
