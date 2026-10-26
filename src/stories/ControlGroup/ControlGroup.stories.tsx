import { StoryFn, StoryObj } from '@storybook/react';
import { ChangeEvent, useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { IReqoreControlGroupProps } from '../../components/ControlGroup';
import { IReqoreInputProps } from '../../components/Input';
import { sleep } from '../../helpers/utils';
import {
  ReqoreButton,
  ReqoreCheckbox,
  ReqoreControlGroup,
  ReqoreControlGroupItem,
  ReqoreDropdown,
  ReqoreInput,
  ReqorePanel,
  ReqoreTag,
  ReqoreVerticalSpacer,
} from '../../index';
import { StoryMeta } from '../utils';
import { GapSizeArg, MinimalArg, SizeArg, argManager } from '../utils/args';
import { expectControlsInside, expectWordsWhole } from '../utils/controlsInside';
import { StoryRowBox } from '../utils/rowBoxes';
import { PHONE_STORY } from '../utils/touchScreen';

/**
 * An input in a group that can be typed into, as a page's would be: it holds its own text. Given a `value` and no
 * `onChange`, an input is read-only and React warns of it (qorus#646: the story run's warning gate).
 */
const StoryInput = ({ value: initial, ...rest }: IReqoreInputProps) => {
  const [value, setValue] = useState(initial);
  return (
    <ReqoreInput
      {...rest}
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
    />
  );
};

const { createArg } = argManager<IReqoreControlGroupProps>();

const meta = {
  title: 'Form/Control Group',
  component: ReqoreControlGroup,
  argTypes: {
    ...SizeArg,
    ...GapSizeArg,
    ...MinimalArg(),
    ...createArg('stack', {
      name: 'Stack',
      defaultValue: false,
      description: 'Whether the control group should stack',
      control: 'boolean',
    }),
    ...createArg('vertical', {
      name: 'Vertical',
      defaultValue: false,
      description: 'Whether the control group should be vertical',
      control: 'boolean',
    }),
    ...createArg('fluid', {
      name: 'Fluid',
      defaultValue: false,
      description: 'Whether the control group should be fluid',
      control: 'boolean',
    }),
    ...createArg('wrap', {
      name: 'wrap',
      defaultValue: true,
      description: 'Whether the control group should wrap',
      control: 'boolean',
    }),
  },
  args: {
    wrap: true,
    vertical: false,
    stack: false,
    fluid: false,
    minimal: false,
  },
} as StoryMeta<typeof ReqoreControlGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<typeof ReqoreControlGroup> = (args) => {
  if (args.fill) {
    return (
      <>
        <ReqoreControlGroup {...args} stack>
          <ReqoreButton icon='PictureInPictureLine' description='I will be a bit larger'>
            Button
          </ReqoreButton>
          <ReqoreControlGroup stack>
            <ReqoreButton maxWidth='300px'>Button with max width</ReqoreButton>
            <ReqoreTag label='A wild tag appears!' color='main:lighten:2' />
          </ReqoreControlGroup>
          <ReqoreControlGroup stack>
            <ReqoreControlGroup>
              <ReqoreInput customTheme={{ main: '#00e3e8' }} placeholder='Level 2 deep' />
              <ReqoreControlGroup fixed>
                <ReqoreButton disabled fixed id='test'>
                  Level 3 deep and fixed
                </ReqoreButton>
              </ReqoreControlGroup>
            </ReqoreControlGroup>
            <ReqoreCheckbox checked margin='both' label='Level 1 deep' />
            <ReqoreButton intent='danger'>Level 1 deep</ReqoreButton>
          </ReqoreControlGroup>
        </ReqoreControlGroup>
        <ReqoreVerticalSpacer height={10} />
        <ReqoreControlGroup {...args} stack>
          <ReqoreButton
            icon='PictureInPictureLine'
            description='Here is a really weird and long description that needs to stretch the button a little bit so we can get some idea on how the other buttons are going to react.'
            maxWidth='400px'
          >
            Please select
          </ReqoreButton>
          <ReqoreButton icon='AddLine' intent='info' />
          <ReqoreButton>Edit</ReqoreButton>
          <ReqoreButton icon='DeleteBinLine' intent='danger'>
            Remove
          </ReqoreButton>
        </ReqoreControlGroup>
        <ReqoreVerticalSpacer height={10} />
        <ReqoreControlGroup {...args} stack fluid>
          <ReqoreButton
            icon='PictureInPictureLine'
            description='Here is a really weird and long description that needs to stretch the button a little bit so we can get some idea on how the other buttons are going to react.'
          >
            Please select
          </ReqoreButton>
          <ReqoreButton icon='AddLine' intent='info' fixed />
          <ReqoreButton fixed>Edit</ReqoreButton>
          <ReqoreButton icon='DeleteBinLine' intent='danger' fixed>
            Remove
          </ReqoreButton>
        </ReqoreControlGroup>
      </>
    );
  }

  if (args.responsive) {
    return (
      <div style={{ width: 600 }}>
        <ReqoreControlGroup {...args} wrap={false}>
          <ReqoreButton icon='PictureInPictureLine'>Button</ReqoreButton>
          <ReqoreControlGroup stack>
            <ReqoreTag label='A wild tag appears!' color='main:lighten:2' />
          </ReqoreControlGroup>
          <ReqoreControlGroup stack>
            <ReqoreButton maxWidth='300px'>Button with max width</ReqoreButton>
            <ReqoreTag label='A wild tag appears!' color='main:lighten:2' />
          </ReqoreControlGroup>
          <ReqoreControlGroup stack>
            <ReqoreControlGroup>
              <ReqoreButton customTheme={{ main: '#00e3e8' }}>Level 2 deep</ReqoreButton>
              <ReqoreControlGroup fixed>
                <ReqoreButton disabled fixed id='test'>
                  Level 3 deep and fixed
                </ReqoreButton>
              </ReqoreControlGroup>
            </ReqoreControlGroup>
            <ReqoreButton intent='danger'>Level 1 deep</ReqoreButton>
            <ReqoreCheckbox checked margin='both' label='Level 1 deep' />
          </ReqoreControlGroup>
          <ReqoreButton icon='PictureInPictureLine'>Button</ReqoreButton>
          <ReqoreButton maxWidth='300px'>Button with max width</ReqoreButton>
        </ReqoreControlGroup>
      </div>
    );
  }

  return (
    <>
      <ReqoreControlGroup {...args}>
        <ReqoreButton icon='PictureInPictureLine'>Button</ReqoreButton>
        <ReqoreButton icon='PictureInPictureLine' fluid shrink={0}>
          Fluid Button
        </ReqoreButton>
        <ReqoreButton
          icon='PictureInPictureLine'
          flat={false}
          effect={{ gradient: { colors: { 0: 'success', 100: 'info:darken:1' } } }}
          description="With a description, it's a bit longer than the button itself"
          fixed
        >
          Non flat fixed Button
        </ReqoreButton>
        <ReqoreControlGroup stack>
          <ReqoreButton maxWidth='300px'>Button with max width</ReqoreButton>
          <ReqoreTag label='A wild tag appears!' color='main:lighten:2' />
        </ReqoreControlGroup>
        <ReqoreCheckbox
          asSwitch
          label='Switchy switch'
          margin='both'
          intent='warning'
          checkedIcon='CheckFill'
          checked
          uncheckedIcon='CheckboxBlankLine'
        />
        <StoryInput icon='4kFill' value='Hello I am fluid' fluid />
        <ReqoreControlGroup stack>
          <ReqoreControlGroup>
            <ReqoreButton customTheme={{ main: '#00e3e8' }}>Level 2 deep</ReqoreButton>
            <ReqoreControlGroup fixed>
              <ReqoreButton disabled fixed id='test'>
                Level 3 deep and fixed
              </ReqoreButton>
            </ReqoreControlGroup>
          </ReqoreControlGroup>
          <ReqoreButton intent='danger'>Level 1 deep</ReqoreButton>
          <ReqoreCheckbox checked margin='both' label='Level 1 deep' />
        </ReqoreControlGroup>

        <ReqoreButton minimal>Minimal</ReqoreButton>
        <ReqoreTag label='smol tag' size='small' />
      </ReqoreControlGroup>
      <ReqoreVerticalSpacer height={15} />
      <ReqoreControlGroup {...args} className='root-group' id='root-group'>
        <ReqoreControlGroup intent='info' className='group-1' id='group-1-wrapper'>
          <ReqoreControlGroup intent='info' className='group-1' id='group-1'>
            <>
              <ReqoreButton icon='PictureInPictureLine' id='group-1-button'>
                Group 1
              </ReqoreButton>
              <ReqoreTag icon='PictureInPictureLine' label='Group 1' id='group-1-tag' />
            </>
          </ReqoreControlGroup>
          <ReqoreControlGroup intent='pending' className='group-1-1' id='group-1-1'>
            <ReqoreButton icon='PictureInPictureLine' id='group-1-1-button'>
              Group 1-1
            </ReqoreButton>
            <ReqoreTag icon='PictureInPictureLine' label='Group 1-1' id='group-1-1-tag' />
            <ReqoreDropdown
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  value: 'howareya',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
                  value: 'disabled',
                  icon: 'StopCircleLine',
                },
                {
                  label: 'With right button',
                  value: 'kek',
                  icon: 'CheckDoubleLine',
                },
              ]}
            >
              Dropdown
            </ReqoreDropdown>
          </ReqoreControlGroup>
        </ReqoreControlGroup>
        <ReqoreButton icon='PictureInPictureLine' id='group-root-button'>
          Root group
        </ReqoreButton>
        <ReqoreControlGroup intent='success' className='group-2' id='group-2'>
          <>
            <ReqoreButton icon='PictureInPictureLine' id='group-2-button' fixed>
              Group 2
            </ReqoreButton>
            <ReqoreControlGroup intent='danger' className='group-3' id='group-3'>
              <ReqoreButton icon='PictureInPictureLine' id='group-3-button-1'>
                Group 3
              </ReqoreButton>
              <ReqoreButton icon='PictureInPictureLine' id='group-3-button-2'>
                Group 3
              </ReqoreButton>
            </ReqoreControlGroup>
          </>
          <ReqoreCheckbox label='Group 2' margin='both' id='group-2-checkbox' />
        </ReqoreControlGroup>
        <ReqoreButton icon='PictureInPictureLine' id='group-root-button-2'>
          Root group
        </ReqoreButton>
        <ReqoreControlGroup intent='warning' className='group-4' id='group-4'>
          <ReqoreControlGroup id='group-4-1' fluid={false}>
            <ReqoreTag icon='PictureInPictureLine' label='Group 4' id='group-4-1-tag' />
            <StoryInput icon='PictureInPictureLine' value='Group 4' id='group-4-1-input' />
          </ReqoreControlGroup>
          <ReqoreControlGroup id='group-4-3'>
            <ReqoreTag icon='PictureInPictureLine' label='Group 4' id='group-4-3-tag' />
            <>
              <StoryInput icon='PictureInPictureLine' value='Group 4' id='group-4-3-input' />
              <ReqoreControlGroup id='group-5' intent='muted' fluid={false}>
                <ReqoreTag icon='PictureInPictureLine' label='Group 5' id='group-4-3-1-tag' />
                <ReqoreTag icon='PictureInPictureLine' label='Group 5' id='group-4-3-2-tag' />
                <ReqoreTag icon='PictureInPictureLine' label='Group 5' id='group-4-3-3-tag' />
                <ReqoreControlGroup id='group 6' intent='success'>
                  <ReqoreButton fixed>Group 6</ReqoreButton>
                </ReqoreControlGroup>
              </ReqoreControlGroup>
            </>
          </ReqoreControlGroup>
        </ReqoreControlGroup>
      </ReqoreControlGroup>
    </>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup in its default configuration.',
      },
    },
  },
  render: Template,
};

