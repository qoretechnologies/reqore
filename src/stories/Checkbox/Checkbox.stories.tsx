import { ComponentMeta, ComponentStory } from '@storybook/react';
import Checkbox from '../../components/Checkbox';
import { ReqoreCheckbox, ReqoreControlGroup } from '../../index';

export default {
  title: 'Components/Checkbox',
  parameters: ['checkbox.test.tsx'],
} as ComponentMeta<typeof Checkbox>;

const Template: ComponentStory<typeof Checkbox> = (args) => {
  return (
    <ReqoreControlGroup>
      <ReqoreCheckbox {...args} />
      <ReqoreCheckbox {...args} label='Label' labelDetail='Detail' labelDetailPosition='left' />
      <ReqoreCheckbox {...args} checked tooltip='I am checked' />
      <ReqoreCheckbox {...args} disabled />
      <ReqoreCheckbox {...args} label='Label' labelDetail='Detail' labelPosition='left' />
      <ReqoreCheckbox {...args} label='Read Only' labelPosition='left' readOnly />
    </ReqoreControlGroup>
  );
};

export const Basic = Template.bind({});
export const Switch = Template.bind({});
Switch.args = {
  asSwitch: true,
};
