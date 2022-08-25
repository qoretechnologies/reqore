import { ComponentMeta, ComponentStory } from '@storybook/react';
import Checkbox from '../../components/Checkbox';
import { ReqoreCheckbox } from '../../index';

export default {
  title: 'Components/Checkbox',
  parameters: ['checkbox.test.tsx'],
} as ComponentMeta<typeof Checkbox>;

const Template: ComponentStory<typeof Checkbox> = (args) => {
  return (
    <>
      <ReqoreCheckbox {...args} />
      <ReqoreCheckbox {...args} label='Label' labelDetail='Detail' labelDetailPosition='left' />
      <ReqoreCheckbox {...args} checked />
      <ReqoreCheckbox {...args} disabled />
      <ReqoreCheckbox {...args} label='Label' labelDetail='Detail' labelPosition='left' />
    </>
  );
};

export const Basic = Template.bind({});
export const Switch = Template.bind({});
Switch.args = {
  asSwitch: true,
};