export const Minimal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup in its minimal variant.',
      },
    },
  },
  render: Template,

  args: {
    minimal: true,
  },
};

export const Fluid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup with fluid set so it fills the available horizontal space.',
      },
    },
  },
  render: Template,

  args: {
    fluid: true,
  },
};

export const Fill: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup filling the available space.',
      },
    },
  },
  render: Template,

  args: {
    fill: true,
  },
};

export const NotFlat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup with flat={false} so the elevated look is applied.',
      },
    },
  },
  render: Template,

  args: {
    flat: false,
  },
};

export const Vertical: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup laid out vertically.',
      },
    },
  },
  render: Template,

  args: {
    vertical: true,
  },
};

export const VerticalFluid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup in a vertical layout with fluid sizing.',
      },
    },
  },
  render: Template,

  args: {
    vertical: true,
    fluid: true,
  },
};

export const VerticalStackedFluid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup in a vertical stacked layout with fluid sizing.',
      },
    },
  },
  render: Template,

  args: {
    vertical: true,
    stack: true,
    fluid: true,
  },
};

export const Stacked: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup in a stacked layout.',
      },
    },
  },
  render: Template,

  args: {
    stack: true,
  },
};

export const StackedButtonsOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup in the stacked-buttons-only variant.',
      },
    },
  },
  render: () => {
    return (
      <ReqoreControlGroup stack wrap>
        <ReqoreButton flat={false}>First</ReqoreButton>
        <ReqoreButton flat={false}>Second</ReqoreButton>
        <ReqoreButton flat={false}>Third</ReqoreButton>
        <ReqoreButton flat={false}>Fourth</ReqoreButton>
        <ReqoreButton flat={false}>Fifth</ReqoreButton>
        <ReqoreButton flat>Sixth</ReqoreButton>
        <ReqoreButton flat={false}>Seventh</ReqoreButton>
        <ReqoreButton flat={false}>Eighth</ReqoreButton>
        <ReqoreButton flat={false}>Ninth</ReqoreButton>
        <ReqoreButton flat={false}>Tenth</ReqoreButton>
        <ReqoreButton flat={false}>Eleventh</ReqoreButton>
        <ReqoreButton flat>Twelfth</ReqoreButton>
        <ReqoreButton flat={false}>Thirteenth</ReqoreButton>
        <ReqoreButton flat>Fourteenth</ReqoreButton>
        <ReqoreButton flat={false}>Fifteenth</ReqoreButton>
        <ReqoreButton flat={false}>Sixteenth</ReqoreButton>
        <ReqoreButton flat={false}>Seventeenth</ReqoreButton>
        <ReqoreButton flat={false}>Eighteenth</ReqoreButton>
        <ReqoreButton flat={false}>Nineteenth</ReqoreButton>
        <ReqoreButton flat={false}>Twentieth</ReqoreButton>
      </ReqoreControlGroup>
    );
  },

  args: {
    stack: true,
  },
};

