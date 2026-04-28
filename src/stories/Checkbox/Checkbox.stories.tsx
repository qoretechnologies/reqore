import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Checkbox from '../../components/Checkbox';
import { ReqoreCheckbox, ReqoreControlGroup, ReqoreVerticalSpacer } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Form/Checkbox/Stories',
  component: ReqoreCheckbox,
  args: {
    onCheckClick: () => alert('Checked!'),
    onUncheckClick: () => alert('Unchecked!'),
  },
} as StoryMeta<typeof ReqoreCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<typeof Checkbox> = (args) => {
  const [checked, setChecked] = useState<boolean>(args.checked ?? undefined);

  const handleCheckClick = () => {
    setChecked(true);
  };

  const handleUncheckChange = () => {
    setChecked(false);
  };

  return (
    <ReqoreControlGroup vertical>
      <ReqoreControlGroup wrap>
        <ReqoreCheckbox
          {...args}
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          label='Label'
          labelDetail='Detail'
          labelDetailPosition='left'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          tooltip='I am checked'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          checked={checked}
          tooltip='I am checked with intent'
          checkedIntent='success'
          uncheckedIntent='danger'
          unsetIntent='pending'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
        />
        <ReqoreCheckbox
          {...args}
          disabled
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          label='Label'
          checked={checked}
          labelDetail='Detail'
          labelPosition='left'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
        />
        <ReqoreCheckbox
          {...args}
          label='Read Only'
          checked={checked}
          labelPosition='left'
          readOnly
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
        />
      </ReqoreControlGroup>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreControlGroup wrap>
        <ReqoreCheckbox
          {...args}
          intent='info'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          label='Label'
          checked={checked}
          labelDetail='Detail'
          labelDetailPosition='left'
          labelEffect={{ gradient: { colors: { 0: 'danger:lighten:1', 100: '#ff6700' } } }}
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
        />
        <ReqoreCheckbox
          {...args}
          checked={checked}
          tooltip='I am checked'
          effect={{ gradient: { colors: { 0: '#00fafd', 100: '#ff00d0' } } }}
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
        />
        <ReqoreCheckbox
          {...args}
          disabled
          onText='yes'
          offText='no'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          onText='yes'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          onText='yes'
          offText='no'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          label='Label'
          labelDetail='Detail'
          labelPosition='left'
          unsetIcon='EmotionNormalLine'
          checkedIcon='EmotionHappyFill'
          uncheckedIcon='EmotionSadFill'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          label='Read Only'
          labelPosition='left'
          readOnly
          image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
      </ReqoreControlGroup>
      <ReqoreCheckbox
        {...args}
        label='Hello'
        description="I am a really long description that should be truncated with an ellipsis if it exceeds the width of the checkbox. Let's see how it looks!"
        onCheckClick={handleCheckClick}
        onUncheckClick={handleUncheckChange}
        checked={checked}
      />
      <ReqoreCheckbox
        {...args}
        labelPosition='left'
        label='Hello'
        description="I am a really long description that should be truncated with an ellipsis if it exceeds the width of the checkbox. Let's see how it looks!"
        onCheckClick={handleCheckClick}
        onUncheckClick={handleUncheckChange}
        checked={checked}
      />
    </ReqoreControlGroup>
  );
};

export const Basic: Story = {
  render: Template,
};

export const BasicUnchecked: Story = {
  render: Template,

  args: {
    checked: false,
  },
};

export const BasicChecked: Story = {
  render: Template,

  args: {
    checked: true,
  },
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
