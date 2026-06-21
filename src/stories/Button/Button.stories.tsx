import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { useState } from 'react';
import { expect, fireEvent } from 'storybook/test';
import { _testsWaitForText } from '../../../__tests__/utils';
import ReqoreButton from '../../components/Button';
import { ReqoreControlGroup, ReqoreMessage, ReqoreVerticalSpacer } from '../../index';
import { StoryMeta } from '../utils';
import { ALL_SIZES, IconArg, RadiusSizeArg, SizeArg } from '../utils/args';

const meta = {
  title: 'Form/Button',
  component: ReqoreButton,
  argTypes: {
    ...IconArg('icon', 'Icon'),
    ...IconArg('rightIcon', 'Right Icon'),
    ...SizeArg,
    ...RadiusSizeArg,
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
        <ReqoreButton {...buttonProps} icon={null} rightIcon={null}>
          Just text
        </ReqoreButton>
        <ReqoreButton {...buttonProps} rightIcon={null}>
          With icon
        </ReqoreButton>
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
        <ReqoreButton {...buttonProps} transparent flat>
          Transparent
        </ReqoreButton>

        <ReqoreButton {...buttonProps} icon={undefined} rightIcon={undefined} compact>
          Compact
        </ReqoreButton>
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
        <ReqoreButton {...buttonProps} transparent>
          Transparent not flat
        </ReqoreButton>
        <ReqoreButton {...buttonProps} readOnly onClick={alert} flat={false}>
          Read only not flat
        </ReqoreButton>
        <ReqoreButton {...buttonProps} disabled flat={false}>
          Disabled not flat
        </ReqoreButton>
        <ReqoreButton {...buttonProps} maxWidth='150px'>
          Max Width Button
        </ReqoreButton>
      </ReqoreControlGroup>
      <ReqoreControlGroup fluid wrap>
        <ReqoreButton {...buttonProps} verticalPadding='tiny'>
          Vertical padding tiny
        </ReqoreButton>
        <ReqoreButton {...buttonProps} verticalPadding='small'>
          Vertical padding small
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          verticalPadding='normal'
          rightIcon={undefined}
          badge={{ align: 'right', label: 'R' }}
        >
          Vertical padding
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
        <ReqoreButton
          {...buttonProps}
          fluid
          badge={[
            1,
            { label: 'in da middle', align: 'center' },
            { label: 'right align', align: 'right' },
            2,
          ]}
        >
          Positioned badges
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          fluid
          badge={[1, { label: 'right align', align: 'right' }, 2]}
        >
          Positioned badges
        </ReqoreButton>
      </ReqoreControlGroup>

      <ReqoreControlGroup fluid wrap>
        <ReqoreButton {...buttonProps} fluid textAlign='center'>
          Fluid button with centered text
        </ReqoreButton>
      </ReqoreControlGroup>
      <ReqoreControlGroup fluid wrap>
        <ReqoreButton {...buttonProps} fluid textAlign='center' iconsAlign='center' badge='badge'>
          Fluid button with centered text & icons
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          rightIcon={null}
          fluid
          textAlign='center'
          iconsAlign='center'
          badge={[{ label: 'test', align: 'right' }, 2]}
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
          minimal
          description='This is a very interesting description for a button, I like it very much'
        >
          Minimal With Description
        </ReqoreButton>
        <ReqoreButton
          {...buttonProps}
          description='This is a very interesting description for a button, I like it very much'
          icon={undefined}
          rightIcon={undefined}
        >
          With No Icons
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
          transparent
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
          transparent
          badge={20}
          onClick={alert}
          effect={{
            gradient: { colors: { 90: '#ffe69c', 0: '#ff7818' }, type: 'radial' },
          }}
          labelEffect={{
            gradient: { colors: { 0: '#ffe69c', 90: '#ff7818' }, type: 'radial' },
          }}
        >
          Transparent with badge
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
              icon: 'BluetoothLine',
              labelKey: 'Cool',
              label: 1234,
              actions: [
                { icon: 'Repeat2Line', onClick: noop },
                { icon: 'ShuffleLine', onClick: noop },
              ],
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

export const Black: Story = {
  render: Template,

  args: {
    intent: 'black',
  },
};

export const White: Story = {
  render: Template,

  args: {
    intent: 'white',
  },
};

export const CustomIntent: Story = {
  render: Template,

  args: {
    otherThemeOptions: {
      intents: {
        custom3: '#5a025a',
      },
    },
    intent: 'custom3',
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
        effect: {
          gradient: {
            colors: 'info:darken:2:1',
            animate: 'active',
          },
        },
      },
    },
  },
};

