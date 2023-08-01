import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { IQorusSidebarProps } from '../../components/Sidebar';
import { ReqorePanel, ReqoreSidebar } from '../../index';
import { qorusSidebarItems } from '../../mock/menu';
import { StoryMeta } from '../utils';
import { FlatArg, NoContentArg, argManager } from '../utils/args';

const { disableArg, createArg } = argManager<IQorusSidebarProps>();

const meta = {
  title: 'Navigation/Sidebar/Stories',
  component: ReqoreSidebar,
  args: {
    path: '/',
    floating: false,
    bordered: false,
    isOpen: false,
    position: 'left',
    withoutContent: true,
  },
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
} as StoryMeta<typeof ReqoreSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IQorusSidebarProps> = (args: IQorusSidebarProps) => {
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

export const Basic: Story = {
  render: Template,
};

export const Floating: Story = {
  render: Template,

  args: {
    floating: true,
    isOpen: true,
    hasFloatingBackdrop: true,
  },
};
