import { StoryFn, StoryObj } from '@storybook/react';
import { IReqoreControlGroupProps } from '../../components/ControlGroup';
import {
  ReqoreButton,
  ReqoreCheckbox,
  ReqoreControlGroup,
  ReqoreDropdown,
  ReqoreInput,
  ReqoreTag,
  ReqoreVerticalSpacer,
} from '../../index';
import { StoryMeta } from '../utils';
import { GapSizeArg, MinimalArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreControlGroupProps>();

const meta = {
  title: 'Form/Control Group/Stories',
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
        <ReqoreButton icon='PictureInPictureLine' fluid>
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
        <ReqoreInput icon='4KFill' value='Hello I am fluid' fluid />
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
            <ReqoreInput icon='PictureInPictureLine' value='Group 4' id='group-4-1-input' />
          </ReqoreControlGroup>
          <ReqoreControlGroup id='group-4-3'>
            <ReqoreTag icon='PictureInPictureLine' label='Group 4' id='group-4-3-tag' />
            <>
              <ReqoreInput icon='PictureInPictureLine' value='Group 4' id='group-4-3-input' />
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
  render: Template,
};

export const Minimal: Story = {
  render: Template,

  args: {
    minimal: true,
  },
};

export const Fluid: Story = {
  render: Template,

  args: {
    fluid: true,
  },
};

export const Fill: Story = {
  render: Template,

  args: {
    fill: true,
  },
};

export const NotFlat: Story = {
  render: Template,

  args: {
    flat: false,
  },
};

export const Vertical: Story = {
  render: Template,

  args: {
    vertical: true,
  },
};

export const VerticalFluid: Story = {
  render: Template,

  args: {
    vertical: true,
    fluid: true,
  },
};

export const VerticalStackedFluid: Story = {
  render: Template,

  args: {
    vertical: true,
    stack: true,
    fluid: true,
  },
};

export const Stacked: Story = {
  render: Template,

  args: {
    stack: true,
  },
};

export const BigGapSize: Story = {
  render: Template,

  args: {
    gapSize: 'big',
  },
};

export const NoWrap: Story = {
  render: Template,

  args: {
    wrap: false,
  },
};

export const HorizontalAlign: Story = {
  render: Template,

  args: {
    vertical: true,
    horizontalAlign: 'center',
  },
};

export const VerticalAlign: Story = {
  render: Template,

  args: {
    verticalAlign: 'flex-end',
  },
};

export const Responsive: Story = {
  render: Template,

  args: {
    responsive: true,
  },
};
