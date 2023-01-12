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
      <ReqoreControlGroup {...args} className='root-group'>
        <ReqoreControlGroup intent='info' className='group-1'>
          <ReqoreButton icon='PictureInPictureLine'>Group 1</ReqoreButton>
          <ReqoreTag icon='PictureInPictureLine' label='Group 1' />
        </ReqoreControlGroup>
        <ReqoreButton icon='PictureInPictureLine'>Root group</ReqoreButton>
        <ReqoreControlGroup intent='success' className='group-2'>
          <ReqoreButton icon='PictureInPictureLine'>Group 2</ReqoreButton>
          <ReqoreControlGroup intent='danger' className='group-3'>
            <ReqoreButton icon='PictureInPictureLine'>Group 3</ReqoreButton>
            <ReqoreButton icon='PictureInPictureLine'>Group 3</ReqoreButton>
          </ReqoreControlGroup>
          <ReqoreCheckbox label='Group 2' margin='both' />
        </ReqoreControlGroup>
        <ReqoreButton icon='PictureInPictureLine'>Root group</ReqoreButton>
        <ReqoreControlGroup intent='warning' className='group-4'>
          <ReqoreButton icon='PictureInPictureLine'>Group 4</ReqoreButton>
          <ReqoreInput icon='PictureInPictureLine' value='Group 4' />
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
