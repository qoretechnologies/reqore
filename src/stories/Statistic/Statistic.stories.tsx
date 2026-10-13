import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import ReqoreStatistic, { IReqoreStatisticProps } from '../../components/Statistic';
import { TSizes } from '../../constants/sizes';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';
import { ALL_SIZES } from '../utils/args';
import { expectControlsInside, wordsBrokenAcrossLines } from '../utils/controlsInside';
import { PHONE_STORY } from '../utils/touchScreen';

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

/* ------------------------------------------------------------------------------------------------
 * valueAs — the element the value is written in
 * ---------------------------------------------------------------------------------------------- */

const tiles = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll('.reqore-statistic')) as HTMLElement[];

const headingsIn = (element: HTMLElement) =>
  Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((heading) => heading.tagName);

const valueOf = (tile: HTMLElement) =>
  tile.querySelector('.reqore-statistic-value') as HTMLElement;

export const ValueAs: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders four revenue tiles that look the same: the default, whose prefix, value and suffix are three headings, and `valueAs` `"p"`, `"div"` and `"h3"`, which write the whole value as one paragraph, one div or one h3 heading.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='huge' wrap>
      {([undefined, 'p', 'div', 'h3'] as const).map((valueAs) => (
        <ReqoreStatistic
          key={valueAs ?? 'default'}
          value='48,200'
          prefix='$'
          suffix='/mo'
          label={valueAs ? `valueAs="${valueAs}"` : 'Default'}
          icon='MoneyDollarCircleLine'
          rounded
          valueAs={valueAs}
        />
      ))}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const [plain, paragraph, div, heading] = tiles(canvasElement);

    await expect(headingsIn(plain)).toEqual(['H2', 'H2', 'H2']);
    await expect(headingsIn(paragraph)).toEqual([]);
    await expect(paragraph.querySelector('p.reqore-statistic-value-row')?.textContent).toBe(
      '$48,200/mo'
    );
    await expect(headingsIn(div)).toEqual([]);
    await expect(headingsIn(heading)).toEqual(['H3']);

    // Same look whatever the element: the value's size and weight, and the tile's height.
    const look = (tile: HTMLElement) => {
      const style = getComputedStyle(valueOf(tile));
      return [style.fontSize, style.fontWeight, Math.round(tile.getBoundingClientRect().height)];
    };

    await expect(look(paragraph)).toEqual(look(plain));
    await expect(look(div)).toEqual(look(plain));
    await expect(look(heading)).toEqual(look(plain));
  },
};

/* ------------------------------------------------------------------------------------------------
 * countUp
 * ---------------------------------------------------------------------------------------------- */

const finishedCounting = async (canvasElement: HTMLElement, values: string[]) =>
  waitFor(
    () => {
      expect(tiles(canvasElement).map((tile) => valueOf(tile).textContent)).toEqual(values);
      expect(canvasElement.querySelector('.reqore-statistic-value-final')).toBeNull();
    },
    { timeout: 5000 }
  );

export const CountUp: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders four tiles with `countUp`: they count up from 0 once on screen, keeping the value\'s own format ($48,200, 99.9 with its % suffix, 1.2M), and rest on the values as given. The fourth, "2–4", is not one number and shows at once.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='huge' wrap>
      <ReqoreStatistic value='$48,200' label='Revenue' icon='MoneyDollarCircleLine' countUp />
      <ReqoreStatistic
        value={99.9}
        suffix='%'
        label='Uptime'
        intent='success'
        countUp={{ duration: 800 }}
      />
      <ReqoreStatistic value='1.2M' label='Events' countUp={{ duration: 1200 }} />
      <ReqoreStatistic value='2–4' label='Days to fix' countUp />
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    await finishedCounting(canvasElement, ['$48,200', '99.9', '1.2M', '2–4']);
  },
};

export const CountUpWhenInView: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a counting tile below the fold of a scroll box: it shows 0 while it is out of view and counts up to 12,345 when the box is scrolled to it.',
      },
    },
  },
  render: () => (
    <div
      className='story-scroll-box'
      style={{ height: 200, width: 360, overflow: 'auto', border: '1px dashed #666' }}
    >
      <div style={{ height: 400, padding: 20 }}>Scroll down to the statistic.</div>
      <ReqoreStatistic value='12,345' label='Orders recovered' rounded countUp />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.story-scroll-box') as HTMLElement;

    // Out of view: the tile waits on its starting value.
    await new Promise((resolve) => setTimeout(resolve, 300));
    const counting = valueOf(tiles(canvasElement)[0]).querySelector('[aria-hidden]');
    await expect(counting?.textContent).toBe('0');

    box.scrollTop = box.scrollHeight;

    await finishedCounting(canvasElement, ['12,345']);
  },
};

/* A label's words stay whole (qorus#646): "DEPENDENCIES" on a 120px KPI tile broke mid-word
   ("DEPEND / ENCI / ES"). A label wraps between its words, and a word breaks only when it alone is
   wider than its tile. A tile narrows to the share its row gives it (min-width 0), so a row that
   sizes its tiles by their content keeps every word whole where it has the room. */

