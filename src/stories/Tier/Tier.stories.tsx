import { StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';
import { ReqoreColumns, ReqoreControlGroup, ReqoreTier } from '../..';
import { StoryMeta } from '../utils';
import { expectModernRow, modernTiers, PRO, STARTER, THREE_PLANS } from './plans';

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

/* ------------------------------------------------------------------------------------------------
 * appearance="modern"
 * ---------------------------------------------------------------------------------------------- */

const ModernPlans = () => (
  <ReqoreColumns minColumnWidth='260px' columnsGap='20px' style={{ maxWidth: '1100px' }}>
    {THREE_PLANS.map((plan) => (
      <ReqoreTier key={plan.name} {...plan} appearance='modern' />
    ))}
  </ReqoreColumns>
);

export const Modern: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders three plans with `appearance="modern"` in a plain `ReqoreColumns` grid: left-aligned, the name a heading with its badge beside it, a large price with "/ month" on its baseline, and the buttons on one line at the bottom of equal-height cards. The highlighted Pro plan has its badge, a blue border, a faint wash, a soft shadow and a filled button, and is not scaled.',
      },
    },
  },
  render: ModernPlans,
  play: async ({ canvasElement }) => expectModernRow(canvasElement, 3),
};

export const ModernLight: Story = {
  args: { mainTheme: '#f4f4f4' } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          'Renders the three modern plans on a light theme: near-white cards with a hairline border, dark text, muted lines that keep a 4.5:1 contrast, and the highlighted plan washed and bordered in blue with a filled button.',
      },
    },
  },
  render: ModernPlans,
  play: async ({ canvasElement }) => expectModernRow(canvasElement, 3),
};

export const ModernStates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders four modern tiers in the states a pricing page needs: the active plan (a read-only "Active" button with a check), a sale ($19 with the original $29 struck through), a plan whose name is an `<h2>` (`labelSize={2}`) with a name detail and an orange "Coming soon" badge in its own colour, and a plan with an excluded feature (a muted cross) and a feature with an icon on the right.',
      },
    },
  },
  render: () => (
    <ReqoreColumns minColumnWidth='240px' columnsGap='20px' style={{ maxWidth: '1100px' }}>
      <ReqoreTier {...STARTER} appearance='modern' active intent='success' />
      <ReqoreTier
        {...PRO}
        appearance='modern'
        name='Pro (sale)'
        price={29}
        salePrice={19}
        badge='Save 34%'
      />
      <ReqoreTier
        appearance='modern'
        name='Business'
        nameDetail='For 50 people and more'
        labelSize={2}
        price={99}
        currency='€'
        currencyPosition='after'
        priceDetail='per seat / month'
        description='Everything a large team needs, on our infrastructure or yours.'
        badge={{ label: 'Coming soon', color: '#ff8000' }}
        actionLabel='Join the waitlist'
        featureList={[{ content: 'Unlimited runs' }, { content: 'Roles and an audit log' }]}
      />
      <ReqoreTier
        appearance='modern'
        name='Hobby'
        price='Free'
        currency='$'
        description='For side projects.'
        actionLabel='Start building'
        featureList={[
          { content: '1 workspace' },
          { content: '500 runs a month', rightIcon: 'InformationLine' },
          {
            content: 'Single sign-on',
            icon: 'CloseLine',
            iconProps: { intent: 'muted' },
            intent: 'muted',
          },
        ]}
      />
    </ReqoreColumns>
  ),
  play: async ({ canvasElement }) => {
    const [active, sale, business, hobby] = await waitFor(() => {
      const tiers = modernTiers(canvasElement);

      expect(tiers).toHaveLength(4);

      return tiers;
    });
    const button = (tier: HTMLElement) =>
      tier.querySelector('.reqore-tier-action .reqore-button') as HTMLButtonElement;

    // The active plan: its button says so, with a check, and does not offer itself.
    await expect(button(active).textContent).toContain('Active');
    await expect(button(active).querySelector('.reqore-icon')).toBeTruthy();
    await expect(getComputedStyle(button(active)).cursor).not.toBe('pointer');

    // The sale: the sale price first, the original struck through after it.
    await expect(sale.querySelector('.reqore-tier-price-value')!.textContent).toBe('$19');
    const original = sale.querySelector('del.reqore-tier-price-original') as HTMLElement;
    await expect(original.textContent).toBe('$29');
    await expect(getComputedStyle(original).textDecorationLine).toContain('line-through');

    // The name is a heading of the level asked for; the currency goes after the price.
    await expect(business.querySelector('h2.reqore-tier-name')!.textContent).toBe('Business');
    await expect(business.querySelector('.reqore-tier-name-detail')).toBeTruthy();
    await expect(business.querySelector('.reqore-tier-price-value')!.textContent).toBe('99€');
    await expect(business.querySelector('.reqore-tag')!.textContent).toContain('Coming soon');

    // A word for a price gets no currency; a right icon sits at the end of its feature.
    await expect(hobby.querySelector('.reqore-tier-price-value')!.textContent).toBe('Free');
    await expect(hobby.querySelectorAll('.reqore-tier-feature')).toHaveLength(3);
    await expect(
      hobby.querySelectorAll('.reqore-tier-feature')[1].querySelectorAll('.reqore-icon')
    ).toHaveLength(2);
  },
};

export const ModernSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the Pro plan in the modern appearance at `size` small, normal and big: the padding, the name, the price (32, 40 and 48px), the text and the button grow with it.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='big' verticalAlign='flex-start'>
      {(['small', 'normal', 'big'] as const).map((size) => (
        <div key={size} style={{ width: size === 'small' ? 260 : size === 'normal' ? 320 : 380 }}>
          <ReqoreTier {...PRO} appearance='modern' size={size} badge={size} />
        </div>
      ))}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const prices = await waitFor(() => {
      const found = Array.from(
        canvasElement.querySelectorAll('.reqore-tier-price-value')
      ) as HTMLElement[];

      expect(found).toHaveLength(3);

      return found;
    });

    await expect(prices.map((price) => getComputedStyle(price).fontSize)).toEqual([
      '32px',
      '40px',
      '48px',
    ]);
  },
};
