import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreControlGroupProps } from '../../components/ControlGroup';
import ReqoreInput from '../../components/Input';
import { ReqoreButton, ReqoreControlGroup } from '../../index';
import { MinimalArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreControlGroupProps>();

export default {
  title: 'Components/Control Group',
  argTypes: {
    ...SizeArg,
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
    <ReqoreControlGroup {...args}>
      <ReqoreButton>Button</ReqoreButton>
      <ReqoreInput icon='4KFill' value='Hello' />
      <ReqoreButton disabled fixed>
        Disabled & Fixed
      </ReqoreButton>
      <ReqoreButton minimal>Minimal</ReqoreButton>
    </ReqoreControlGroup>
  );
};

export const Basic = Template.bind({});
export const Minimal = Template.bind({});
Minimal.args = {
  minimal: true,
};

export const Vertical = Template.bind({});
Vertical.args = {
  vertical: true,
};

export const Stacked = Template.bind({});
Stacked.args = {
  stack: true,
};
