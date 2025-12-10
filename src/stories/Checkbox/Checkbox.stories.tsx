import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Checkbox from '../../components/Checkbox';
import { ReqoreCheckbox, ReqoreControlGroup, ReqoreVerticalSpacer } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Form/Checkbox/Stories',
  component: ReqoreCheckbox,
} as StoryMeta<typeof ReqoreCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<typeof Checkbox> = (args) => {
  const [checked, setChecked] = useState<boolean>(args.checked ?? undefined);

  const onChange = () => {
    setChecked(!checked);
  };

  return (
    <ReqoreControlGroup vertical>
      <ReqoreControlGroup wrap>
        <ReqoreCheckbox {...args} onClick={onChange} checked={checked} />
        <ReqoreCheckbox
          {...args}
          label='Label'
          labelDetail='Detail'
          labelDetailPosition='left'
          onClick={onChange}
          checked={checked}
        />
        <ReqoreCheckbox {...args} tooltip='I am checked' onClick={onChange} checked={checked} />
        <ReqoreCheckbox
          {...args}
          checked={checked}
          tooltip='I am checked with intent'
          checkedIntent='success'
          uncheckedIntent='danger'
          unsetIntent='pending'
          onClick={onChange}
        />
        <ReqoreCheckbox {...args} disabled onClick={onChange} checked={checked} />
        <ReqoreCheckbox
          {...args}
          label='Label'
          checked={checked}
          labelDetail='Detail'
          labelPosition='left'
          onClick={onChange}
        />
        <ReqoreCheckbox
          {...args}
          label='Read Only'
          checked={checked}
          labelPosition='left'
          readOnly
          onClick={onChange}
        />
      </ReqoreControlGroup>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreControlGroup wrap>
        <ReqoreCheckbox {...args} intent='info' onClick={onChange} checked={checked} />
        <ReqoreCheckbox
          {...args}
          label='Label'
          checked={checked}
          labelDetail='Detail'
          labelDetailPosition='left'
          labelEffect={{ gradient: { colors: { 0: 'danger:lighten:1', 100: '#ff6700' } } }}
          onClick={onChange}
        />
        <ReqoreCheckbox
          {...args}
          checked={checked}
          tooltip='I am checked'
          effect={{ gradient: { colors: { 0: '#00fafd', 100: '#ff00d0' } } }}
          onClick={onChange}
        />
        <ReqoreCheckbox
          {...args}
          disabled
          onText='yes'
          offText='no'
          onClick={onChange}
          checked={checked}
        />
        <ReqoreCheckbox {...args} onText='yes' offText='no' onClick={onChange} checked={checked} />
        <ReqoreCheckbox {...args} onText='yes' offText='no' onClick={onChange} checked={checked} />
        <ReqoreCheckbox
          {...args}
          label='Label'
          labelDetail='Detail'
          labelPosition='left'
          unsetIcon='EmotionNormalLine'
          checkedIcon='EmotionHappyFill'
          uncheckedIcon='EmotionSadFill'
          onClick={onChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          label='Read Only'
          labelPosition='left'
          readOnly
          image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
          onClick={onChange}
          checked={checked}
        />
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  );
};

export const Basic: Story = {
  render: Template,
};

export const SwitchUnset: Story = {
  render: Template,

  args: {
    asSwitch: true,
  },
};

export const SwitchUnchecked: Story = {
  render: Template,

  args: {
    asSwitch: true,
    checked: false,
  },
};

export const SwitchChecked: Story = {
  render: Template,

  args: {
    asSwitch: true,
    checked: true,
  },
};
