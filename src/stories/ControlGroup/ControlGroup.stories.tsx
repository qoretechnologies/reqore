import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreControlGroupProps } from '../../components/ControlGroup';
import ReqoreInput from '../../components/Input';
import {
  ReqoreButton,
  ReqoreCheckbox,
  ReqoreControlGroup,
  ReqoreTag,
  ReqoreVerticalSpacer,
} from '../../index';
import { GapSizeArg, MinimalArg, SizeArg, argManager } from '../utils/args';

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
  },
} as Meta<IReqoreControlGroupProps>;

const Template: Story<IReqoreControlGroupProps> = (args: IReqoreControlGroupProps) => {
  return (
    <>
      <ReqoreControlGroup {...args}>
        <ReqoreButton icon='PictureInPictureLine'>Button</ReqoreButton>
        <ReqoreButton
          icon='PictureInPictureLine'
          flat={false}
          effect={{ gradient: { colors: { 0: 'success', 100: 'info:darken:1' } } }}
        >
          Non flat Button
        </ReqoreButton>
        <ReqoreButton maxWidth='300px'>Button with max width</ReqoreButton>
        <ReqoreTag label='A wild tag appears!' color='main:lighten:2' />
        <ReqoreCheckbox
          asSwitch
          label='Switchy switch'
          margin='both'
          intent='warning'
          checkedIcon='CheckFill'
          checked
          uncheckedIcon='CheckboxBlankLine'
        />
        <ReqoreInput icon='4KFill' value='Hello' />
        <ReqoreButton disabled fixed>
          Disabled & Fixed
        </ReqoreButton>
        <ReqoreCheckbox checked margin='both'>
          Checkbox
        </ReqoreCheckbox>

        <ReqoreButton minimal>Minimal</ReqoreButton>
        <ReqoreTag label='smol tag' size='small' />
      </ReqoreControlGroup>
      <ReqoreVerticalSpacer height={15} />
      <ReqoreControlGroup {...args} className='root-group' id='root-group'>
        <ReqoreControlGroup intent='info' className='group-1' id='group-1-wrapper'>
          <ReqoreControlGroup intent='info' className='group-1' id='group-1'>
            <ReqoreButton icon='PictureInPictureLine' id='group-1-button'>
              Group 1
            </ReqoreButton>
            <ReqoreTag icon='PictureInPictureLine' label='Group 1' id='group-1-tag' />
          </ReqoreControlGroup>
          <ReqoreControlGroup intent='pending' className='group-1-1' id='group-1-1'>
            <ReqoreButton icon='PictureInPictureLine' id='group-1-1-button'>
              Group 1-1
            </ReqoreButton>
            <ReqoreTag icon='PictureInPictureLine' label='Group 1-1' id='group-1-1-tag' />
          </ReqoreControlGroup>
        </ReqoreControlGroup>
        <ReqoreButton icon='PictureInPictureLine' id='group-root-button'>
          Root group
        </ReqoreButton>
        <ReqoreControlGroup intent='success' className='group-2' id='group-2'>
          <ReqoreButton icon='PictureInPictureLine' id='group-2-button'>
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
            <ReqoreInput icon='PictureInPictureLine' value='Group 4' id='group-4-3-input' />
            <ReqoreControlGroup id='group-5' intent='muted' fluid={false}>
              <ReqoreTag icon='PictureInPictureLine' label='Group 5' id='group-4-3-1-tag' />
              <ReqoreTag icon='PictureInPictureLine' label='Group 5' id='group-4-3-2-tag' />
              <ReqoreTag icon='PictureInPictureLine' label='Group 5' id='group-4-3-3-tag' />
              <ReqoreControlGroup id='group 6' intent='success'>
                <ReqoreButton fixed>Group 6</ReqoreButton>
              </ReqoreControlGroup>
            </ReqoreControlGroup>
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

export const NotFlat = Template.bind({});
NotFlat.args = {
  flat: false,
};

export const Vertical = Template.bind({});
Vertical.args = {
  vertical: true,
};

export const VerticalStacked = Template.bind({});
VerticalStacked.args = {
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

export const Wrap = Template.bind({});
Wrap.args = {
  wrap: true,
};