export const BigGapSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup with a big gap between items.',
      },
    },
  },
  render: Template,

  args: {
    gapSize: 'big',
  },
};

export const NoWrap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup with content forced onto a single line.',
      },
    },
  },
  render: Template,

  args: {
    wrap: false,
  },
};

export const HorizontalAlign: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup with horizontal alignment applied.',
      },
    },
  },
  render: Template,

  args: {
    vertical: true,
    horizontalAlign: 'center',
  },
};

export const VerticalAlign: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup with vertical alignment applied.',
      },
    },
  },
  render: Template,

  args: {
    verticalAlign: 'flex-end',
  },
};

export const Responsive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup in a responsive layout.',
      },
    },
  },
  render: Template,

  args: {
    responsive: true,
  },
};

export const StackedBorders: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup with stacked borders.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup {...args} stack>
      <ReqoreButton flat={false}>First</ReqoreButton>
      <ReqoreButton flat={false}>Second</ReqoreButton>
      <ReqoreButton flat={false}>Third</ReqoreButton>
      <ReqoreButton flat={false}>Fourth</ReqoreButton>
    </ReqoreControlGroup>
  ),
};

export const StackedBordersVertical: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup with stacked borders in a vertical layout.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup {...args} stack vertical>
      <ReqoreButton flat={false}>First</ReqoreButton>
      <ReqoreButton flat={false}>Second</ReqoreButton>
      <ReqoreButton flat={false}>Third</ReqoreButton>
    </ReqoreControlGroup>
  ),
};

