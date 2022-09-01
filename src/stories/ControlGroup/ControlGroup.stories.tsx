import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreControlGroupProps } from '../../components/ControlGroup';
import ReqoreInput from '../../components/Input';
import { ReqoreButton, ReqoreControlGroup } from '../../index';
import { argManager, MinimalArg, SizeArg } from '../utils/args';

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
  },
} as Meta<IReqoreControlGroupProps>;

const Template: Story<IReqoreControlGroupProps> = (args: IReqoreControlGroupProps) => {
  return (
    <ReqoreControlGroup {...args}>
      <ReqoreButton>Button</ReqoreButton>
      <ReqoreInput icon='4KFill' value='Hello' />
      <ReqoreButton disabled>Disabled</ReqoreButton>
      <ReqoreButton minimal>Minimal</ReqoreButton>
    </ReqoreControlGroup>
  );
};

export const Basic = Template.bind({});
export const Minimal = Template.bind({});
Minimal.args = {
  minimal: true,
};

export const Stacked = Template.bind({});
Stacked.args = {
  stack: true,
};
