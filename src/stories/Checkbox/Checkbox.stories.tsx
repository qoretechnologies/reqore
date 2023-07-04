import { ComponentMeta, ComponentStory } from '@storybook/react';
import Checkbox from '../../components/Checkbox';
import { ReqoreCheckbox, ReqoreControlGroup, ReqoreVerticalSpacer } from '../../index';

export default {
  title: 'Form/Checkbox/Stories',
  parameters: ['checkbox.test.tsx'],
} as ComponentMeta<typeof Checkbox>;

const Template: ComponentStory<typeof Checkbox> = (args) => {
  return (
    <ReqoreControlGroup vertical>
      <ReqoreControlGroup wrap>
        <ReqoreCheckbox {...args} />
        <ReqoreCheckbox {...args} label='Label' labelDetail='Detail' labelDetailPosition='left' />
        <ReqoreCheckbox {...args} checked tooltip='I am checked' />
        <ReqoreCheckbox {...args} disabled />
        <ReqoreCheckbox {...args} label='Label' labelDetail='Detail' labelPosition='left' />
        <ReqoreCheckbox {...args} label='Read Only' labelPosition='left' readOnly />
      </ReqoreControlGroup>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreControlGroup wrap>
        <ReqoreCheckbox {...args} intent='info' checked />
        <ReqoreCheckbox
          {...args}
          label='Label'
          labelDetail='Detail'
          labelDetailPosition='left'
          labelEffect={{ gradient: { colors: { 0: 'danger:lighten:1', 100: '#ff6700' } } }}
        />
        <ReqoreCheckbox
          {...args}
          checked
          tooltip='I am checked'
          effect={{ gradient: { colors: { 0: '#00fafd', 100: '#ff00d0' } } }}
        />
        <ReqoreCheckbox {...args} disabled onText='yes' offText='no' />
        <ReqoreCheckbox {...args} onText='yes' offText='no' />
        <ReqoreCheckbox {...args} onText='yes' offText='no' checked />
        <ReqoreCheckbox
          {...args}
          label='Label'
          labelDetail='Detail'
          labelPosition='left'
          checkedIcon='EmotionHappyFill'
          uncheckedIcon='EmotionSadFill'
        />
        <ReqoreCheckbox
          {...args}
          label='Read Only'
          labelPosition='left'
          readOnly
          checked
          image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
        />
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  );
};

export const Basic = Template.bind({});
export const Switch = Template.bind({});
Switch.args = {
  asSwitch: true,
};