export const StackedBordersWithIntents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup with stacked borders and intents on the segments.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup {...args} stack>
      <ReqoreButton flat={false}>Default</ReqoreButton>
      <ReqoreButton flat={false} intent='info'>
        Info
      </ReqoreButton>
      <ReqoreButton flat={false} intent='success'>
        Success
      </ReqoreButton>
      <ReqoreButton flat={false} intent='warning'>
        Warning
      </ReqoreButton>
      <ReqoreButton flat={false} intent='danger'>
        Danger
      </ReqoreButton>
    </ReqoreControlGroup>
  ),
};

export const StackedBordersWrapping: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup with stacked borders that wrap onto multiple lines.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '400px', border: '1px dashed gray', padding: '8px' }}>
      <ReqoreControlGroup {...args} stack wrap>
        <ReqoreButton flat={false}>One</ReqoreButton>
        <ReqoreButton flat={false}>Two</ReqoreButton>
        <ReqoreButton flat={false}>Three</ReqoreButton>
        <ReqoreButton flat={false}>Four</ReqoreButton>
        <ReqoreButton flat={false}>Five</ReqoreButton>
        <ReqoreButton flat={false}>Six</ReqoreButton>
        <ReqoreButton flat={false}>Seven</ReqoreButton>
        <ReqoreButton flat={false}>Eight</ReqoreButton>
      </ReqoreControlGroup>
    </div>
  ),
};

