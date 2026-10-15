import { StoryFn, StoryObj } from '@storybook/react';
import { fireEvent, within } from 'storybook/test';
import { IReqoreMenuProps } from '../../components/Menu';
import { IReqoreMenuItemProps } from '../../components/Menu/item';
import { ReqoreMenuSection } from '../../components/Menu/section';
import {
  ReqoreControlGroup,
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
  title: 'Navigation/Menu',
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

const MenuWithSubmenus = (args: IReqoreMenuProps) => (
  <ReqoreMenu {...args} width='300px'>
    <ReqoreMenuSection label='Submenu 1' icon='Apps2Fill'>
      <ReqoreMenuItem
        icon='DualSim1Line'
        rightIcon='MoneyEuroBoxLine'
        leftAction={{ icon: 'EditLine' }}
      >
        Submenu Item 1
      </ReqoreMenuItem>
      <ReqoreMenuItem
        icon='DualSim1Line'
        rightIcon='MoneyEuroBoxLine'
        disabled
        rightAction={{ icon: 'AddLine', disabled: true }}
      >
        Submenu Item 2
      </ReqoreMenuItem>
      <ReqoreMenuSection icon='PlayListLine' label='Submenu 2 active' activeIntent='info'>
        <ReqoreMenuItem icon='DualSim1Line' rightIcon='MoneyEuroBoxLine'>
          Submenu Item 3
        </ReqoreMenuItem>
        <ReqoreMenuItem icon='DualSim1Line' rightIcon='MoneyEuroBoxLine'>
          Submenu Item 4
        </ReqoreMenuItem>
      </ReqoreMenuSection>
      <ReqoreMenuSection label='Collapsed submenu' isCollapsed={true} icon='ListOrdered'>
        <ReqoreMenuItem icon='DualSim1Line' rightIcon='MoneyEuroBoxLine'>
          Submenu Item 5
        </ReqoreMenuItem>
        <ReqoreMenuItem icon='DualSim1Line' rightIcon='MoneyEuroBoxLine'>
          Submenu Item 6
        </ReqoreMenuItem>
      </ReqoreMenuSection>
    </ReqoreMenuSection>
  </ReqoreMenu>
);

const Template: StoryFn<IReqoreMenuProps> = (args) => {
  return (
    <ReqoreControlGroup verticalAlign='flex-start' style={{ height: '100%' }}>
      <ReqoreMenu {...args}>
        <ReqoreControlGroup>
          <ReqoreInput placeholder='Custom component' icon='Search2Fill' flat={false} />
        </ReqoreControlGroup>
        <ReqoreControlGroup
          vertical
          style={{ overflowY: 'auto', overflowX: 'hidden' }}
          wrap={false}
        >
          <ReqoreMenuItem icon='Save3Fill' intent='success' selected>
            Selected success
          </ReqoreMenuItem>
          <ReqoreMenuItem icon='Save3Fill' badge={[10, 20]}>
            Save this item
          </ReqoreMenuItem>
          <ReqoreMenuDivider label='BIG Divider' size='huge' />

          <ReqoreMenuItem
            icon='ChatPollFill'
            onClick={() => alert('Item clicked')}
            rightIcon='FahrenheitFill'
            rightAction={{ icon: 'AlertLine', onClick: () => alert('Icon clicked') }}
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
            stackWithActions={false}
            flat={false}
            transparent={false}
            rightAction={{ icon: 'AlertLine', onClick: () => alert('Icon clicked') }}
            description='Button with right icon and description'
            customTheme={{
              main: 'info:darken:5:0.3',
            }}
          >
            Some button
          </ReqoreMenuItem>

          <ReqoreMenuItem icon='Lock2Fill' description='I also have a description' wrap>
            This is a really long item that should wrap
          </ReqoreMenuItem>
          <ReqoreMenuItem icon='Lock2Fill' disabled>
            Disabled
          </ReqoreMenuItem>
        </ReqoreControlGroup>
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
          padded='none'
          margin='none'
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
      <MenuWithSubmenus {...args} />
    </ReqoreControlGroup>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu in its default configuration.',
      },
    },
  },
  render: Template,
};

export const WrappedText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu with text wrapping enabled.',
      },
    },
  },
  render: Template,

  args: {
    wrapText: true,
  },
};

export const Minimal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu in its minimal variant.',
      },
    },
  },
  render: Template,

  args: {
    minimal: true,
  },
};

export const NoPadding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu without padding.',
      },
    },
  },
  render: Template,

  args: {
    padded: false,
  },
};

export const NotFlat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu with flat={false} so the elevated look is applied.',
      },
    },
  },
  render: Template,

  args: {
    flat: false,
  },
};

export const Transparent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu with a transparent background.',
      },
    },
  },
  render: Template,

  args: {
    transparent: true,
  },
};

