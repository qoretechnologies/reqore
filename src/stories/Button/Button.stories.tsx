import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { useState } from 'react';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { _testsWaitForText } from '../../../__tests__/utils';
import ReqoreButton from '../../components/Button';
import {
  ReqoreControlGroup,
  ReqoreMenu,
  ReqoreMenuItem,
  ReqoreMessage,
  ReqoreVerticalSpacer,
} from '../../index';
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button in its default configuration.',
      },
    },
  },
  render: Template,
};

export const Info: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with intent="info".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'info',
  },
};

export const Success: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with intent="success".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'success',
  },
};

export const Warning: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with intent="warning".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'warning',
  },
};

export const Pending: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with intent="pending".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'pending',
  },
};

export const Danger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with intent="danger".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'danger',
  },
};

export const Muted: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with intent="muted".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'muted',
  },
};

export const Black: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with intent="black".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'black',
  },
};

export const White: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with intent="white".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'white',
  },
};

export const CustomIntent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with a custom intent registered on the theme.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with a gradient/typography effect applied.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with an effect set globally on the theme.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with the compact variant enabled globally on the theme.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button in its pill shape.',
      },
    },
  },
  render: Template,

  args: {
    pill: true,
  },
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button in its loading state.',
      },
    },
  },
  render: Template,

  args: {
    loading: true,
  },
};

export const Raised: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with the raised effect.',
      },
    },
  },
  args: {
    label: 'Raised button',
    flat: true,
    raised: true,
  },
};

export const MinimalRaised: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button in the minimal + raised variant.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button at every radius size to show the border-radius scale.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with a keyboard shortcut wired in.',
      },
    },
  },
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

export const Indicator: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with an indicator badge.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      <ReqoreControlGroup wrap>
        <ReqoreButton icon='NotificationLine' indicator>
          Default (danger)
        </ReqoreButton>
        <ReqoreButton icon='NotificationLine' indicator={{ intent: 'info' }}>
          Info
        </ReqoreButton>
        <ReqoreButton icon='NotificationLine' indicator={{ intent: 'success' }}>
          Success
        </ReqoreButton>
        <ReqoreButton icon='NotificationLine' indicator={{ intent: 'warning' }}>
          Warning
        </ReqoreButton>
        <ReqoreButton icon='NotificationLine' indicator={{ color: '#a24bff' }}>
          Custom color
        </ReqoreButton>
      </ReqoreControlGroup>

      <ReqoreControlGroup wrap>
        <ReqoreButton icon='NotificationLine' indicator={{ intent: 'danger', pulse: true }}>
          Pulsing danger
        </ReqoreButton>
        <ReqoreButton icon='NotificationLine' indicator={{ intent: 'success', pulse: true }}>
          Pulsing success
        </ReqoreButton>
        <ReqoreButton icon='NotificationLine' minimal indicator={{ intent: 'info', pulse: true }}>
          Pulsing minimal
        </ReqoreButton>
      </ReqoreControlGroup>

      <ReqoreControlGroup wrap>
        <ReqoreButton icon='NotificationLine' indicator={{ position: 'top-right', pulse: true }}>
          Top right
        </ReqoreButton>
        <ReqoreButton icon='NotificationLine' indicator={{ position: 'top-left', pulse: true }}>
          Top left
        </ReqoreButton>
        <ReqoreButton icon='NotificationLine' indicator={{ position: 'bottom-right', pulse: true }}>
          Bottom right
        </ReqoreButton>
        <ReqoreButton icon='NotificationLine' indicator={{ position: 'bottom-left', pulse: true }}>
          Bottom left
        </ReqoreButton>
      </ReqoreControlGroup>

      <ReqoreControlGroup wrap verticalAlign='center'>
        {ALL_SIZES.map((size) => (
          <ReqoreButton
            key={size}
            size={size}
            icon='NotificationLine'
            indicator={{ intent: 'danger', pulse: true }}
          >
            {size}
          </ReqoreButton>
        ))}
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  ),
};

export const MultipleGradients: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button with layered gradient effects.',
      },
    },
  },
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

/**
 * `square` — chip mode. The button becomes a fixed-size square (width =
 * height) with no horizontal padding, so single-character or icon-only
 * content sits centred inside a rigid slot. Ideal for grids of uniform
 * toggle chips like day-of-week pickers (M T W T F S S) where every
 * chip must occupy the same width regardless of content.
 *
 * Composes with `size`, `intent`, `active`, `flat`, `minimal`, `raised`,
 * `customTheme`, `icon`, etc. Overrides `fluid`, `grow`, `shrink`, and
 * any inline width so the grid stays rigid.
 */