export const WithEffect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ControlGroup with a visual effect applied.',
      },
    },
  },
  render: Template,

  args: {
    effect: {
      gradient: {
        colors: {
          0: '#5e00ff',
          100: '#ff0073',
        },
      },
    },
  },
};

export const StackedPills: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A stacked group of `pill` buttons and dropdowns reads as one connected bar — rounded end caps, squared joined edges — not a scalloped row of pills. The squared corners are injected as an explicit `0`, so `pill`'s own radius no longer survives the stack.",
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup {...args} stack>
      <ReqoreDropdown
        label='Overview'
        icon='DashboardLine'
        items={[{ label: 'Overview' }, { label: 'Improvements' }]}
      />
      <ReqoreButton pill icon='Filter3Line' rightIcon='ArrowDownSLine'>
        Filters
      </ReqoreButton>
      <ReqoreButton pill icon='Robot2Line'>
        Remediation
      </ReqoreButton>
      <ReqoreDropdown
        label='Today'
        icon='TimeLine'
        items={[{ label: 'Hour' }, { label: 'Today' }, { label: '7d' }, { label: '30d' }]}
      />
    </ReqoreControlGroup>
  ),
};

export const MultiElementItem: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A control group sizes each child individually, so a consumer that renders several elements into it — a React fragment is transparent in the DOM — gets them laid out side by side, and a full-width leading element that cannot shrink pushes the rest outside the group. `ReqoreControlGroupItem` makes them count as ONE child: the top row shows the parts competing for width, the bottom row the same parts grouped into a single slot beside the trailing button. See reqore#632.',
      },
    },
  },
  render: () => (
    <div style={{ width: 640 }}>
      <ReqoreControlGroup fluid>
        <ReqorePanel label='Schema type' flat minimal style={{ width: '100%' }}>
          Loose parts — pushed out of the group
        </ReqorePanel>
        <ReqorePanel label='Provider options' flat minimal>
          400px minimum
        </ReqorePanel>
        <ReqoreButton icon='More2Line' fixed />
      </ReqoreControlGroup>

      <ReqoreVerticalSpacer height={20} />

      <ReqoreControlGroup fluid>
        <ReqoreControlGroupItem fluid>
          <ReqorePanel label='Schema type' flat minimal style={{ width: '100%' }}>
            Grouped into one slot — stacked, nothing clipped
          </ReqorePanel>
          <ReqorePanel label='Provider options' flat minimal>
            400px minimum
          </ReqorePanel>
        </ReqoreControlGroupItem>
        <ReqoreButton icon='More2Line' fixed />
      </ReqoreControlGroup>
    </div>
  ),
};