export const Positioned: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu with an explicit position applied.',
      },
    },
  },
  render: Template,

  args: {
    position: 'left',
    transparent: true,
    rounded: false,
    padded: false,
  },
};

export const Small: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu at the small size.',
      },
    },
  },
  render: Template,

  args: {
    position: 'left',
    size: 'small',
    rounded: false,
  },
};

export const BigGapSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu with a big gap between items.',
      },
    },
  },
  render: Template,

  args: {
    itemGap: 'big',
  },
};

export const Skeleton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu in its skeleton loading state.',
      },
    },
  },
  render: Template,

  args: {
    skeleton: true,
  },
};

export const SubmenuCanBeToggled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu and toggles a submenu open and closed.',
      },
    },
  },
  render: (args) => <MenuWithSubmenus {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await fireEvent.click(canvas.queryAllByText('Submenu 2 active')[0]);
    await fireEvent.click(canvas.queryAllByText('Collapsed submenu')[0]);
  },
};

const MenuWithActionDropdown = (args: IReqoreMenuProps) => (
  <ReqoreMenu {...args} width='260px'>
    <ReqoreMenuItem
      icon='GitBranchLine'
      onClick={() => alert('Open Workflows Hub')}
      rightAction={{
        icon: 'AddLine',
        tooltip: { content: 'Workflow shortcuts' },
        actions: [
          { divider: true, label: 'Browse', dividerAlign: 'left' },
          { icon: 'ListOrdered', label: 'Show all workflows', onClick: () => alert('all workflows') },
          { icon: 'StickyNoteLine', label: 'Show all steps', onClick: () => alert('all steps') },
          { icon: 'FileList2Line', label: 'Show workflow orders', onClick: () => alert('orders') },
          { divider: true, label: 'Create', dividerAlign: 'left' },
          { icon: 'AddLine', label: 'Create workflow', onClick: () => alert('create workflow') },
          { icon: 'AddLine', label: 'Create step', onClick: () => alert('create step') },
        ],
      }}
    >
      Workflows Hub
    </ReqoreMenuItem>
    <ReqoreMenuItem
      icon='DashboardLine'
      onClick={() => alert('Open Automation Hub')}
      rightAction={{
        icon: 'AddLine',
        tooltip: { content: 'Automation shortcuts' },
        actions: [
          { divider: true, label: 'Browse', dividerAlign: 'left' },
          { icon: 'DashboardLine', label: 'Show all Qogs', onClick: () => alert('all qogs') },
          { icon: 'CloudLine', label: 'Automation templates', onClick: () => alert('templates') },
          { icon: 'Apps2Fill', label: 'Explore apps', onClick: () => alert('apps') },
          { divider: true, label: 'Create', dividerAlign: 'left' },
          { icon: 'AddLine', label: 'Create Qog', onClick: () => alert('create qog') },
        ],
      }}
    >
      Automation Hub
    </ReqoreMenuItem>
  </ReqoreMenu>
);

export const ItemActionDropdown: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A menu item whose right action is a dropdown. The row navigates on click, while the trailing `+` opens a popover of grouped shortcuts — `divider` items form the groups (Browse / Create). Set `rightAction={{ icon, actions: [...] }}`; tune the popover (placement, caret, filtering) via `actionsProps`. This is what backs the qorus-ide sidebar's Workflows Hub / Automation Hub entries.",
      },
    },
  },
  render: (args) => <MenuWithActionDropdown {...args} />,
  play: async ({ canvasElement }) => {
    // Open the first row's action dropdown so the grouped shortcuts render.
    await fireEvent.click(canvasElement.querySelectorAll('.reqore-menu-item-right-action')[0]);
    await within(document.body).findByText('Show all workflows');
  },
};

export const Resizable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu in a resizable configuration.',
      },
    },
  },
  render: Template,

  args: {
    style: {
      overflow: 'hidden',
    },
    position: 'left',
    showResizableBorder: true,
    resizable: {
      enable: { left: true },
      minWidth: 400,
      maxWidth: 600,
      defaultSize: { width: 400, height: '100%' },
    },
  },
};

export const ResizableBothSidesWithBorder: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu resizable on both sides with a border.',
      },
    },
  },
  render: Template,

  args: {
    showResizableBorder: true,
    resizable: {
      enable: { right: true, left: true },
      minWidth: 400,
      maxWidth: 600,
      defaultSize: { width: 400, height: '100%' },
    },
  },
};

export const WithCustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu with a custom theme.',
      },
    },
  },
  render: Template,

  args: {
    customTheme: { main: '#2b052b' },
  },
};

export const WithEffect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Menu with a visual effect applied.',
      },
    },
  },
  render: Template,

  args: {
    effect: {
      gradient: {
        colors: {
          0: '#5e00ff',
          100: '#ff0073',
        },
      },
    },
  },
};
