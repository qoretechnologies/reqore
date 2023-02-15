import { ComponentMeta, ComponentStory } from '@storybook/react';
import { noop } from 'lodash';
import ReqoreButton from '../../components/Button';
import { IReqoreTheme } from '../../constants/theme';
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
      <ReqoreControlGroup size={buttonProps.size} wrap>
        <ReqoreButton {...buttonProps} icon='BankFill' rightIcon={null} />
        <ReqoreButton {...buttonProps} />
        <ReqoreButton
          {...buttonProps}
          icon='BankFill'
          rightIcon={null}
          textAlign='center'
          style={{ width: '100px' }}
        />
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
        <ReqoreButton {...buttonProps} minimal flat>
          Minimal
        </ReqoreButton>
        <ReqoreButton {...buttonProps} readOnly onClick={alert}>
          Read only
        </ReqoreButton>
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup size={buttonProps.size} wrap>
        <ReqoreButton {...buttonProps} active flat={false} tooltip='hello'>
          Active Not Flat
        </ReqoreButton>
        <ReqoreButton {...buttonProps} flat={false}>
          Not Flat
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          minimal
          flat={false}
          iconColor='#38fdb2'
          leftIconColor='#33023c:lighten:3'
          rightIconColor='#0a487b:lighten:3'
        >
          Minimal not flat
        </ReqoreButton>
        <ReqoreButton {...buttonProps} readOnly onClick={alert} flat={false}>
          Read only not flat
        </ReqoreButton>
        <ReqoreButton {...buttonProps} disabled flat={false}>
          Disabled not flat
        </ReqoreButton>
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup fluid wrap>
        <ReqoreButton {...buttonProps} fluid>
          Fluid button
        </ReqoreButton>
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup fluid wrap>
        <ReqoreButton {...buttonProps}>Left text</ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          icon={undefined}
          rightIcon={undefined}
          textAlign='center'
          maxWidth='250px'
          badge='10'
          wrap
          description='I am a button with a center aligned text and description'
        >
          Center
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          textAlign='center'
          maxWidth='200px'
          badge="I'm a badge, baby"
          wrap
          description='I am a button with a center aligned text and description'
        >
          Center text with a longer text
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          textAlign='right'
          badge="I'm a badge"
          description='I am a button with a right aligned text and description'
        >
          Right text
        </ReqoreButton>
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup wrap>
        <ReqoreButton
          {...buttonProps}
          description='This is a very interesting description for a button, I like it very much'
          iconColor='#38fdb2'
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
          minimal
          description='This is a very interesting description for a button, I like it very much'
          maxWidth='200px'
          labelEffect={{
            gradient: { colors: { 0: '#00fafd', 130: '#eb0e8c' }, direction: 'to right bottom' },
          }}
          descriptionEffect={{
            gradient: { colors: { 0: '#fd7600', 90: '#c997ff' }, type: 'radial' },
          }}
          effect={{
            gradient: {
              colors: { 0: '#be00fd', 130: '#e70eeb' },
              direction: 'to left bottom',
              animate: 'hover',
            },
          }}
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
      <ReqoreControlGroup wrap>
        <ReqoreButton {...buttonProps} readOnly badge={10} onClick={alert}>
          Read only with badge
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          minimal
          badge={20}
          onClick={alert}
          effect={{
            gradient: { colors: { 90: '#ffe69c', 0: '#ff7818' }, type: 'radial' },
          }}
          labelEffect={{
            gradient: { colors: { 0: '#ffe69c', 90: '#ff7818' }, type: 'radial' },
          }}
        >
          Minimal with badge
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          badge={[
            20,
            {
              effect: {
                gradient: {
                  colors: { 0: 'danger', 100: 'danger:darken' },
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
      animate: 'active',
    },
    spaced: 2,
    uppercase: true,
    weight: 'thick',
    textSize: 'small',
  },
};

export const GlobalEffect: ComponentStory<
  typeof ReqoreButton & { otherThemeOptions?: IReqoreTheme }
> = Template.bind({});
GlobalEffect.args = {
  otherThemeOptions: {
    buttons: {
      gradient: true,
      animate: 'active',
    },
  },
} as any;