/**
 * The header group in a narrow panel: the layout where a fold used to undo
 * itself. `ReqorePanel` gives its responsive action group `flex: 0 1 auto` with
 * a 40px floor and a 50% cap, so the group is only as wide as what it is
 * showing — which means folding an action away makes the group itself narrower.
 */
const NARROW_PANEL_GROUP = '.reqore-control-group[style*="flex: 0 1 auto"]';

export const ResponsiveFoldSettles: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A responsive action group in a 380px panel, narrow enough that its actions cannot all fit and some of them have to fold into the `…` menu. Folding makes the group narrower, and the group watches its own size — so this is the layout where the fold used to undo itself: put the folded actions back, measure, fold them again, about five times a second for as long as the panel was on screen. The group now ignores the size change its own fold caused and takes its cue from its container instead, so it folds once and stops. The play function measures exactly that: once the fold has settled it watches the row for a second and a half and asserts that nothing is added to it or removed from it.',
      },
    },
  },
  render: () => (
    <div style={{ width: 380 }}>
      <ReqorePanel
        label='Improvement'
        collapsible
        onClose={() => {}}
        actions={[
          { label: 'Run', icon: 'PlayLine' },
          { label: 'Duplicate', icon: 'FileCopyLine' },
          { label: 'Archive', icon: 'ArchiveLine' },
          { label: 'Export', icon: 'DownloadLine' },
          { label: 'Share', icon: 'ShareLine' },
        ]}
      >
        A panel narrow enough that its actions have to fold.
      </ReqorePanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = await waitFor(() => {
      const element = canvasElement.querySelector(NARROW_PANEL_GROUP) as HTMLElement;

      expect(element).toBeTruthy();

      return element;
    });

    // Let the first measurement and the 200ms observer debounce drain.
    await sleep(600);

    const foldedTo = group.children.length;
    let churn = 0;
    const observer = new MutationObserver((records) => {
      churn += records.length;
    });

    observer.observe(group, { childList: true });

    // Several debounce periods: a group feeding its own observer empties and
    // refills the row about five times a second.
    await sleep(1500);
    observer.disconnect();

    await expect(churn).toBe(0);
    // ...and it is still showing what it settled on, so a group that folded
    // nothing could not pass this by standing still.
    await expect(group.children.length).toBe(foldedTo);
    await expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);
  },
};

/** The steps of a picked path, each with what it is: a datasource, a schema and a table. */
const PATH_STEPS = [
  {
    label: 'omquser',
    description:
      'The Qorus system datasource: workflow, service and job state, and every order with its data',
  },
  { label: 'public', description: 'The default schema' },
  {
    label: 'bb_local',
    description: 'A table of the business data the examples write to and read from',
  },
];

/**
 * A path picked a step at a time, as a data provider picker draws it (the Qorus IDE's, qorus#646): what it picks
 * from, then each step in a group of its own (`fluid={false}`) saying the step and what it is, then a button that
 * applies the path.
 */
