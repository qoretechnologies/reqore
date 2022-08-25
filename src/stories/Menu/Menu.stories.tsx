import { Meta, Story } from '@storybook/react/types-6-0';
import { IReqoreMenuProps } from '../../components/Menu';
import { IReqoreMenuItemProps } from '../../components/Menu/item';
import { ReqoreMenu, ReqoreMenuDivider, ReqoreMenuItem, ReqorePopover } from '../../index';
import { argManager } from '../utils/args';

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
  },
} as Meta<IReqoreMenuProps>;

export const MenuStory: Story<IReqoreMenuProps> = (args) => {
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
        onRightIconClick={(itemId) => alert('Icon clicked')}
        tooltip={{
          content: 'You sure?',
        }}
        intent='danger'
      >
        Delete
      </ReqoreMenuItem>

      <ReqoreMenuItem icon='Lock2Fill'>This is a really long item that should wrap</ReqoreMenuItem>
      <ReqoreMenuItem icon='Lock2Fill' disabled>
        Disabled
      </ReqoreMenuItem>
      <ReqoreMenuItem icon='Lock2Fill' disabled intent='warning'>
        Disabled intent
      </ReqoreMenuItem>
      <ReqoreMenuDivider />
      <ReqorePopover
        component={ReqoreMenuItem}
        componentProps={
          {
            icon: 'EmotionUnhappyLine',
            rightIcon: 'Scissors2Fill',
          } as IReqoreMenuItemProps
        }
        content={
          <ReqoreMenu {...args}>
            <ReqoreMenuItem icon='ZhihuFill'>Item 1</ReqoreMenuItem>
            <ReqoreMenuItem icon='AccountCircleFill'>Item 2</ReqoreMenuItem>
            <ReqoreMenuItem icon='AnticlockwiseFill' disabled>
              Item 3
            </ReqoreMenuItem>
            <ReqoreMenuItem icon='ArchiveFill'>Item 4</ReqoreMenuItem>
          </ReqoreMenu>
        }
        isReqoreComponent
        handler='click'
        placement='right'
      >
        I have a submenu on click
      </ReqorePopover>
      <ReqoreMenuDivider label='Divider' />
      <ReqoreMenuItem icon='DualSim1Line' rightIcon='MoneyEuroBoxLine' selected>
        I am selected!
      </ReqoreMenuItem>
    </ReqoreMenu>
  );
};

MenuStory.storyName = 'Menu';
