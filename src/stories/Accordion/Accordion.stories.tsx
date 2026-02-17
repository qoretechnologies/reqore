import { StoryObj } from '@storybook/react';
import { ReqoreAccordion } from '../../components/Accordion';
import { IReqoreAccordionItem } from '../../components/Accordion';
import { ReqoreButton, ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Navigation/Accordion/Stories',
  component: ReqoreAccordion,
  argTypes: {
    items: { control: false },
    onItemToggle: { control: false },
    effect: { control: false },
  },
} as StoryMeta<typeof ReqoreAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems: IReqoreAccordionItem[] = [
  {
    title: 'What is ReQore?',
    content:
      'ReQore is a highly theme-able and modular UI library for React, ' +
      'designed for the Qorus platform.',
  },
  {
    title: 'How do I install it?',
    content: 'You can install ReQore via npm or yarn: yarn add @qoretechnologies/reqore',
  },
  {
    title: 'Is it open source?',
    content: 'Yes! ReQore is open source and available on GitHub.',
  },
];

export const Basic: Story = {
  args: {
    items: basicItems,
  },
};

export const WithDefaultOpen: Story = {
  args: {
    items: [
      { ...basicItems[0], isOpen: true },
      basicItems[1],
      basicItems[2],
    ],
  },
};

export const SingleExpand: Story = {
  args: {
    items: [
      { ...basicItems[0], isOpen: true },
      basicItems[1],
      basicItems[2],
    ],
    allowMultiple: false,
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      {
        title: 'Getting Started',
        content: 'Install the package and wrap your app with ReqoreUIProvider.',
        icon: 'RocketLine',
        isOpen: true,
      },
      {
        title: 'Theming',
        content: 'Customize colors, fonts, and intents through the theme system.',
        icon: 'PaletteLine',
      },
      {
        title: 'Components',
        content: 'Over 40 components available: buttons, tables, modals, and more.',
        icon: 'LayoutGridLine',
      },
    ],
  },
};

export const WithBadges: Story = {
  args: {
    items: [
      {
        title: 'Inbox',
        content: 'Your inbox messages appear here.',
        icon: 'InboxLine',
        badge: 12,
        isOpen: true,
      },
      {
        title: 'Notifications',
        content: 'System notifications and alerts.',
        icon: 'Notification2Line',
        badge: [
          { label: '3 new', intent: 'info' },
          { label: '1 urgent', intent: 'danger' },
        ],
      },
      {
        title: 'Archive',
        content: 'Archived items are stored here.',
        icon: 'ArchiveLine',
        badge: 0,
      },
    ],
  },
};

export const WithIntents: Story = {
  render: (args) => (
    <ReqoreAccordion
      {...args}
      items={[
        {
          title: 'Info section',
          content: 'This section has info intent.',
          icon: 'InformationLine',
          intent: 'info',
          isOpen: true,
        },
        {
          title: 'Success section',
          content: 'This section has success intent.',
          icon: 'CheckLine',
          intent: 'success',
        },
        {
          title: 'Warning section',
          content: 'This section has warning intent.',
          icon: 'AlertLine',
          intent: 'warning',
        },
        {
          title: 'Danger section',
          content: 'This section has danger intent.',
          icon: 'ErrorWarningLine',
          intent: 'danger',
        },
      ]}
    />
  ),
};

export const GlobalIntent: Story = {
  args: {
    items: basicItems.map((item, i) => ({ ...item, isOpen: i === 0 })),
    intent: 'info',
  },
};

export const Sizes: Story = {
  render: (args) => {
    const sizes = ['tiny', 'small', 'normal', 'big', 'huge'] as const;

    return (
      <ReqoreControlGroup gapSize='big' vertical>
        {sizes.map((size) => (
          <div key={size}>
            <h4 style={{ marginBottom: '8px' }}>{size}</h4>
            <ReqoreAccordion
              {...args}
              size={size}
              items={[
                {
                  title: `${size} accordion item`,
                  content: `This is content for the ${size} size.`,
                  icon: 'InformationLine',
                  isOpen: true,
                },
                {
                  title: 'Another item',
                  content: 'More content here.',
                },
              ]}
            />
          </div>
        ))}
      </ReqoreControlGroup>
    );
  },
};

