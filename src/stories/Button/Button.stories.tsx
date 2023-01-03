import { ComponentMeta, ComponentStory } from '@storybook/react';
import { noop } from 'lodash';
import ReqoreButton from '../../components/Button';
import { ReqoreControlGroup } from '../../index';
import { IconArg, SizeArg } from '../utils/args';

export default {
  title: 'Components/Button',
  parameters: {
    jest: ['button.test.tsx'],
  },
  argTypes: {
    ...IconArg('icon', 'Icon'),
    ...IconArg('rightIcon', 'Right Icon'),
    ...SizeArg,
  },
} as ComponentMeta<typeof ReqoreButton>;

const Template: ComponentStory<typeof ReqoreButton> = (buttonProps) => {
  return (
    <>
      <ReqoreControlGroup size={buttonProps.size}>
        <ReqoreButton {...buttonProps} icon='BankFill' rightIcon={null} />
        <ReqoreButton {...buttonProps} />
        <ReqoreButton {...buttonProps}>Default</ReqoreButton>
        <ReqoreButton {...buttonProps} wrap maxWidth='150px'>
          Default wrapped button with long text
        </ReqoreButton>
        <ReqoreButton {...buttonProps} disabled>
          Disabled
        </ReqoreButton>
        <ReqoreButton {...buttonProps} active tooltip='hello'>
          Active
        </ReqoreButton>
        <ReqoreButton {...buttonProps} flat={false}>
          Not Flat
        </ReqoreButton>
        <ReqoreButton {...buttonProps} minimal>
          Minimal
        </ReqoreButton>
        <ReqoreButton {...buttonProps} minimal flat>
          Minimal flat
        </ReqoreButton>
        <ReqoreButton {...buttonProps} readOnly onClick={alert}>
          Read only
        </ReqoreButton>
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup fluid>
        <ReqoreButton {...buttonProps} fluid>
          Fluid button
        </ReqoreButton>
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup>
        <ReqoreButton
          {...buttonProps}
          description='This is a very interesting description for a button, I like it very much'
        >
          With Default Description
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          description='This is a very interesting description for a button, I like it very much'
          maxWidth='200px'
          badge={{
            color: '#00fafd',
            labelKey: 'Cool',
            label: 1234,
            actions: [{ icon: 'ShuffleLine', onClick: noop }],
          }}
        >
          With description and max width
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          description='This is a very interesting description for a button, I like it very much'
          maxWidth='200px'
          badge={{
            effect: {
              gradient: { colors: { 0: '#00fafd', 130: '#eb0e8c' }, direction: 'to right bottom' },
              uppercase: true,
            },
            labelKey: 'Cool',
            label: 1234,
            actions: [{ icon: 'ShuffleLine', onClick: noop }],
          }}
          wrap
        >
          With description and max width, wrapped
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          description='This is a very interesting description for a button, I like it very much'
          wrap
        />
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup>
        <ReqoreButton {...buttonProps} readOnly badge={10} onClick={alert}>
          With Badge
        </ReqoreButton>
        <ReqoreButton {...buttonProps} minimal badge={20} onClick={alert}>
          With Badge
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          badge={[
            20,
            {
              effect: {
                gradient: {
                  colors: { 0: '#ff0000', 100: '#000000' },
                  direction: 'to right bottom',
                },
              },
              labelKey: 'Cool',
              label: 1234,
              actions: [{ icon: 'ShuffleLine', onClick: noop }],
            },
          ]}
          onClick={alert}
        >
          With multiple badges
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          badge={{
            effect: {
              gradient: { colors: { 0: '#00fafd', 100: '#eb0e8c' }, direction: 'to right bottom' },
            },
            labelKey: 'Cool',
            label: 1234,
            actions: [{ icon: 'ShuffleLine', onClick: noop }],
          }}
          onClick={alert}
        >
          With modified Badge
        </ReqoreButton>
      </ReqoreControlGroup>
    </>
  );
};

export const Default = Template.bind({});
export const Info = Template.bind({});
Info.args = {
  intent: 'info',
};
export const Success = Template.bind({});
Success.args = {
  intent: 'success',
};
export const Warning = Template.bind({});
Warning.args = {
  intent: 'warning',
};
export const Pending = Template.bind({});
Pending.args = {
  intent: 'pending',
};
export const Danger = Template.bind({});
Danger.args = {
  intent: 'danger',
};
export const Muted = Template.bind({});
Muted.args = {
  intent: 'muted',
};
export const Effect: ComponentStory<typeof ReqoreButton> = Template.bind({});
Effect.args = {
  effect: {
    gradient: {
      direction: 'to right bottom',
      colors: { 0: '#33023c', 100: '#0a487b' },
    },
    spaced: 2,
    uppercase: true,
    weight: 'thick',
    textSize: 'small',
  },
};
