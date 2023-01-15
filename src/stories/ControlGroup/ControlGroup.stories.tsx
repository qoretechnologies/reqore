import { Meta, Story } from '@storybook/react/types-6-0';
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
import { argManager, GapSizeArg, MinimalArg, SizeArg } from '../utils/args';

const { createArg } = argManager<IReqoreControlGroupProps>();

export default {
  title: 'Components/Control Group',
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
} as Meta<IReqoreControlGroupProps>;

const Template: Story<IReqoreControlGroupProps> = (args: IReqoreControlGroupProps) => {
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
        >
          Non flat Button
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

export const Basic = Template.bind({});
export const Minimal = Template.bind({});
Minimal.args = {
  minimal: true,
};

export const Fluid = Template.bind({});
Fluid.args = {
  fluid: true,
};

export const NotFlat = Template.bind({});
NotFlat.args = {
  flat: false,
};

export const Vertical = Template.bind({});
Vertical.args = {
  vertical: true,
};

export const VerticalFluid = Template.bind({});
VerticalFluid.args = {
  vertical: true,
  fluid: true,
};

export const VerticalStackedFluid = Template.bind({});
VerticalStackedFluid.args = {
  vertical: true,
  stack: true,
  fluid: true,
};

export const Stacked = Template.bind({});
Stacked.args = {
  stack: true,
};

export const BigGapSize = Template.bind({});
BigGapSize.args = {
  gapSize: 'big',
};

export const NoWrap = Template.bind({});
NoWrap.args = {
  wrap: false,
};

export const HorizontalAlign = Template.bind({});
HorizontalAlign.args = {
  vertical: true,
  horizontalAlign: 'center',
};

export const VerticalAlign = Template.bind({});
VerticalAlign.args = {
  verticalAlign: 'flex-end',
};
