import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import ReqoreContent from '../../components/Content';
import ReqoreIcon from '../../components/Icon';
import { IReqoreNavbarProps, ReqoreFooter } from '../../components/Navbar';
import { IReqoreNavbarItemProps } from '../../components/Navbar/item';
import {
  ReqoreHeader,
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
  ReqoreNavbarDivider,
  ReqoreNavbarGroup,
  ReqoreNavbarItem,
  ReqorePopover,
} from '../../index';
import { StoryMeta } from '../utils';
import { FlatArg, NoContentArg } from '../utils/args';

const meta = {
  title: 'Layout/Header & Footer/Stories',
  component: ReqoreHeader,
  args: {
    withoutContent: true,
  },
  argTypes: {
    ...FlatArg,
    ...NoContentArg,
  },
} as StoryMeta<typeof ReqoreHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreNavbarProps> = (args: IReqoreNavbarProps) => {
  return (
    <>
      <ReqoreHeader {...args}>
        <ReqoreNavbarGroup>
          <ReqoreNavbarItem>
            <h3>I am a logo on the left</h3>
          </ReqoreNavbarItem>
        </ReqoreNavbarGroup>
        <ReqoreNavbarGroup position='right'>
          <ReqoreNavbarItem active>
            <ReqoreIcon icon='AwardFill' />
          </ReqoreNavbarItem>
          <ReqoreNavbarItem disabled>
            <ReqoreIcon icon='BehanceLine' />
          </ReqoreNavbarItem>
          <ReqorePopover
            component={ReqoreNavbarItem}
            content={
              <ReqoreMenu>
                <ReqoreMenuDivider label='User area' />
                <ReqoreMenuItem icon='ArrowGoBackFill'>Profile</ReqoreMenuItem>
                <ReqoreMenuItem icon='DeleteBack2Fill'>Alerts</ReqoreMenuItem>
                <ReqoreMenuItem icon='FileTextFill'>Log out</ReqoreMenuItem>
              </ReqoreMenu>
            }
            handler='click'
            componentProps={{ interactive: true } as IReqoreNavbarItemProps}
            isReqoreComponent
          >
            <ReqoreIcon icon='UserFill' />
          </ReqorePopover>
          <ReqoreNavbarDivider />
          <ReqorePopover
            component={ReqoreNavbarItem}
            content='Notifications'
            componentProps={{ onClick: noop } as IReqoreNavbarItemProps}
            isReqoreComponent
          >
            <ReqoreIcon icon='Notification4Fill' />
          </ReqorePopover>
        </ReqoreNavbarGroup>
      </ReqoreHeader>

      <ReqoreContent>Hey!</ReqoreContent>
      <ReqoreFooter {...args}>
        <ReqoreNavbarGroup>
          <ReqoreNavbarItem>
            <h3>I am a logo on the left</h3>
          </ReqoreNavbarItem>
        </ReqoreNavbarGroup>
        <ReqoreNavbarGroup position='right'>
          <ReqorePopover
            component={ReqoreNavbarItem}
            content={
              <ReqoreMenu>
                <ReqoreMenuDivider label='User area' />
                <ReqoreMenuItem icon='DualSim1Fill'>Profile</ReqoreMenuItem>
                <ReqoreMenuItem icon='FolderReceivedFill'>Alerts</ReqoreMenuItem>
                <ReqoreMenuItem icon='FolderOpenFill'>Log out</ReqoreMenuItem>
              </ReqoreMenu>
            }
            handler='click'
            componentProps={{ interactive: true } as IReqoreNavbarItemProps}
            isReqoreComponent
          >
            <ReqoreIcon icon='FlightLandLine' />
          </ReqorePopover>
          <ReqorePopover
            component={ReqoreNavbarItem}
            content='Notifications'
            componentProps={{ interactive: true } as IReqoreNavbarItemProps}
            isReqoreComponent
          >
            <ReqoreIcon icon='GpsLine' />
          </ReqorePopover>
        </ReqoreNavbarGroup>
      </ReqoreFooter>
    </>
  );
};

export const Basic: Story = {
  render: Template,
};