export const Square: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Button in square (chip) mode — a fixed-size slot with no horizontal padding.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      <ReqoreControlGroup wrap gapSize='small' verticalAlign='center'>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((letter, i) => (
          <ReqoreButton
            key={`${letter}-${i}`}
            size='small'
            minimal
            flat
            square
            active={i < 5}
            intent={i < 5 ? 'info' : undefined}
          >
            {letter}
          </ReqoreButton>
        ))}
      </ReqoreControlGroup>

      <ReqoreControlGroup wrap gapSize='small' verticalAlign='center'>
        {ALL_SIZES.map((size) => (
          <ReqoreButton key={size} size={size} icon='PencilLine' square />
        ))}
      </ReqoreControlGroup>

      <ReqoreControlGroup wrap gapSize='small' verticalAlign='center'>
        <ReqoreButton size='small' square intent='danger' icon='DeleteBinLine' />
        <ReqoreButton size='small' square intent='success' icon='CheckLine' />
        <ReqoreButton size='small' square intent='warning' icon='AlarmWarningLine' />
        <ReqoreButton size='small' square intent='info' icon='InformationLine' />
        <ReqoreButton size='small' square intent='muted' icon='PauseLine' />
      </ReqoreControlGroup>

      <ReqoreControlGroup wrap gapSize='small' verticalAlign='center'>
        {ALL_SIZES.map((size) => (
          <ReqoreButton
            key={size}
            size={size}
            square
            raised
            flat
            active
            intent='info'
          >
            {size[0].toUpperCase()}
          </ReqoreButton>
        ))}
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    // The active-day chips (first 5) all render at 32×32 regardless of
    // the letter width — the point of the prop.
    const chips = canvasElement.querySelectorAll('button.reqore-button');
    if (chips.length === 0) throw new Error('no square buttons found');
    const firstRow = Array.from(chips).slice(0, 7) as HTMLButtonElement[];
    const widths = new Set(firstRow.map((c) => Math.round(c.getBoundingClientRect().width)));
    // Every day chip is the same width (M, T, W, T, F, S, S) even
    // though the letters have different intrinsic widths.
    await expect(widths.size).toBe(1);
    // Width equals the size='small' side length (SIZE_TO_PX.small = 32).
    await expect([...widths][0]).toBe(32);

    // Regression guard: without horizontal padding, unset `textAlign`
    // defaults to 'left' and the letter sticks to the far left of the
    // 32-px box. `square` must implicitly default `textAlign` to
    // 'center' so single-character / icon-only content sits in the
    // middle of the chip. Verified by checking that the visible letter
    // is roughly horizontally centred inside its button (within ±4px
    // of the button's midpoint).
    for (const chip of firstRow) {
      const label = chip.querySelector('.reqore-button-text-content');
      if (!label) continue;
      const chipBox = chip.getBoundingClientRect();
      const labelBox = (label as HTMLElement).getBoundingClientRect();
      const chipMid = chipBox.left + chipBox.width / 2;
      const labelMid = labelBox.left + labelBox.width / 2;
      await expect(Math.abs(labelMid - chipMid)).toBeLessThan(4);
    }
  },
};

/* The real-world payload behind `descriptionMaxLines`: a qog template-field
   item whose example value is a whole base64-encoded file. Repeating a PDF
   header keeps it deterministic — and it contains no spaces, which is exactly
   the case that needs `overflow-wrap: anywhere` to fill lines at all. */
const BASE64_EXAMPLE = `Example value: "${'JVBERi0xLjcKJcTl8uXrp9Og0MTGCjQgMCBvYmoKPDwvRmlsdGVyL0ZsYXRlRGVjb2RlCg=='.repeat(
  30
)}"`;

const ClampedDescriptionDemo = () => {
  const [picks, setPicks] = useState(0);

  return (
    <ReqoreControlGroup vertical gapSize='big' style={{ maxWidth: 480 }}>
      <ReqoreMessage size='small' flat opaque={false} className='clamp-pick-count'>
        {`Item picks: ${picks}`}
      </ReqoreMessage>
      <ReqoreMenu padded rounded>
        <ReqoreMenuItem
          className='clamped-item'
          badge='data'
          description={BASE64_EXAMPLE}
          descriptionMaxLines={4}
          onClick={() => setPicks((cur) => cur + 1)}
        >
          Attachment Body
        </ReqoreMenuItem>
        <ReqoreMenuItem
          className='short-item'
          badge='string'
          description='Example value: "invoice.pdf"'
          descriptionMaxLines={4}
          onClick={() => setPicks((cur) => cur + 1)}
        >
          Attachment Name
        </ReqoreMenuItem>
      </ReqoreMenu>
    </ReqoreControlGroup>
  );
};

