import { StoryObj } from '@storybook/react';
import { ReqoreColumns, ReqoreTier } from '../..';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Other/Tier',
  component: ReqoreTier,
  args: {
    name: 'Basic',
    nameDetail: 'For Individuals',
    price: '0.00',
    currency: '$',
    priceDetail: 'per month',
    description: 'This is a basic tier with limited features. Great for individuals',
    actionButtonProps: {
      label: 'Get Started',
      intent: 'success',
      size: 'big',
      fluid: true,
      pill: true,
    },
    featureList: [
      {
        icon: 'CheckLine',
        content: 'Unlimited access to basic features',
      },
      {
        icon: 'CheckLine',
        content: 'Community support',
      },
      {
        icon: 'CheckLine',
        content: '1 GB of storage',
        effect: { weight: 'bold' },
      },
      {
        icon: 'CheckLine',
        content: 'Custom branding options',
      },
    ],
  },
} as StoryMeta<typeof ReqoreTier>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};
export const Group: Story = {
  render: (args) => (
    <ReqoreColumns minColumnWidth='300px'>
      <ReqoreTier {...args} />
      <ReqoreTier
        name='Pro'
        nameDetail='For Teams'
        price='9.99'
        currency='$'
        priceDetail='per month'
        description='This is a pro tier with additional features. Ideal for teams.'
        featureList={[
          {
            icon: 'ArrowLeftLine',
            content: 'All features of Basic',
            effect: { weight: 'bold' },
          },
          {
            icon: 'CheckLine',
            content: 'Priority support',
          },
          {
            icon: 'CheckLine',
            content: '10 GB of storage',
          },
          {
            icon: 'CheckLine',
            content: 'Custom branding options',
          },
          {
            icon: 'CheckLine',
            content: 'Access to beta features',
          },
          {
            icon: 'CheckLine',
            content: 'Advanced analytics',
          },
          {
            icon: 'CheckLine',
            content: 'Collaboration tools',
          },
          {
            icon: 'CheckLine',
            content: 'API access',
          },
          {
            icon: 'CheckLine',
            content: 'Custom integrations',
          },
        ]}
        badge={[
          {
            label: 'Most Popular',
            align: 'center',
            intent: 'info',
          },
        ]}
      />
      <ReqoreTier
        name='Enterprise'
        nameDetail='For Large Organizations'
        price='49.99'
        currency='$'
        priceDetail='per month'
        description='This is an enterprise tier with all features.'
        featureList={[
          {
            icon: 'ArrowLeftLine',
            content: 'All features of Pro',
            effect: { weight: 'bold' },
          },
          {
            icon: 'CheckLine',
            content: 'Custom integrations',
          },
          {
            icon: 'CheckLine',
            content: '50 GB of storage',
          },
          {
            icon: 'CheckLine',
            content: 'Dedicated account manager',
          },
          {
            icon: 'CheckLine',
            content: '24/7 support',
          },
          {
            icon: 'CheckLine',
            content: 'Custom SLAs',
          },
          {
            icon: 'CheckLine',
            content: 'On-premises deployment options',
          },
          {
            icon: 'CheckLine',
            content: 'Advanced security features',
          },
        ]}
        badge={[
          {
            label: 'Sale',
            align: 'center',
            intent: 'success',
          },
        ]}
      />
    </ReqoreColumns>
  ),
};