export const Flat: Story = {
  args: {
    items: basicItems.map((item, i) => ({ ...item, isOpen: i === 0 })),
    flat: true,
  },
};

export const Minimal: Story = {
  args: {
    items: basicItems.map((item, i) => ({ ...item, isOpen: i === 0 })),
    minimal: true,
  },
};

export const Fluid: Story = {
  args: {
    items: basicItems.map((item, i) => ({ ...item, isOpen: i === 0 })),
    fluid: true,
  },
};

export const Disabled: Story = {
  args: {
    items: basicItems,
    disabled: true,
  },
};

export const DisabledItems: Story = {
  args: {
    items: [
      { ...basicItems[0], isOpen: true },
      { ...basicItems[1], disabled: true },
      basicItems[2],
    ],
  },
};

export const CustomContent: Story = {
  render: (args) => (
    <ReqoreAccordion
      {...args}
      items={[
        {
          title: 'With action buttons',
          icon: 'Settings3Line',
          isOpen: true,
          content: (
            <ReqoreControlGroup vertical gapSize='big'>
              <p>This section has custom React content with action buttons.</p>
              <ReqoreControlGroup>
                <ReqoreButton icon='SaveLine' intent='success'>
                  Save
                </ReqoreButton>
                <ReqoreButton icon='CloseLine'>Cancel</ReqoreButton>
              </ReqoreControlGroup>
            </ReqoreControlGroup>
          ),
        },
        {
          title: 'With a list',
          icon: 'ListCheck2',
          content: (
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>First item</li>
              <li>Second item</li>
              <li>Third item</li>
            </ul>
          ),
        },
      ]}
    />
  ),
};

export const FAQExample: Story = {
  render: (args) => (
    <ReqoreAccordion
      {...args}
      fluid
      items={[
        {
          title: 'How do I reset my password?',
          icon: 'LockLine',
          content:
            'Go to the login page and click "Forgot password". ' +
            'You will receive an email with a reset link.',
        },
        {
          title: 'Can I change my subscription plan?',
          icon: 'ExchangeDollarLine',
          content:
            'Yes, you can upgrade or downgrade your plan at any time ' +
            'from the billing settings page.',
        },
        {
          title: 'How do I contact support?',
          icon: 'CustomerService2Line',
          content:
            'You can reach our support team via email at support@example.com ' +
            'or through the in-app chat widget.',
          isOpen: true,
        },
        {
          title: 'Is there a free trial?',
          icon: 'GiftLine',
          content:
            'Yes! We offer a 14-day free trial with full access to all features. ' +
            'No credit card required.',
        },
      ]}
    />
  ),
};

export const SettingsExample: Story = {
  render: (args) => (
    <ReqoreAccordion
      {...args}
      fluid
      allowMultiple={false}
      items={[
        {
          title: 'General',
          icon: 'Settings3Line',
          isOpen: true,
          content: (
            <ReqoreControlGroup vertical gapSize='normal'>
              <p>Application name, language, and timezone settings.</p>
              <ReqoreButton icon='EditLine' size='small'>
                Edit settings
              </ReqoreButton>
            </ReqoreControlGroup>
          ),
        },
        {
          title: 'Security',
          icon: 'ShieldLine',
          badge: { label: 'Action needed', intent: 'warning', icon: 'AlertLine' },
          content: (
            <ReqoreControlGroup vertical gapSize='normal'>
              <p>Password, two-factor authentication, and session management.</p>
              <ReqoreButton icon='LockLine' intent='warning' size='small'>
                Enable 2FA
              </ReqoreButton>
            </ReqoreControlGroup>
          ),
        },
        {
          title: 'Notifications',
          icon: 'Notification2Line',
          content: 'Configure email, push, and in-app notification preferences.',
        },
        {
          title: 'Danger Zone',
          icon: 'ErrorWarningLine',
          intent: 'danger',
          content: (
            <ReqoreControlGroup vertical gapSize='normal'>
              <p>Permanently delete your account and all associated data.</p>
              <ReqoreButton icon='DeleteBinLine' intent='danger' size='small'>
                Delete account
              </ReqoreButton>
            </ReqoreControlGroup>
          ),
        },
      ]}
    />
  ),
};
