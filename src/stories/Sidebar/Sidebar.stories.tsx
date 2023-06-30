import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import { IQorusSidebarProps } from '../../components/Sidebar';
import { ReqorePanel, ReqoreSidebar } from '../../index';
import { qorusSidebarItems } from '../../mock/menu';
import { FlatArg, NoContentArg, argManager } from '../utils/args';

const { disableArg, createArg } = argManager<IQorusSidebarProps>();

export default {
  title: 'Navigation/Sidebar/Stories',
  argTypes: {
    ...disableArg('items'),
    ...FlatArg,
    ...createArg('path', {
      defaultValue: '/',
      name: 'Path',
      description: 'Mock location path',
      type: 'string',
    }),
    ...createArg('floating', {
      control: 'boolean',
      defaultValue: false,
      name: 'Floating',
      description: 'If the sidebar should be floating',
    }),
    ...createArg('bordered', {
      control: 'boolean',
      defaultValue: false,
      name: 'Bordered',
      description: 'If the sidebar should be bordered',
    }),
    ...createArg('isOpen', {
      control: 'boolean',
      defaultValue: false,
      name: 'Is Open',
      description: 'If the sidebar should be shown when floating',
    }),
    ...createArg('position', {
      control: 'select',
      options: ['left', 'right'],
      defaultValue: 'left',
      name: 'Sidebar position',
      description: 'Sidebar positions - this decides which border is drawn',
    }),
    ...NoContentArg,
  },
} as Meta;

const Template: Story<IQorusSidebarProps> = (args: IQorusSidebarProps) => {
  return (
    <ReqoreSidebar
      {...args}
      items={qorusSidebarItems}
      bookmarks={['submenu-item-2', 'another-item-1']}
      onBookmarksChange={noop}
      customItems={[
        {
          element: () => (
            <div style={{ padding: '10px' }}>
              <ReqorePanel intent='info' flat opacity={0.5}>
                Hello I am a custom element!
              </ReqorePanel>
            </div>
          ),
        },
      ]}
    />
  );
};

export const Basic = Template.bind({});
export const Floating = Template.bind({});
Floating.args = {
  floating: true,
  isOpen: true,
  hasFloatingBackground: true,
};
