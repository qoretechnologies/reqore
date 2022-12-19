import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreMenuProps } from '../../components/Menu';
import { IReqoreMenuItemProps } from '../../components/Menu/item';
import { ReqoreMenu, ReqoreMenuDivider, ReqoreMenuItem, ReqorePopover } from '../../index';
import { IntentArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreMenuProps>();

export default {
  title: 'Components/Menu',
  argTypes: {
    ...createArg('width', {
      type: 'string',
      defaultValue: '160px',
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
    ...IntentArg,
  },
} as Meta<IReqoreMenuProps>;

const Template: Story<IReqoreMenuProps> = (args) => {
  return (
    <ReqoreMenu {...args}>
      <ReqoreMenuItem icon='Save3Fill' intent='success' selected>
        Selected success
      </ReqoreMenuItem>
      <ReqoreMenuItem icon='Save3Fill'>Save</ReqoreMenuItem>
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
        componentProps={
          {
            icon: 'EmotionUnhappyLine',
            rightIcon: 'Scissors2Fill',
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
        handler='click'
        placement='right'
      >
        I have a submenu on click
      </ReqorePopover>
      <ReqoreMenuDivider
        label='Fancy divider'
        effect={{ textAlign: 'left', gradient: { colors: { 0: '#0d5ba5', 100: '#ff5dfd' } } }}
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

export const Basic = Template.bind({});
export const WrappedText = Template.bind({});
WrappedText.args = {
  wrapText: true,
};
export const NotFlat = Template.bind({});
NotFlat.args = {
  flat: false,
};
