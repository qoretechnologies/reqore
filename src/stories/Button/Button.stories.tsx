import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import ReqoreButton from '../../components/Button';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';
import { IconArg, SizeArg } from '../utils/args';

const meta = {
  title: 'Form/Button/Stories',
  component: ReqoreButton,
  argTypes: {
    ...IconArg('icon', 'Icon'),
    ...IconArg('rightIcon', 'Right Icon'),
    ...SizeArg,
  },
  args: {
    icon: '24HoursFill',
    rightIcon: '24HoursFill',
  },
} as StoryMeta<typeof ReqoreButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<typeof ReqoreButton> = (buttonProps) => {
  return (
    <ReqoreControlGroup vertical gapSize='big'>
      <ReqoreControlGroup size={buttonProps.size} wrap>
        <ReqoreButton {...buttonProps} icon='BankFill' rightIcon={null} />
        <ReqoreButton {...buttonProps} />
        <ReqoreButton
          {...buttonProps}
          icon='BankFill'
          rightIcon={null}
          iconsAlign='center'
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
        <ReqoreButton {...buttonProps} icon={undefined} rightIcon={undefined} compact>
          Compact
        </ReqoreButton>
        <ReqoreButton {...buttonProps} rightIcon={undefined} compact />
        <ReqoreButton {...buttonProps} compact />
        <ReqoreButton
          {...buttonProps}
          compact
          icon='AirplayLine'
          rightIcon='Building3Fill'
          label='Compact'
        />
        <ReqoreButton {...buttonProps} readOnly onClick={alert}>
          Read only
        </ReqoreButton>
      </ReqoreControlGroup>
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
      <ReqoreControlGroup fluid wrap>
        <ReqoreButton {...buttonProps} verticalPadding='tiny'>
          Vertical padding tiny
        </ReqoreButton>
        <ReqoreButton {...buttonProps} verticalPadding='small'>
          Vertical padding small
        </ReqoreButton>
        <ReqoreButton {...buttonProps} verticalPadding='normal'>
          Vertical padding normal
        </ReqoreButton>
        <ReqoreButton {...buttonProps} verticalPadding='big'>
          Vertical padding big
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          verticalPadding='huge'
          badge={10}
          description='This is a description'
        >
          Vertical padding huge
        </ReqoreButton>
      </ReqoreControlGroup>
      <ReqoreControlGroup fluid wrap>
        <ReqoreButton {...buttonProps} fluid>
          Fluid button
        </ReqoreButton>
      </ReqoreControlGroup>
      <ReqoreControlGroup fluid wrap>
        <ReqoreButton {...buttonProps} fluid textAlign='center'>
          Fluid button with centered text
        </ReqoreButton>
      </ReqoreControlGroup>
      <ReqoreControlGroup fluid wrap>
        <ReqoreButton {...buttonProps} fluid textAlign='center' iconsAlign='center'>
          Fluid button with centered text & icons
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          rightIcon={null}
          fluid
          textAlign='center'
          iconsAlign='center'
        >
          Fluid button with centered text & icons
        </ReqoreButton>
        <ReqoreButton {...buttonProps} icon={null} fluid textAlign='center' iconsAlign='center'>
          Fluid button with centered text & icons
        </ReqoreButton>
      </ReqoreControlGroup>
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
      <ReqoreControlGroup wrap>
        <ReqoreButton
          {...buttonProps}
          leftIconProps={{ rotation: 180 }}
          rightIconProps={{ rotation: 270 }}
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
                  colors: { 0: 'danger', 100: 'danger:darken:1:0.1' },
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
    </ReqoreControlGroup>
  );
};

export const Default: Story = {
  render: Template,
};

export const Info: Story = {
  render: Template,

  args: {
    intent: 'info',
  },
};

export const Success: Story = {
  render: Template,

  args: {
    intent: 'success',
  },
};

export const Warning: Story = {
  render: Template,

  args: {
    intent: 'warning',
  },
};

export const Pending: Story = {
  render: Template,

  args: {
    intent: 'pending',
  },
};

export const Danger: Story = {
  render: Template,

  args: {
    intent: 'danger',
  },
};

export const Muted: Story = {
  render: Template,

  args: {
    intent: 'muted',
  },
};

export const Effect: Story = {
  render: Template,

  args: {
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
  },
};

export const GlobalEffect: Story = {
  render: Template,

  args: {
    otherThemeOptions: {
      buttons: {
        gradient: true,
        animate: 'active',
      },
    },
  },
};

export const Pill: Story = {
  render: Template,

  args: {
    pill: true,
  },
};