const WrappedPath = () => (
  <ReqoreControlGroup fluid wrap fill className='wrapped-path'>
    <ReqoreButton fixed icon='DatabaseLine' label='Datasource' />
    {PATH_STEPS.map(({ label, description }) => (
      <ReqoreControlGroup fluid={false} key={label} className='wrapped-path-step'>
        <ReqoreDropdown fluid label={label} description={description} items={[{ label }]} />
      </ReqoreControlGroup>
    ))}
    <ReqoreButton
      fluid={false}
      icon='CheckLine'
      label='Apply this path'
      description='Picks the datasource, the schema and the table, and closes the favorites'
      className='wrapped-path-apply'
    />
  </ReqoreControlGroup>
);

/**
 * Every control of the wrapped path is inside it, side to side; every word it says is whole; and what says too
 * much for a row is capped at the row, while what fits keeps its own width.
 */
const expectPathInside = async (path: HTMLElement) => {
  await expectControlsInside(path);
  await expectWordsWhole(path);

  const width = path.getBoundingClientRect().width;
  const steps = Array.from(path.querySelectorAll<HTMLElement>('.wrapped-path-step'));
  expect(steps).toHaveLength(PATH_STEPS.length);
  // the long steps and Apply are capped at the row; the short ones keep their own width
  const [omquser, schema, table] = steps.map((step) => step.getBoundingClientRect().width);
  const apply = path.querySelector('.wrapped-path-apply')!.getBoundingClientRect().width;
  const datasource = (path.firstElementChild as HTMLElement).getBoundingClientRect().width;
  expect(Math.abs(omquser - width)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(apply - width)).toBeLessThanOrEqual(0.5);
  expect(schema).toBeLessThan(width / 2);
  expect(datasource).toBeLessThan(width / 2);
  expect(table).toBeLessThanOrEqual(width + 0.5);

  // each description is said whole, on as many lines as it takes, inside its button
  for (const description of Array.from(
    path.querySelectorAll<HTMLElement>('.reqore-button-description')
  )) {
    expect(description.scrollWidth).toBeLessThanOrEqual(description.clientWidth);
    const button = description.closest('.reqore-button')!.getBoundingClientRect();
    expect(description.getBoundingClientRect().right).toBeLessThanOrEqual(button.right + 0.5);
  }
};

export const WrappedGroupKeepsALongButtonInside: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a picked path in a 346px card, as a data provider picker draws it: Datasource, then the steps omquser, public and bb_local, each in a group of its own with what it is, then Apply this path. The group wraps, and none of its children is wider than it: a step or a button whose description is longer than the card is as wide as the card, its description on as many lines as it takes, and a step that fits keeps its own width.',
      },
    },
  },
  render: () => (
    <StoryRowBox className='wrapped-path-box' width={346} caption='A 346px card'>
      <WrappedPath />
    </StoryRowBox>
  ),
  play: async ({ canvasElement }) => {
    await expectPathInside(canvasElement.querySelector<HTMLElement>('.wrapped-path')!);
  },
};

export const WrappedGroupKeepsALongButtonInsideOnAPhone: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          "The same picked path in a card on a phone (390px), with the card's own Apply in its header: every step and button of the path is inside the card, a long description on as many lines as it takes, and the card's Apply stays on screen.",
      },
    },
  },
  render: () => (
    <ReqorePanel
      label='Orders table'
      className='wrapped-path-card'
      actions={[{ label: 'Apply', icon: 'CheckLine', className: 'wrapped-path-card-apply' }]}
    >
      <WrappedPath />
    </ReqorePanel>
  ),
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>('.wrapped-path-card')!;
    await expectPathInside(card.querySelector<HTMLElement>('.wrapped-path')!);
    await expectControlsInside(card);
    const apply = card.querySelector('.wrapped-path-card-apply')!.getBoundingClientRect();
    expect(apply.right).toBeLessThanOrEqual(window.innerWidth);
  },
};