export const GlobalCompact: Story = {
  render: Template,

  args: {
    otherThemeOptions: {
      buttons: {
        compact: true,
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

export const Loading: Story = {
  render: Template,

  args: {
    loading: true,
  },
};

export const Raised: Story = {
  args: {
    label: 'Raised button',
    flat: true,
    raised: true,
  },
};

export const MinimalRaised: Story = {
  render: () => (
    <div style={{ display: 'flex', flexFlow: 'column', gap: 16 }}>
      <ReqoreControlGroup>
        <ReqoreButton minimal flat raised label='Minimal raised' icon='24HoursFill' />
        <ReqoreButton minimal flat raised intent='info' label='Info' icon='InformationLine' />
        <ReqoreButton minimal flat raised intent='success' label='Success' icon='CheckLine' />
        <ReqoreButton minimal flat raised intent='warning' label='Warning' icon='AlertLine' />
        <ReqoreButton minimal flat raised intent='danger' label='Danger' icon='ErrorWarningLine' />
      </ReqoreControlGroup>

      <ReqoreControlGroup>
        <ReqoreButton minimal flat raised size='tiny' label='Tiny' icon='24HoursFill' />
        <ReqoreButton minimal flat raised size='small' label='Small' icon='24HoursFill' />
        <ReqoreButton minimal flat raised size='normal' label='Normal' icon='24HoursFill' />
        <ReqoreButton minimal flat raised size='big' label='Big' icon='24HoursFill' />
        <ReqoreButton minimal flat raised size='huge' label='Huge' icon='24HoursFill' />
      </ReqoreControlGroup>

      <ReqoreControlGroup>
        <ReqoreButton minimal flat raised label='With badge' icon='24HoursFill' badge={3} />
        <ReqoreButton
          minimal
          flat
          raised
          label='Right icon'
          icon='24HoursFill'
          rightIcon='ArrowRightLine'
        />
        <ReqoreButton minimal flat raised icon='24HoursFill' tooltip='Icon-only minimal raised' />
        <ReqoreButton minimal flat raised label='Disabled' icon='24HoursFill' disabled />
        <ReqoreButton minimal flat raised label='Active' icon='24HoursFill' active />
      </ReqoreControlGroup>

      <ReqoreControlGroup>
        <ReqoreButton flat raised label='flat + raised (non-minimal)' icon='24HoursFill' />
        <ReqoreButton
          flat
          raised
          intent='info'
          label='Solid info raised'
          icon='InformationLine'
        />
        <ReqoreButton minimal flat raised={false} label='Minimal, raised={false}' icon='24HoursFill' />
      </ReqoreControlGroup>
    </div>
  ),
};

export const RadiusSize: Story = {
  render: () => (
    <ReqoreControlGroup wrap>
      {ALL_SIZES.map((rs) => (
        <ReqoreButton key={rs} size='normal' radiusSize={rs} icon='RadarLine'>
          radiusSize={rs}
        </ReqoreButton>
      ))}
    </ReqoreControlGroup>
  ),
};

export const Shortcut: Story = {
  render: () => {
    const [count, setCount] = useState(0);

    return (
      <ReqoreControlGroup vertical>
        <ReqoreMessage intent='info'>Pressed {count} time(s)</ReqoreMessage>
        <ReqoreVerticalSpacer height={10} />
        <ReqoreControlGroup wrap>
          <ReqoreButton
            icon='SearchLine'
            shortcut='mod+k'
            badge={3}
            onClick={() => setCount((c) => c + 1)}
            className='shortcut-button'
          >
            Search
          </ReqoreButton>
          <ReqoreButton icon='Save3Line' shortcut='mod+s' intent='success'>
            Save
          </ReqoreButton>
          <ReqoreButton icon='DeleteBinLine' shortcut='mod+shift+backspace' intent='danger'>
            Delete
          </ReqoreButton>
          <ReqoreButton icon='SettingsLine' shortcut='mod+,' shortcutHint={false}>
            Settings (hidden hint)
          </ReqoreButton>
        </ReqoreControlGroup>
      </ReqoreControlGroup>
    );
  },
  play: async ({ canvasElement }) => {
    // The hint badge renders next to the button label
    await expect(
      canvasElement.querySelector('.shortcut-button .reqore-keyboard-shortcut')
    ).toBeTruthy();

    // `mod` is ⌘ on macOS and Ctrl elsewhere; press both so it matches on any
    // platform (react-hotkeys-hook only checks the platform-appropriate one).
    fireEvent.keyDown(document, { key: 'k', code: 'KeyK', metaKey: true, ctrlKey: true });

    // waitFor the click handler's state update to flush before asserting
    await _testsWaitForText('Pressed 1 time(s)');
  },
};

export const MultipleGradients: Story = {
  render: () => (
    <ReqoreControlGroup wrap>
      <ReqoreButton
        size='big'
        radiusSize='big'
        icon='ArrowRightLine'
        iconsAlign='center'
        effect={{
          gradient: [
            {
              type: 'radial',
              shape: 'ellipse',
              direction: 'at 0% 50%',
              colors: {
                0: '#ffffff:darken:1:0.4',
                65: '#ffffff:darken:1:0',
                100: '#ffffff:darken:1:0',
              },
            },
            {
              type: 'linear',
              direction: 'to right',
              colors: { 0: '#0066ff', 100: '#ff3da6' },
              animate: 'hover',
            },
          ],
          spaced: 1,
          weight: 'bold',
        }}
      >
        Layered button
      </ReqoreButton>
    </ReqoreControlGroup>
  ),
};