const KPI_TILES = [
  { label: 'Runs', value: 128 },
  { label: 'Dependencies', value: 14 },
  { label: 'Open errors', value: 3 },
];

const tileLabels = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>('.reqore-statistic-label'));

export const LabelWordsStayWhole: Story = {
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'Renders a row of three KPI tiles on a phone (390 px) that share 316px by their content - Runs, Dependencies and Open errors. Each label keeps its words whole: the Dependencies tile is wider than "DEPENDENCIES", the others give it the room, and no tile reaches past the row.',
      },
    },
  },
  render: () => (
    <div className='kpi-row' style={{ display: 'flex', gap: 8, width: 316 }}>
      {/* the tiles are the row's flex items, each starting from its content's width */}
      {KPI_TILES.map((tile) => (
        <ReqoreStatistic
          key={tile.label}
          label={tile.label}
          value={tile.value}
          style={{ flex: '1 1 auto' }}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('.kpi-row') as HTMLElement;
    await waitFor(() => {
      expect(tileLabels(row)).toHaveLength(KPI_TILES.length);
      for (const label of tileLabels(row)) {
        expect(wordsBrokenAcrossLines(label)).toEqual([]);
      }
    });
    await expectControlsInside(row);
    const rowBox = row.getBoundingClientRect();
    for (const tile of Array.from(row.querySelectorAll<HTMLElement>('.reqore-statistic'))) {
      expect(tile.getBoundingClientRect().right).toBeLessThanOrEqual(rowBox.right + 0.5);
    }
  },
};

export const LabelWordWiderThanItsTile: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a KPI tile in a 100px box whose label is one word wider than any tile: only then is the word broken, and the label stays inside the tile, the tile inside the box.',
      },
    },
  },
  render: () => (
    <div className='narrow-tile-box' style={{ width: 100 }}>
      <ReqoreStatistic label='Supercalifragilisticexpialidocious' value={7} fluid />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.narrow-tile-box') as HTMLElement;
    const label = await waitFor(() => {
      const [found] = tileLabels(box);
      expect(found).toBeTruthy();
      return found;
    });
    await waitFor(() =>
      expect(wordsBrokenAcrossLines(label)).toEqual(['Supercalifragilisticexpialidocious'])
    );
    expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1);
    const tile = box.querySelector('.reqore-statistic') as HTMLElement;
    expect(tile.getBoundingClientRect().right).toBeLessThanOrEqual(box.getBoundingClientRect().right + 0.5);
  },
};

/* Four tiles in a 320px grid of four equal columns (qorus#646): a tile is as narrow as its column,
   not as wide as the longest word of its label. Kept at that word's width, "Dependencies" and
   "Connections" pushed the row past its box and the tiles over each other; a word now breaks only
   when it cannot fit its tile, which here is every long one. */

const GRID_TILES = ['Dependencies', 'Connections', 'Workflows', 'Services'];
const GRID_WIDTH = 320;
const GRID_GAP = 8;

export const NarrowGridTilesStayInTheirCells: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders four KPI tiles - Dependencies, Connections, Workflows and Services - in a 320px grid of four equal columns, about 74px each. Each tile is as wide as its column and no wider, the row does not overflow its box, and a label too long for its tile breaks inside its word rather than reaching into the next tile. A label that breaks is centred, line by line, as the ones that fit on one line are.',
      },
    },
  },
  render: () => (
    <div
      className='kpi-grid'
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: GRID_GAP,
        width: GRID_WIDTH,
      }}
    >
      {GRID_TILES.map((label, index) => (
        <ReqoreStatistic key={label} label={label} value={index * 7 + 3} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector('.kpi-grid') as HTMLElement;
    const tiles = await waitFor(() => {
      const found = Array.from(grid.querySelectorAll<HTMLElement>('.reqore-statistic'));
      expect(found).toHaveLength(GRID_TILES.length);
      return found;
    });
    const gridBox = grid.getBoundingClientRect();
    const column = (GRID_WIDTH - GRID_GAP * (GRID_TILES.length - 1)) / GRID_TILES.length;

    // the row stays in its box
    expect(grid.scrollWidth).toBeLessThanOrEqual(grid.clientWidth);
    tiles.forEach((tile, index) => {
      const box = tile.getBoundingClientRect();
      const cellLeft = gridBox.left + index * (column + GRID_GAP);
      // each tile in its own cell: no wider than its column, from the cell's left edge
      expect(box.width).toBeLessThanOrEqual(column + 0.5);
      expect(box.left).toBeGreaterThanOrEqual(cellLeft - 0.5);
      expect(box.right).toBeLessThanOrEqual(cellLeft + column + 0.5);
      // and its label inside it
      const label = tile.querySelector('.reqore-statistic-label') as HTMLElement;
      expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1);
      // centred line by line, a broken label as a whole one is (Foxhoundn's review of #708)
      expect(getComputedStyle(label).textAlign).toBe('center');
      const text = document.createRange();
      text.selectNodeContents(label);
      const middle = box.left + box.width / 2;
      Array.from(text.getClientRects()).forEach((line) => {
        expect(Math.abs(line.left + line.width / 2 - middle)).toBeLessThanOrEqual(2);
      });
    });
  },
};