export const ClampedDescription: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Clamps an overflowing description to `descriptionMaxLines` lines with an inline "Show more" / "Show less" affordance — the pattern for template-field example values that can be a whole base64 file. The affordance only appears when the clamped text actually overflows (the short item stays affordance-free), revealing never activates the button itself, and a normal click on the item still does.',
      },
    },
  },
  render: () => <ClampedDescriptionDemo />,
  play: async ({ canvasElement }) => {
    // The long item clamps and grows a toggle; the short one measures as
    // fitting and must NOT get one, even with the prop set.
    await _testsWaitForText('Show more');
    const toggles = canvasElement.querySelectorAll('.reqore-button-description-toggle');
    await expect(toggles.length).toBe(1);
    await expect(canvasElement.querySelector('.short-item .reqore-button-description-toggle')).toBeNull();

    const description = canvasElement.querySelector(
      '.clamped-item .reqore-button-description'
    ) as HTMLElement;
    // Clamped: the element holds more text than it shows.
    await expect(description.scrollHeight).toBeGreaterThan(description.clientHeight + 1);

    // Revealing must not count as picking the item (the toggle span stops
    // propagation inside the <button>).
    fireEvent.click(toggles[0]);
    await _testsWaitForText('Show less');
    await _testsWaitForText('Item picks: 0');
    // Expanded: everything is visible now.
    await expect(description.scrollHeight).toBeLessThanOrEqual(description.clientHeight + 1);
    // Regression: expanding removes the clamp effect, but the unbroken base64
    // run must KEEP force-wrapping — without it the text stops wrapping and
    // overflows the surface horizontally.
    await expect(description.scrollWidth).toBeLessThanOrEqual(description.clientWidth + 1);

    // Collapse restores the clamp…
    fireEvent.click(
      canvasElement.querySelector('.clamped-item .reqore-button-description-toggle')!
    );
    await _testsWaitForText('Show more');
    await expect(description.scrollHeight).toBeGreaterThan(description.clientHeight + 1);

    // …and a plain click on the item itself still activates it.
    fireEvent.click(canvasElement.querySelector('.clamped-item')!);
    await _testsWaitForText('Item picks: 1');
  },
};

const ClampedDescriptionModalDemo = () => {
  const [picks, setPicks] = useState(0);

  return (
    <ReqoreControlGroup vertical gapSize='big' style={{ maxWidth: 480 }}>
      <ReqoreMessage size='small' flat opaque={false} className='clamp-pick-count'>
        {`Item picks: ${picks}`}
      </ReqoreMessage>
      <ReqoreMenu padded rounded>
        <ReqoreMenuItem
          className='clamped-item'
          badge='data'
          description={BASE64_EXAMPLE}
          descriptionMaxLines={4}
          descriptionModal
          descriptionShowMoreLabel='Show full value'
          onClick={() => setPicks((cur) => cur + 1)}
        >
          Attachment Body
        </ReqoreMenuItem>
      </ReqoreMenu>
    </ReqoreControlGroup>
  );
};

export const ClampedDescriptionModal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `descriptionModal` variant: for descriptions that can be huge (a whole base64 file), the affordance opens the FULL value in a modal — selectable, scrollable, with a Copy action — instead of expanding it inline into the surface. Opening and using the modal never activates the item itself.',
      },
    },
  },
  render: () => <ClampedDescriptionModalDemo />,
  play: async ({ canvasElement }) => {
    await _testsWaitForText('Show full value');

    // Open the full-value modal — this must NOT count as picking the item.
    fireEvent.click(canvasElement.querySelector('.reqore-button-description-toggle')!);
    const modal = await waitFor(
      () => {
        const el = document.querySelector('.reqore-button-description-modal');
        if (!el) throw new Error('modal not open yet');
        return el;
      },
      { timeout: 10000 }
    );
    await _testsWaitForText('Item picks: 0');

    // The modal holds the WHOLE value (the clamped surface shows a fraction).
    const textarea = modal.querySelector('textarea') as HTMLTextAreaElement;
    await expect(textarea.value.length).toBe(BASE64_EXAMPLE.length);

    // Copy surfaces a notification either way (success, or a denial from the
    // clipboard permission) — never an unhandled rejection.
    const copy = Array.from(modal.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Copy')
    )!;
    fireEvent.click(copy);
    await waitFor(
      () => {
        if (!document.querySelector('.reqore-notification')) throw new Error('no notification');
      },
      { timeout: 10000 }
    );

    // Closing the modal leaves the item unpicked.
    fireEvent.click(modal.querySelector('.reqore-drawer-close-button')!);
    await waitFor(
      () => {
        if (document.querySelector('.reqore-button-description-modal'))
          throw new Error('modal still open');
      },
      { timeout: 10000 }
    );
    await _testsWaitForText('Item picks: 0');
  },
};
