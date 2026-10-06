import { StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { ReqoreColumns, ReqoreTier } from '../..';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Other/Tier',
  component: ReqoreTier,
  args: {
    name: 'Basic',
    nameDetail: 'For Individuals',
    price: 3.99,
    currency: '$',
    salePrice: 'FREE',
    priceDetail: 'per month',
    description: 'This is a basic tier with limited features. Great for individuals',
    active: true,
    style: {
      width: '350px',
    },
    badge: [
      {
        label: 'Limited time deal',
        align: 'center',
      },
    ],
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

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tier in its default configuration.',
      },
    },
  },};
export const Group: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tier rendered inside a group.',
      },
    },
  },
  render: (args) => (
    <ReqoreColumns minColumnWidth='300px' columnsGap='15px' style={{ maxWidth: '1100px' }}>
      <ReqoreTier {...args} style={{}} />
      <ReqoreTier
        name='Pro'
        nameDetail='For Teams'
        price={219}
        currencyPosition='after'
        currency='Kc'
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
        highlight
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
        price={99}
        currency='FROM $'
        priceDetail='per month'
        description='This is an enterprise tier with all features necessary for your business.'
        actionButtonProps={{ label: 'Get In Touch' }}
        badge={[
          {
            label: 'Coming Soon',
            color: '#ff8000',
            align: 'center',
          },
        ]}
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
            content: 'Custom SLAs',
            intent: 'info',
            icon: 'StarLine',
          },
          {
            content: 'On-premises deployment options',
            intent: 'info',
            icon: 'StarLine',
          },
          {
            content: 'Advanced security features',
            intent: 'info',
            icon: 'StarLine',
          },
        ]}
      />
    </ReqoreColumns>
  ),
};

/* ------------------------------------------------------------------------------------------------
 * priceDetailEffect / priceDetailProps
 * ---------------------------------------------------------------------------------------------- */

const PLAN_FEATURES = [
  { icon: 'CheckLine' as const, content: '10,000 runs a month' },
  { icon: 'CheckLine' as const, content: 'Email support' },
];

const PriceDetailTiers = () => (
  <ReqoreColumns minColumnWidth='240px' columnsGap='15px' style={{ maxWidth: '1000px' }}>
    <ReqoreTier
      name='Default'
      price={49}
      currency='$'
      priceDetail='/ month'
      featureList={PLAN_FEATURES}
    />
    <ReqoreTier
      name='As written'
      price={49}
      currency='$'
      priceDetail='/ month'
      priceDetailEffect={{ uppercase: false }}
      featureList={PLAN_FEATURES}
    />
    <ReqoreTier
      name='Readable'
      price={49}
      currency='$'
      priceDetail='/ month, billed yearly'
      priceDetailProps={{ intent: undefined, size: 'normal' }}
      priceDetailEffect={{ uppercase: false, opacity: 0.75 }}
      featureList={PLAN_FEATURES}
    />
  </ReqoreColumns>
);

const priceDetails = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll('.reqore-tier-price-detail')) as HTMLElement[];

const expectPriceDetails = async (canvasElement: HTMLElement) => {
  const [muted, asWritten, readable] = priceDetails(canvasElement);
  const style = (element: HTMLElement) => getComputedStyle(element);

  await expect(muted.textContent).toBe('/ month');
  await expect(style(muted).textTransform).toBe('uppercase');
  await expect(style(asWritten).textTransform).toBe('none');
  // Still the muted colour: only the case changed.
  await expect(style(asWritten).color).toBe(style(muted).color);
  // No muted intent: the text colour, dimmed by the effect's opacity, at the normal size.
  await expect(style(readable).color).not.toBe(style(muted).color);
  await expect(style(readable).opacity).toBe('0.75');
  await expect(style(readable).fontSize).toBe('15px');
};

export const PriceDetailEffect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders three plans whose "/ month" line differs: the default small muted uppercase line, `priceDetailEffect={{ uppercase: false }}` keeping the text as written, and a readable one with `priceDetailProps` (no muted intent, normal size) and a dimming effect.',
      },
    },
  },
  render: PriceDetailTiers,
  play: async ({ canvasElement }) => expectPriceDetails(canvasElement),
};

export const PriceDetailEffectLight: Story = {
  args: { mainTheme: '#f4f4f4' } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          'Renders the three "/ month" lines on a light theme: the default muted line is pale grey, and the readable one, without the muted intent, is dark text at 75% opacity.',
      },
    },
  },
  render: PriceDetailTiers,
  play: async ({ canvasElement }) => expectPriceDetails(canvasElement),
};
