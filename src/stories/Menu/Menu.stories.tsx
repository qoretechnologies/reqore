import { StoryFn, StoryObj } from '@storybook/react';
import { IReqoreMenuProps } from '../../components/Menu';
import { IReqoreMenuItemProps } from '../../components/Menu/item';
import {
  ReqoreInput,
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
  ReqorePopover,
} from '../../index';
import { StoryMeta } from '../utils';
import { IntentArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreMenuProps>();

const meta = {
  title: 'Navigation/Menu/Stories',
  component: ReqoreMenu,
  args: {
    width: '210px',
    maxHeight: undefined,
    wrapText: false,
    minimal: false,
    flat: true,
    rounded: true,
    transparent: false,
  },
  argTypes: {
    ...createArg('width', {
      type: 'string',
      defaultValue: '210px',
      name: 'Width',
    }),
    ...createArg('maxHeight', {
      type: 'string',
      defaultValue: undefined,
      name: 'Max Height',
    }),
    ...createArg('position', {
      defaultValue: undefined,
      name: 'Position',
      options: ['left', 'right'],
      control: {
        type: 'select',
      },
    }),
    ...createArg('wrapText', {
      defaultValue: false,
      name: 'Wrap text',
      control: {
        type: 'boolean',
      },
      description: 'Whether to wrap text or not',
    }),
    ...createArg('minimal', {
      defaultValue: false,
      name: 'Minimal',
      control: {
        type: 'boolean',
      },
      description: 'Whether to use minimal style or not',
    }),
    ...createArg('flat', {
      defaultValue: true,
      name: 'Flat',
      control: {
        type: 'boolean',
      },
      description: 'Whether to use flat style or not',
    }),
    ...createArg('rounded', {
      defaultValue: true,
      name: 'Rounded',
      control: {
        type: 'boolean',
      },
      description: 'Whether to use rounded style or not',
    }),
    ...createArg('transparent', {
      defaultValue: false,
      name: 'Transparent',
      control: {
        type: 'boolean',
      },
      description: 'Whether to use transparent style or not',
    }),
    ...IntentArg,
  },
} as StoryMeta<typeof ReqoreMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreMenuProps> = (args) => {
  return (
    <ReqoreMenu {...args}>
      <ReqoreInput placeholder='Custom component' icon='Search2Fill' flat={false} />
      <ReqoreMenuItem icon='Save3Fill' intent='success' selected>
        Selected success
      </ReqoreMenuItem>
      <ReqoreMenuItem icon='Save3Fill' badge={10}>
        Save
      </ReqoreMenuItem>
      <ReqoreMenuDivider label='BIG Divider' size='huge' />
      <ReqoreMenuItem
        icon='ChatPollFill'
        onClick={() => alert('Item clicked')}
        rightIcon='FahrenheitFill'
        onRightIconClick={() => alert('Icon clicked')}
        tooltip={{
          content: 'You sure?',
        }}
        intent='danger'
      >
        Delete
      </ReqoreMenuItem>

      <ReqoreMenuItem
        icon='BluetoothConnectLine'
        rightIcon='EditLine'
        onRightIconClick={() => alert('Icon clicked')}
        description='Button with right icon and description'
        customTheme={{
          main: 'info:darken:1:0.3',
        }}
      >
        Some button
      </ReqoreMenuItem>

      <ReqoreMenuItem icon='Lock2Fill' description='I also have a description'>
        This is a really long item that should wrap
      </ReqoreMenuItem>
      <ReqoreMenuItem icon='Lock2Fill' disabled>
        Disabled
      </ReqoreMenuItem>
      <ReqoreMenuItem icon='Lock2Fill' disabled intent='warning'>
        Disabled intent
      </ReqoreMenuItem>
      <ReqoreMenuDivider label='Divider' />
      <ReqorePopover
        component={ReqoreMenuItem}
        flat={args.flat}
        componentProps={
          {
            icon: 'EmotionUnhappyLine',
            rightIcon: 'Scissors2Fill',
            leftIconColor: 'danger:lighten',
            wrap: args.wrapText,
            flat: args.flat,
          } as IReqoreMenuItemProps
        }
        openOnMount
        content={
          <ReqoreMenu {...args}>
            <ReqoreMenuItem icon='ZhihuFill'>Item 1</ReqoreMenuItem>
            <ReqoreMenuItem
              icon='AccountCircleFill'
              description='Would you look at that beautiful description'
              intent='warning'
            >
              Item 2
            </ReqoreMenuItem>
            <ReqoreMenuItem icon='AnticlockwiseFill' disabled>
              Item 3
            </ReqoreMenuItem>
            <ReqoreMenuItem
              icon='ArchiveFill'
              badge={{
                label: '10',
                effect: { gradient: { colors: { 0: '#00e3e8', 100: '#eb0e8c' } } },
              }}
            >
              Item 4
            </ReqoreMenuItem>
          </ReqoreMenu>
        }
        isReqoreComponent
        noWrapper
        handler='click'
        placement='right'
      >
        I have a submenu on click
      </ReqorePopover>
      <ReqoreMenuDivider
        label='Fancy divider'
        effect={{ gradient: { colors: { 0: '#0d5ba5', 100: '#ff5dfd' } } }}
        align='left'
      />
      <ReqoreMenuItem icon='DualSim1Line' rightIcon='MoneyEuroBoxLine' selected>
        I am selected!
      </ReqoreMenuItem>
      <ReqoreMenuItem
        icon='FireLine'
        rightIcon='ArrowRightDownLine'
        effect={{
          gradient: {
            colors: {
              0: '#000000',
              100: 'transparent',
            },
          },
        }}
        description='I also have a description'
        badge={10}
      >
        Fancy
      </ReqoreMenuItem>
    </ReqoreMenu>
  );
};

export const Basic: Story = {
  render: Template,
};

export const WrappedText: Story = {
  render: Template,

  args: {
    wrapText: true,
  },
};

export const Minimal: Story = {
  render: Template,

  args: {
    minimal: true,
  },
};

export const NoPadding: Story = {
  render: Template,

  args: {
    padded: false,
  },
};

export const NotFlat: Story = {
  render: Template,

  args: {
    flat: false,
  },
};

export const Transparent: Story = {
  render: Template,

  args: {
    transparent: true,
  },
};
